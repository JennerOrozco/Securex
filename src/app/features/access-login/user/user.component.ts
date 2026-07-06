import { Component, inject, OnInit, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@core/services/auth.service';
import { ResetPasswordModalComponent } from '@shared/modals/modal-shell/reset-password-modal/reset-password-modal.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { USER_ACCESS_COLS, createUserAccessForm } from './user.config';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CrudPageComponent, ResetPasswordModalComponent],
  templateUrl: './user.component.html',
  providers: [UnifiedCrudService]
})
export class SecurityUserCrudComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);
  private router = inject(Router);
  private localNotificationService = inject(NotificationService);
  crud = inject(UnifiedCrudService);

  resetModalVisible = false;
  resetModalItem: any = null;
  formInitialData: any = null;

  cols = USER_ACCESS_COLS;
  
  private parsedData = computed(() => {
    const rawCatalogs = this.crud.catalogItems();
    let pd: any = rawCatalogs['pageData'] || {};
    if (Array.isArray(pd)) pd = pd[0] || {};
    const catalogs: any = { ...rawCatalogs, ...pd };

    const currentCompany = this.authService.currentCompany();
    const matchedCompany = catalogs['companies']?.find((c: any) => c.uuid === currentCompany?.uuid);
    
    return { catalogs, matchedCompany };
  });

  formFields = computed(() => {
    const { catalogs, matchedCompany } = this.parsedData();
    return createUserAccessForm(catalogs, matchedCompany);
  });

  constructor() {
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
      mappingConfig: {
        pick: ['user_uuid', 'app_uuid', 'company_uuid', 'branch_uuid', 'role_uuid', 'status']
      },
      fnFetch: this.userService.getUserAccessesPaginated.bind(this.userService),
      fnCreate: (data) => this.saveSetting(null, data, 'add'),
      fnUpdate: (id, data) => this.saveSetting(id, data, 'edit'),
      fnDelete: this.userService.deleteUserAccessGql.bind(this.userService),
      fnCatalogs: {
        pageData: () => this.userService.getUserAccessPageData().pipe(
          switchMap((res: any) => {
            const companies = res.companies?.data ?? [];
            const users = res.users?.data ?? [];
            const apps = res.apps?.data ?? [];
            const branches = res.branches?.data ?? [];
            const matchedCompany = companies.find((c: any) => c.uuid === currentCompany?.uuid);

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
  }

  saveSetting(id: any, data: any, mode: 'add' | 'edit'): Observable<any> {
    // El payload ya viene filtrado mágicamente por el UnifiedCrudService gracias al mappingConfig.pick !
    const request$ = mode === 'add'
      ? this.userService.createUserAccessGql(data)
      : this.userService.updateUserAccessGql(id, data);

    return request$.pipe(
      map((res: any) => {
        if (mode === 'add') this.sendInvitationForNewAccess(data);
        return res;
      })
    );
  }

  onSelectGridEmptyFilter() {
    this.localNotificationService.notify('info', 'Crea el usuario desde "Usuarios (Admin)" y luego asígnalo aquí.');
    this.router.navigate(['/security/admin-users']);
  }

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

  handleResetPassword(item: any) {
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