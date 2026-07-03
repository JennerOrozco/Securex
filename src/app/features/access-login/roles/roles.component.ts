import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { RolePermissionsModalComponent } from '@shared/modals/modal-shell/role-permissions-modal/role-permissions-modal.component';
import { RoleService } from '@core/services/role.service';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { ROLE_FORM_FIELDS, ROLE_TABLE_COLUMNS, SystemRole } from './roles.config';
import { trackApi } from '@shared/utils/rxjs-utils';

@Component({
  selector: 'app-security-role-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, RolePermissionsModalComponent],
  templateUrl: './roles.component.html',
  providers: [UnifiedCrudService]
})
export class SecurityRoleCrudComponent implements OnInit {
  crud = inject(UnifiedCrudService<SystemRole>);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  
  destroyRef = inject(DestroyRef);
  notificationService = inject(NotificationService);

  cols = ROLE_TABLE_COLUMNS;
  formFields = ROLE_FORM_FIELDS;

  permModalVisible = false;
  selectedRole: SystemRole | null = null;
  isSaving = false;

  ngOnInit() {
    const companyUuid = this.authService.currentCompany()?.uuid ?? null;
    this.crud.initialize({
      resourceName: 'Rol',
      fnFetch: () => this.roleService.getRolesWithPermissions(companyUuid),
      fnCreate: this.roleService.createRoleGql.bind(this.roleService),
      fnUpdate: this.roleService.updateRoleGql.bind(this.roleService),
      fnDelete: this.roleService.deleteRoleGql.bind(this.roleService),
    });
    this.crud.load();
  }

  handleManagePermissions(item: SystemRole) {
    this.selectedRole = item;
    this.permModalVisible = true;
  }

  syncPermissions(ids: number[]) {
    if (!this.selectedRole) return;
    this.isSaving = true;
    this.roleService.syncRolePermissionsGql(this.selectedRole.uuid, ids)
      .pipe(trackApi(this, (s) => this.isSaving = s, 'Permisos sincronizados correctamente'))
      .subscribe({
        next: () => this.permModalVisible = false
      });
  }
}
