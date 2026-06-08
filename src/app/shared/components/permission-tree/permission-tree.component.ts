import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionTreeNode } from './permission-tree.types';

@Component({
  selector: 'app-permission-tree',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permission-tree.component.html'
})
export class PermissionTreeComponent implements OnChanges {
  @Input() groups: PermissionTreeNode[] = [];
  @Input() loading: boolean = false;
  @Input() searchPlaceholder: string = 'Filtrar por módulo, submenú o acción...';
  @Input() selectedIds: Set<number> | number[] = new Set();

  @Output() selectedIdsChange = new EventEmitter<Set<number>>();

  filteredGroups: PermissionTreeNode[] = [];
  searchQuery = '';
  _selectedIds: Set<number> = new Set();

  private parentMap = new Map<number, number | null>();
  private childrenMap = new Map<number, number[]>();

  private readonly moduleIcons: Record<string, string> = {
    usuario: 'pi pi-users', user: 'pi pi-users', rol: 'pi pi-shield', role: 'pi pi-shield',
    permiso: 'pi pi-key', empresa: 'pi pi-building', compan: 'pi pi-building',
    finanz: 'pi pi-wallet', finance: 'pi pi-wallet', product: 'pi pi-box',
    venta: 'pi pi-shopping-cart', compra: 'pi pi-cart-plus', proveedor: 'pi pi-truck',
    cliente: 'pi pi-user', sucursal: 'pi pi-map-marker', report: 'pi pi-chart-bar',
    config: 'pi pi-cog', admin: 'pi pi-sliders-h', notif: 'pi pi-bell', dashboard: 'pi pi-home',
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['groups']) {
      this.rebuildMaps();
      this.filteredGroups = [...this.groups];
    }
    if (changes['selectedIds']) {
      this._selectedIds = new Set(
        Array.isArray(this.selectedIds) ? this.selectedIds : [...this.selectedIds]
      );
    }
  }

  private rebuildMaps() {
    this.parentMap.clear();
    this.childrenMap.clear();

    const walk = (nodes: PermissionTreeNode[], parentId: number | null) => {
      for (const node of nodes) {
        this.parentMap.set(node.id, parentId);
        this.childrenMap.set(node.id, node.allIds);
        walk(node.children, node.id);
      }
    };

    walk(this.groups, null);
  }

  getModuleIcon(name: string): string {
    const lower = (name || '').toLowerCase();
    for (const [key, icon] of Object.entries(this.moduleIcons)) {
      if (lower.includes(key)) return icon;
    }
    return 'pi pi-folder';
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredGroups = [...this.groups];
      return;
    }

    const searchNode = (node: PermissionTreeNode): PermissionTreeNode | null => {
      const isMatch = node.name.toLowerCase().includes(q) || (node.slug || '').toLowerCase().includes(q);
      const matchedChildren: PermissionTreeNode[] = [];

      node.children.forEach(child => {
        const matched = searchNode(child);
        if (matched) matchedChildren.push(matched);
      });

      if (isMatch || matchedChildren.length > 0) {
        return {
          ...node,
          expanded: matchedChildren.length > 0 ? true : node.expanded,
          children: matchedChildren.length > 0 ? matchedChildren : node.children
        };
      }
      return null;
    };

    const results: PermissionTreeNode[] = [];
    this.groups.forEach(g => {
      const matched = searchNode(g);
      if (matched) results.push(matched);
    });

    this.filteredGroups = results;
  }

  getMatchCount(): number {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return 0;
    let count = 0;
    const scan = (node: PermissionTreeNode) => {
      if (node.name.toLowerCase().includes(q) || (node.slug || '').toLowerCase().includes(q)) count++;
      node.children.forEach(scan);
    };
    this.groups.forEach(scan);
    return count;
  }

  toggle(node: PermissionTreeNode) {
    const ids = node.allIds;
    const allSelected = this.isAllSelected(ids);
    ids.forEach(id => {
      if (allSelected) this._selectedIds.delete(id);
      else this._selectedIds.add(id);
    });
    this.emitChange();
  }

  toggleSingle(id: number) {
    if (this._selectedIds.has(id)) {
      this._selectedIds.delete(id);
      this.deselectChildren(id);
    } else {
      this._selectedIds.add(id);
      this.selectAllParents(id);
    }
    this.emitChange();
  }

  private selectAllParents(id: number) {
    let currentParent = this.parentMap.get(id);
    while (currentParent != null) {
      this._selectedIds.add(currentParent);
      currentParent = this.parentMap.get(currentParent);
    }
  }

  private deselectChildren(id: number) {
    const children = this.childrenMap.get(id) || [];
    children.forEach(childId => {
      if (childId !== id) {
        this._selectedIds.delete(childId);
      }
    });
  }

  isAllSelected(ids: number[]): boolean {
    return ids.length > 0 && ids.every(id => this._selectedIds.has(id));
  }

  isPartialSelected(ids: number[]): boolean {
    const count = ids.filter(id => this._selectedIds.has(id)).length;
    return count > 0 && count < ids.length;
  }

  isSelected(id: number): boolean {
    return this._selectedIds.has(id);
  }

  selectAll() {
    this.groups.forEach(g => g.allIds.forEach(id => this._selectedIds.add(id)));
    this.emitChange();
  }

  clearAll() {
    this._selectedIds.clear();
    this.emitChange();
  }

  private emitChange() {
    this.selectedIdsChange.emit(new Set(this._selectedIds));
  }
}
