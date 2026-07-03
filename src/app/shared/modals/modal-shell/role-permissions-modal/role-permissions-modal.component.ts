import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RoleService } from '@core/services/role.service';
import { PermissionTreeComponent } from '@shared/components/permission-tree/permission-tree.component';
import { PermissionTreeNode } from '@shared/components/permission-tree/permission-tree.types';

@Component({
  selector: 'app-role-permissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, PermissionTreeComponent],
  templateUrl: './role-permissions-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolePermissionsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() roleId: any = null;
  @Input() roleName = '';
  @Input() loading = false;
  @Input() draggable = true;
  @Input() resizable = true;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<number[]>();
  @Output() onClose = new EventEmitter<void>();

  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  groups: PermissionTreeNode[] = [];
  isLoading = false;
  selectedIds: Set<number> = new Set();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && this.roleId) {
      this.loadPermissions();
    }
  }

  loadPermissions() {
    this.isLoading = true;
    this.groups = [];
    this.selectedIds = new Set();
    this.cdr.detectChanges();

    this.roleService.getRolePermissionsGql(this.roleId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.groups = this.processNodes(res);
          this.selectedIds = new Set(this.selectedIds);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { 
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private processNodes(data: any[]): PermissionTreeNode[] {
    const processNode = (node: any): PermissionTreeNode => {
      const children = node.children ? node.children.map(processNode) : [];
      const allIds = [node.id, ...children.flatMap((child: PermissionTreeNode) => child.allIds)];

      if (node.assigned) this.selectedIds.add(node.id);

      return {
        id: node.id,
        name: node.name,
        slug: node.slug || '',
        icon: node.icon,
        type: (node.type || 'MENU').toUpperCase(),
        children,
        allIds,
        expanded: false
      };
    };

    return data.map(n => processNode(n));
  }

  onSelectionChange(ids: Set<number>) {
    this.selectedIds = ids;
  }

  handleHide() {
    this.visibleChange.emit(false);
    this.onClose.emit();
  }

  handleSave() {
    this.onSave.emit(Array.from(this.selectedIds));
  }
}
