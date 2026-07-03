import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionService } from '@core/services/permission.service';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { mapToTreeNodes, filterTreeByQuery } from '@shared/utils/tree-utils';
import { PERMISSION_TABLE_COLUMNS, PERMISSION_FORM_FIELDS, SystemPermission } from './permissions.config';
import { trackApi } from '@shared/utils/rxjs-utils';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-security-permission-crud',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  templateUrl: './permissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UnifiedCrudService]
})
export class SecurityPermissionCrudComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private notificationService = inject(NotificationService);
  crud = inject(UnifiedCrudService);

  formFields = PERMISSION_FORM_FIELDS;
  cols = PERMISSION_TABLE_COLUMNS;

  private rawItems: SystemPermission[] = [];

  ngOnInit() {
    this.crud.initialize({
      resourceName: 'Permiso',
      isTreeMode: true,
      fnFetchTree: () => this.permissionService.getPermissionsTree(),
      fnCreate: (data) => this.permissionService.createPermissionGql(data),
      fnUpdate: (id, data) => this.permissionService.updatePermissionGql(id, data),
      fnDelete: (id) => this.permissionService.deletePermissionGql(id),
      mapTreeFn: (items: any[]) => {
        this.rawItems = items;
        return mapToTreeNodes(items, {
          canAdd: (p: any) => p.type !== 'ACTION',
          expanded: () => false
        });
      }
    });

    this.crud.load();
  }

  filterByType(type: string): void {
    const all = this.rawItems;
    if (!type) {
      const nodes = mapToTreeNodes(all, { canAdd: (p: any) => p.type !== 'ACTION', expanded: () => false });
      this.crud.items.set(nodes);
    } else {
      const filtered = filterTreeByQuery(all, type).filter((p: any) => p.type === type);
      const nodes = mapToTreeNodes(filtered, { canAdd: (p: any) => p.type !== 'ACTION', expanded: () => false });
      this.crud.items.set(nodes);
    }
  }

  handleNodeReorder(event: any): void {
    const node = event.dragNode;
    const parent = event.dropNode;
    const parentId = parent?.id || null;

    if (!node || !node.uuid) return;

    this.crud.isSaving.set(true);
    this.permissionService.reorderPermission(node.uuid, parentId, 0)
      .pipe(trackApi(this.crud, (s: boolean) => this.crud.isSaving.set(s), 'Estructura reordenada correctamente'))
      .subscribe({
        next: () => this.crud.load(),
        error: () => this.crud.isSaving.set(false)
      });
  }
}