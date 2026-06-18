import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { RoleService } from '@core/services/role.service';
import { AuthService } from '@core/services/auth.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { RolePermissionsModalComponent } from '@shared/modals/modal-shell/role-permissions-modal/role-permissions-modal.component';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-role-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent, RolePermissionsModalComponent],
  templateUrl: './roles.component.html',
})
export class SecurityRoleCrudComponent implements OnInit {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  roles: any[] = [];
  loading = false;
  isSaving = false;

  permModalVisible = false;
  selectedItem: any = null;

  formFields: FormField[] = [
    { name: 'name', label: 'Nombre del Rol', type: 'text', required: true, icon: 'pi pi-tag' },
    { name: 'description', label: 'Descripción', type: 'textarea' }
  ];

  cols: TableColumn[] = [
    { field: 'name', header: 'Rol', type: 'role', sortable: true },
    { field: 'description', header: 'Descripción', type: 'text', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const companyUuid = this.authService.currentCompany()?.uuid ?? null;
    this.roleService.getRolesWithPermissions(companyUuid).subscribe({
      next: (res) => { this.roles = res; this.loading = false; },
      error: () => this.loading = false
    });
  }

  handleManagePermissions(item: any) {
    this.selectedItem = item;
    this.permModalVisible = true;
  }

  save(e: { mode: 'add' | 'edit'; data: any }) {
    this.isSaving = true;
    const obs = e.mode === 'add'
      ? this.roleService.createRoleGql(e.data)
      : this.roleService.updateRoleGql(e.data.uuid, e.data);

    obs.subscribe({
      next: () => {
        this.notificationService.notify('success', `Rol ${e.mode === 'add' ? 'creado' : 'actualizado'} correctamente`);
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  confirmDelete(item: any) {
    this.isSaving = true;
    this.roleService.deleteRoleGql(item.uuid).subscribe({
      next: () => {
        this.notificationService.notify('success', 'Rol eliminado');
        this.load();
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }

  syncPermissions(ids: number[]) {
    this.isSaving = true;
    this.roleService.syncRolePermissionsGql(this.selectedItem.uuid, ids).subscribe({
      next: () => {
        this.notificationService.notify('success', 'Permisos sincronizados correctamente');
        this.permModalVisible = false;
        this.isSaving = false;
      },
      error: () => this.isSaving = false
    });
  }
}
