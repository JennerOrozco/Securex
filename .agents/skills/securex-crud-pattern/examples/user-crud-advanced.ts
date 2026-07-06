// =============================================================================
// EJEMPLO REAL — Componente CRUD con catálogos encadenados y hooks post-save
// Fuente: src/app/features/access-login/user/user.component.ts
//
// Características demostradas en este ejemplo:
// - fnCatalogs con switchMap anidado (carga roles dependiendo de la empresa)
// - fnCreate/fnUpdate con lógica custom en saveSetting() antes de llamar al service
// - Uso de computed() para recalcular formFields cuando cambian los catálogos
// - effect() para inicializar formInitialData desde catálogos cargados
// - ChangeDetectionStrategy.OnPush
// - Modal adicional (ResetPasswordModal) junto al CRUD estándar
// =============================================================================

import { Component, inject, OnInit, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios de dominio
import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

// Componentes shared
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { ResetPasswordModalComponent } from '@shared/modals/modal-shell/reset-password-modal/reset-password-modal.component';

// CRUD base
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';

import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

// Config del feature (columnas + campos de formulario)
import { USER_ACCESS_COLS, createUserAccessForm } from './user.config';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,            // Siempre OnPush con Signals
  imports: [CommonModule, FormsModule, CrudPageComponent, ResetPasswordModalComponent],
  templateUrl: './user.component.html',
  providers: [UnifiedCrudService]                             // ← SIEMPRE en providers del componente
})
export class SecurityUserCrudComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private localNotificationService = inject(NotificationService);
  crud = inject(UnifiedCrudService);                          // ← público para usarlo en el template

  // Estado local del modal adicional (ResetPassword)
  resetModalVisible = false;
  resetModalItem: any = null;
  formInitialData: any = null;

  cols = USER_ACCESS_COLS;                                    // ← columnas estáticas van fuera de computed

  // ─── computed para transformar catálogos cargados en los formFields ───────
  // El truco aquí: los catálogos vienen anidados (pageData.companies, etc.)
  // así que los aplanamos antes de pasarlos a createUserAccessForm()
  private parsedData = computed(() => {
    const rawCatalogs = this.crud.catalogItems();             // Signal reactivo
    let pd: any = rawCatalogs['pageData'] || {};
    if (Array.isArray(pd)) pd = pd[0] || {};
    const catalogs: any = { ...rawCatalogs, ...pd };          // Aplanar datos anidados

    const currentCompany = this.authService.currentCompany();
    const matchedCompany = catalogs['companies']?.find((c: any) => c.uuid === currentCompany?.uuid);

    return { catalogs, matchedCompany };
  });

  // formFields es computed: se recalcula automáticamente cuando los catálogos cambian
  formFields = computed(() => {
    const { catalogs, matchedCompany } = this.parsedData();
    return createUserAccessForm(catalogs, matchedCompany);
  });

  constructor() {
    // effect() para side-effects reactivos: pre-llenar datos del formulario con la empresa activa
    effect(() => {
      const { matchedCompany } = this.parsedData();
      if (matchedCompany) {
        this.formInitialData = {
          app_uuid: matchedCompany.app_uuid ?? matchedCompany.uuid ?? null,
          company_uuid: matchedCompany.uuid,
          status: 'APPROVED'
        };
      }
    });
  }

  ngOnInit(): void {
    const currentCompany = this.authService.currentCompany();

    this.crud.initialize({
      resourceName: 'Acceso de Usuario',
      defaultSortKey: 'id',

      // mappingConfig.pick: filtra el payload antes de enviarlo al backend.
      // Solo estos campos llegarán a fnCreate/fnUpdate.
      mappingConfig: {
        pick: ['user_uuid', 'app_uuid', 'company_uuid', 'branch_uuid', 'role_uuid', 'status']
      },

      fnFetch: this.userService.getUserAccessesPaginated.bind(this.userService),

      // Cuando necesitas lógica extra ANTES de guardar, envuelves en método propio.
      // El UnifiedCrudService llama a estos métodos con el data ya filtrado por mappingConfig.
      fnCreate: (data) => this.saveSetting(null, data, 'add'),
      fnUpdate: (id, data) => this.saveSetting(id, data, 'edit'),
      fnDelete: this.userService.deleteUserAccessGql.bind(this.userService),

      fnCatalogs: {
        // Un solo catálogo 'pageData' que trae múltiples recursos en una query:
        pageData: () => this.userService.getUserAccessPageData().pipe(
          switchMap((res: any) => {
            const companies = res.companies?.data ?? [];
            const users = res.users?.data ?? [];
            const apps = res.apps?.data ?? [];
            const branches = res.branches?.data ?? [];
            const matchedCompany = companies.find((c: any) => c.uuid === currentCompany?.uuid);

            // Carga dinámica secundaria: los roles dependen de la empresa
            if (matchedCompany && currentCompany?.uuid) {
              return this.roleService.getRolesByCompany(matchedCompany.app_id, currentCompany.uuid).pipe(
                catchError(() => of([])),
                map(roles => ({ companies, users, apps, branches, roles }))
              );
            }
            return of({ companies, users, apps, branches });
          })
        )
      }
    });

    this.crud.load();                                         // ← siempre llamar al final de initialize()
  }

  // ─── Lógica custom de guardado ────────────────────────────────────────────
  // Patrón cuando necesitas hacer algo extra después del save (ej: enviar email)
  saveSetting(id: any, data: any, mode: 'add' | 'edit'): Observable<any> {
    const request$ = mode === 'add'
      ? this.userService.createUserAccessGql(data)
      : this.userService.updateUserAccessGql(id, data);

    return request$.pipe(
      map((res: any) => {
        if (mode === 'add') this.sendInvitationForNewAccess(data);  // Side-effect post-create
        return res;
      })
    );
  }

  // ─── Handler del select-grid cuando no encuentra usuarios ────────────────
  // Útil cuando usas 'select-grid' y el usuario no existe todavía
  onSelectGridEmptyFilter() {
    this.localNotificationService.notify('info', 'Crea el usuario desde "Usuarios (Admin)" y luego asígnalo aquí.');
    this.router.navigate(['/security/admin-users']);
  }

  // ─── Lógica privada de invitación ────────────────────────────────────────
  private sendInvitationForNewAccess(data: any) {
    const userOption: any = this.formFields()
      .find((f: any) => f.name === 'user_uuid')?.options
      ?.find((o: any) => o.value === data.user_uuid);

    const email = userOption?.email;
    if (!email) {
      this.localNotificationService.notify('warn', 'No se encontró el email del usuario para enviar la invitación.');
      return;
    }

    this.authService.adminResetUserPassword(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.localNotificationService.success(`Código de invitación enviado a ${email}`);
        } else {
          this.localNotificationService.notify('error', res.error || 'No se pudo enviar la invitación.');
        }
      },
      error: (err: any) => {
        this.localNotificationService.notify('error', `Error al enviar invitación: ${err?.message || 'Error de conexión'}`);
      }
    });
  }

  // ─── Modal adicional (ResetPassword) — fuera del flujo CRUD estándar ─────
  handleResetPassword(item: any) {
    // crud.formMapper.extractValue() navega objetos anidados con dot-notation
    const email = this.crud.formMapper.extractValue(item, ['email', 'user.email']);
    if (!email) {
      this.localNotificationService.notify('warn', 'No se encontró el correo del usuario.');
      return;
    }
    this.resetModalItem = item;
    this.resetModalVisible = true;
  }

  closeResetModal() {
    this.resetModalVisible = false;
    this.resetModalItem = null;
  }
}
