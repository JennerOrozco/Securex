import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { AuthService } from '@core/services/auth.service';
import { TreeTableComponent } from '@shared/table-shared/tree-table-component/tree-table-component.component';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [CommonModule, TableComponent, FormModalComponent, DeleteModalComponent, TreeTableComponent],
  templateUrl: './crud-page.component.html'
})
export class CrudPageComponent {
  private authService = inject(AuthService);

  // ── Permission gate ────────────────────────────────────────
  @Input() permission: string = '';
  @Input() permissionMessage: string = 'No tienes permisos para acceder a este módulo.';

  private _hasPermission: boolean | null = null;
  @Input() set hasPermission(val: boolean) {
    this._hasPermission = val;
  }

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
  @Input() showPermissions: boolean = false;
  @Input() showView: boolean = false;

  // ── Tree Table (Optional) ──────────────────────────────────
  @Input() isTreeTable: boolean = false;
  @Input() treeNodes: TreeNode[] = [];
  @Input() colorRows: boolean = false;
  @Input() showLegend: boolean = true;

  // ── Form modal ─────────────────────────────────────────────
  @Input() formFields: FormField[] = [];
  @Input() formAddTitle: string = '';
  @Input() formEditTitle: string = '';
  @Input() formExtraData: any = null;
  @Input() customFormValid: boolean | null = null;
  @Input() mapItemForEdit: (item: any) => any = (item) => item;

  private _isSaving = false;
  @Input() set isSaving(val: boolean) {
    const wasSaving = this._isSaving;
    this._isSaving = val;
    if (wasSaving && !val && this.modalVisible) {
      this.modalVisible = false;
    }
  }
  get isSaving(): boolean {
    return this._isSaving;
  }

  // ── Delete modal ───────────────────────────────────────────
  @Input() deleteTitle: string = 'Eliminar Registro';
  @Input() deleteMessage: string | ((item: any) => string) = '¿Eliminar este registro?';
  @Input() minimalMode: boolean = false;
  @Input() reorderableColumns: boolean = true;

  // ── Toggles ────────────────────────────────────────────────
  @Input() hidePermissionGate: boolean = false;

  // ── Outputs ────────────────────────────────────────────────
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onSave = new EventEmitter<{ mode: 'add' | 'edit'; data: any }>();
  @Output() onConfirmDelete = new EventEmitter<any>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onColReorder = new EventEmitter<any>();
  @Output() onCloseModal = new EventEmitter<void>();

  @Output() onAddRoot = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<number>();
  @Output() onNodeReorder = new EventEmitter<any>();

  // ── Internal state ─────────────────────────────────────────
  modalVisible = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedItem: any = null;

  get hasPermission(): boolean {
    if (this._hasPermission !== null) return this._hasPermission;
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

  handleTreeAddRoot(): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAddRoot.emit();
  }

  handleTreeAddChild(parentId: number): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAddChild.emit(parentId);
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
    const finalData = this.modalMode === 'edit' && this.selectedItem
      ? { ...this.selectedItem, ...data }
      : data;
    this.onSave.emit({ mode: this.modalMode as 'add' | 'edit', data: finalData });
  }

  handleConfirmDelete(): void {
    this.onConfirmDelete.emit(this.selectedItem);
  }

  handleCloseModal(): void {
    this.modalVisible = false;
    this.onCloseModal.emit();
  }
}
