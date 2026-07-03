import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { PermissionService } from '@core/services/permission.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { BaseNotificationConfigComponent } from '@shared/utils/base-notification-config';
import { mapToTreeNodes, filterTreeByQuery } from '@shared/utils/tree-utils';
import { PERMISSION_TABLE_COLUMNS, PERMISSION_FORM_FIELDS, SystemPermission } from './permissions.config';
import { trackApi } from '@shared/utils/rxjs-utils';

@Component({
  selector: 'app-security-permission-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './permissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityPermissionCrudComponent extends BaseNotificationConfigComponent<SystemPermission> {
  private permissionService = inject(PermissionService);

  get resourceName(): string { return 'Permiso'; }

  formFields = PERMISSION_FORM_FIELDS;
  cols = PERMISSION_TABLE_COLUMNS;

  override isTreeTable = true;
  protected override autoLoadOnInit = true;

  override loadTreeData(): Observable<any[]> {
    return this.permissionService.getPermissionsTree();
  }
  
  override mapToTreeNodes(items: any[]): TreeNode[] {
    return mapToTreeNodes(items, {
      canAdd: (p) => p.type !== 'ACTION',
      expanded: () => false
    });
  }
  
  override fnCreate = this.permissionService.createPermissionGql.bind(this.permissionService);
  override fnUpdate = this.permissionService.updatePermissionGql.bind(this.permissionService);
  override fnDelete = this.permissionService.deletePermissionGql.bind(this.permissionService);

  filterByType(type: string): void {
    const all = this.rawItems as SystemPermission[];
    if (!type) {
      this.treeData = this.mapToTreeNodes(all);
    } else {
      const filtered = filterTreeByQuery(all, type).filter((p: any) => p.type === type);
      this.treeData = this.mapToTreeNodes(filtered);
    }
    this.cdr.markForCheck();
  }

  handleNodeReorder(event: any): void {
    const node = event.dragNode;
    const parent = event.dropNode;
    const parentId = parent?.id || null;

    if (!node || !node.uuid) return;

    this.permissionService.reorderPermission(node.uuid, parentId, 0)
      .pipe(trackApi(this, (s: boolean) => this.isSaving = s, 'Estructura reordenada correctamente'))
      .subscribe({
        next: () => this.load()
      });
  }
}