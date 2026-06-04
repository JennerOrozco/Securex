import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '@shared/table-component/table-component.component';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent],
  templateUrl: './crud-page.component.html'
})
export class CrudPageComponent {
  private authService = inject(AuthService);

  // ── Permission gate ────────────────────────────────────────
  @Input() permission: string = '';

  // ── Table ──────────────────────────────────────────────────
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() addLabel: string = 'Nuevo';
  @Input() showAdd: boolean = true;
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;

  // ── Form modal ─────────────────────────────────────────────
  @Input() formFields: FormField[] = [];
  @Input() formAddTitle: string = '';
  @Input() formEditTitle: string = '';
  @Input() formExtraData: any = null;
  @Input() isSaving: boolean = false;
  @Input() customFormValid: boolean | null = null;
  @Input() mapItemForEdit: (item: any) => any = (item) => item;

  // ── Delete modal ───────────────────────────────────────────
  @Input() deleteTitle: string = 'Eliminar Registro';
  @Input() deleteMessage: string | ((item: any) => string) = '¿Eliminar este registro?';

  // ── Toggles ────────────────────────────────────────────────
  @Input() hidePermissionGate: boolean = false;

  // ── Outputs ────────────────────────────────────────────────
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onSave = new EventEmitter<{ mode: 'add' | 'edit'; data: any }>();
  @Output() onConfirmDelete = new EventEmitter<any>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onCloseModal = new EventEmitter<void>();

  // ── Internal state ─────────────────────────────────────────
  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  get hasPermission(): boolean {
    if (!this.permission) return true;
    return this.authService.checkPermission(this.permission);
  }

  get resolvedDeleteMessage(): string {
    if (typeof this.deleteMessage === 'function') {
      return this.deleteMessage(this.selectedItem);
    }
    return this.deleteMessage;
  }

  get resolvedFormTitle(): string {
    return this.modalMode === 'add' ? this.formAddTitle : this.formEditTitle;
  }

  get resolvedFormData(): any {
    return this.modalMode === 'edit' ? this.selectedItem : null;
  }

  // ── Public handlers (called by template) ───────────────────
  handleAdd(): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAdd.emit();
  }

  handleEdit(item: any): void {
    this.modalMode = 'edit';
    this.selectedItem = this.mapItemForEdit(item);
    this.modalVisible = true;
    this.onEdit.emit(item);
  }

  handleDelete(item: any): void {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
    this.onDelete.emit(item);
  }

  handleSave(data: any): void {
    this.onSave.emit({ mode: this.modalMode as 'add' | 'edit', data });
  }

  handleConfirmDelete(): void {
    this.onConfirmDelete.emit(this.selectedItem);
  }

  handleCloseModal(): void {
    this.modalVisible = false;
    this.onCloseModal.emit();
  }
}
