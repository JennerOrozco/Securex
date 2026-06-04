import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { SecurexService } from '@core/services/securex.service';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { NotificationService } from '@core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-security-user-crud',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './component.html',

})
export class SecurityUserCrudComponent implements OnInit {
  private securexService = inject(SecurexService);
  private notificationService = inject(NotificationService);

  users: any[] = [];
  roles: any[] = [];
  branches: any[] = [];
  loading = false;
  isSaving = false;

  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  addFormFields: FormField[] = [
    { name: 'full_name', label: 'Nombre Completo', type: 'text', required: true, icon: 'pi pi-user' },
    { name: 'email', label: 'Correo Electrónico', type: 'email', required: true, icon: 'pi pi-envelope' },
    { name: 'role_id', label: 'Rol Asignado', type: 'select', required: true, options: [] },
    { name: 'branch_id', label: 'Sucursal', type: 'select', options: [] }
  ];

  editFormFields: FormField[] = [
    { name: 'full_name', label: 'Usuario', type: 'text', disabled: true, icon: 'pi pi-user' },
    { name: 'role_id', label: 'Rol Asignado', type: 'select', required: true, options: [] },
    { name: 'branch_id', label: 'Sucursal', type: 'select', options: [] },
    { name: 'status', label: 'Estado', type: 'select', required: true, options: [
      { label: 'Aprobado (APPROVED)', value: 'APPROVED' },
      { label: 'Pendiente (PENDING)', value: 'PENDING' },
      { label: 'Rechazado (REJECTED)', value: 'REJECTED' }
    ] }
  ];

  cols: TableColumn[] = [
    { field: 'full_name', header: 'Usuario', type: 'user', subField: 'email', sortable: true },
    { field: 'role_name', header: 'Rol Actual', type: 'role', sortable: true },
    { field: 'branch_name', header: 'Sucursal', type: 'text', sortable: true },
    { field: 'status', header: 'Estado', type: 'status', sortable: true },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  private ensureRolesAndBranchesLoaded(callback: () => void) {
    if (this.roles.length > 0 && this.branches.length > 0) {
      callback();
      return;
    }

    forkJoin({
      roles: this.securexService.getRolesWithPermissions(),
      branches: this.securexService.getCompanyBranches()
    }).subscribe({
      next: (res) => {
        this.roles = res.roles;
        const roleOptions = this.roles.map(r => ({ label: r.name, value: r.id }));
        this.addFormFields.find(f => f.name === 'role_id')!.options = roleOptions;
        this.editFormFields.find(f => f.name === 'role_id')!.options = roleOptions;

        const branchList = res.branches.data ?? res.branches;
        this.branches = branchList;
        const branchOptions = branchList.map((b: any) => ({ label: b.name, value: b.id }));
        const finalBranchOptions = [{ label: 'Ninguna (Sin Sucursal)', value: null }, ...branchOptions];
        this.addFormFields.find(f => f.name === 'branch_id')!.options = finalBranchOptions;
        this.editFormFields.find(f => f.name === 'branch_id')!.options = finalBranchOptions;

        callback();
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.securexService.getUsersWithRoles().subscribe({
      next: (res) => {
        this.users = res.map((u: any) => ({
          ...u,
          access_uuid: u.access?.[0]?.uuid,
          role_name: u.access?.[0]?.role?.name || 'Sin Rol',
          role_id: u.access?.[0]?.role?.id,
          branch_name: u.access?.[0]?.branch?.name || 'Sin Sucursal',
          branch_id: u.access?.[0]?.branch_id,
          status: u.access?.[0]?.status || 'PENDING'
        }));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  handleAdd() {
    this.ensureRolesAndBranchesLoaded(() => {
      this.modalMode = 'add';
      this.selectedItem = null;
      this.modalVisible = true;
    });
  }

  handleEdit(item: any) {
    this.ensureRolesAndBranchesLoaded(() => {
      this.modalMode = 'edit';
      this.selectedItem = { ...item };
      this.modalVisible = true;
    });
  }

  handleDelete(item: any) { this.modalMode = 'delete'; this.selectedItem = item; this.modalVisible = true; }

  save(data: any) {
    this.isSaving = true;
    if (this.modalMode === 'add') {
      this.securexService.createUser(data).subscribe({
        next: () => this.handleSuccess('Usuario invitado. Se ha enviado un correo con su código de activación.'),
        error: () => this.isSaving = false
      });
    } else {
      const updateData = {
        role_id: data.role_id,
        branch_id: data.branch_id ?? null,
        status: data.status
      };
      const accessUuid = this.selectedItem.access_uuid;
      if (!accessUuid) {
        this.notificationService.notify('error', 'No se encontró el registro de acceso del usuario');
        this.isSaving = false;
        return;
      }
      this.securexService.updateUserAccess(accessUuid, updateData).subscribe({
        next: () => this.handleSuccess('Usuario actualizado'),
        error: () => this.isSaving = false
      });
    }
  }

  confirmDelete() {
    this.isSaving = true;
    this.securexService.deleteUserGql(this.selectedItem.uuid).subscribe({
      next: () => this.handleSuccess('Acceso eliminado'),
      error: () => this.isSaving = false
    });
  }

  private handleSuccess(msg: string) {
    this.notificationService.notify('success', msg);
    this.loadUsers();
    this.modalVisible = false;
    this.isSaving = false;
  }
}