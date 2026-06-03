import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { SecurexService } from '../../../../core/services/securex.service';

interface ProcessedGroup {
  id: number;
  name: string;
  icon: string;
  type: string;
  items: ProcessedGroup[]; 
  allActions: number[];
  expanded?: boolean;
}

@Component({
  selector: 'app-role-permissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TooltipModule, CheckboxModule],
  templateUrl: './role-permissions-modal.component.html',
  styleUrls: ['../../modals.css', './role-permissions-modal.component.css']
})
export class RolePermissionsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() roleId: any = null;
  @Input() roleName = '';
  @Input() loading = false;

  @Output() onSave = new EventEmitter<number[]>();
  @Output() onClose = new EventEmitter<void>();

  private securexService = inject(SecurexService);

  isLoading = false;
  searchQuery = '';
  selectedIds = new Set<number>();
  submenuIds = new Set<number>();
  
  groups: ProcessedGroup[] = [];
  filteredGroups: ProcessedGroup[] = [];

  private readonly moduleColors = ['mod-purple','mod-blue','mod-green','mod-orange','mod-pink','mod-teal','mod-red','mod-slate'];
  private readonly moduleIcons: Record<string, string> = {
    usuario: 'pi pi-users', user: 'pi pi-users', rol: 'pi pi-shield', role: 'pi pi-shield',
    permiso: 'pi pi-key', empresa: 'pi pi-building', compan: 'pi pi-building',
    finanz: 'pi pi-wallet', finance: 'pi pi-wallet', product: 'pi pi-box',
    venta: 'pi pi-shopping-cart', compra: 'pi pi-cart-plus', proveedor: 'pi pi-truck',
    cliente: 'pi pi-user', sucursal: 'pi pi-map-marker', report: 'pi pi-chart-bar',
    config: 'pi pi-cog', admin: 'pi pi-sliders-h', notif: 'pi pi-bell', dashboard: 'pi pi-home',
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true && this.roleId) {
      this.loadPermissions();
    }
  }

  loadPermissions() {
    this.isLoading = true;
    this.selectedIds = new Set();
    this.submenuIds = new Set();
    this.securexService.getRolePermissions(this.roleId).subscribe({
      next: (res) => {
        this.processPermissions(res);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private processPermissions(data: any[]) {
    const processNode = (node: any): ProcessedGroup => {
       const group: ProcessedGroup = {
          id: node.id,
          name: node.name,
          icon: node.icon,
          type: (node.type || 'MENU').toUpperCase(),
          items: [],
          allActions: [],
          expanded: false
       };

       if (node.id) {
          group.allActions.push(node.id);
          if (node.assigned) this.selectedIds.add(node.id);
       }

       if (node.children && node.children.length > 0) {
          node.children.forEach((child: any) => {
             const childGroup = processNode(child);
             group.items.push(childGroup);
             group.allActions.push(...childGroup.allActions);
          });
       }

       return group;
    };

    this.groups = data.map(n => processNode(n));
    this.filteredGroups = [...this.groups];
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { 
      this.filteredGroups = [...this.groups]; 
      return; 
    }

    const searchNode = (node: ProcessedGroup): ProcessedGroup | null => {
       const isMatch = node.name.toLowerCase().includes(q);
       const matchedItems: ProcessedGroup[] = [];
       
       node.items.forEach(child => {
          const matchedChild = searchNode(child);
          if (matchedChild) {
             matchedItems.push(matchedChild);
          }
       });

       if (isMatch || matchedItems.length > 0) {
          return {
             ...node,
             expanded: matchedItems.length > 0 ? true : node.expanded,
             items: matchedItems.length > 0 ? matchedItems : node.items
          };
       }
       return null;
    };

    const results: ProcessedGroup[] = [];
    this.groups.forEach(g => {
       const matched = searchNode(g);
       if (matched) results.push(matched);
    });

    this.filteredGroups = results;
  }

  toggle(id: number) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  getActiveSubmenuCount(): number {
    let count = 0;
    this.submenuIds.forEach(id => {
      if (this.selectedIds.has(id)) count++;
    });
    return count;
  }

  countActiveSubmenus(group: ProcessedGroup): number {
    return group.items.filter(i => i.type === 'SUBMENU' && this.selectedIds.has(i.id)).length;
  }

  countActiveActions(submenu: any): number {
    // We only count grand-children which are typically actions
    return submenu.actions.filter((a: any) => this.selectedIds.has(a.id)).length;
  }

  isAllSelected(ids: number[]): boolean {
    return ids.length > 0 && ids.every(id => this.selectedIds.has(id));
  }

  isPartialSelected(ids: number[]): boolean {
    const selectedCount = ids.filter(id => this.selectedIds.has(id)).length;
    return selectedCount > 0 && selectedCount < ids.length;
  }

  toggleBatch(ids: number[]) {
    const allSelected = this.isAllSelected(ids);
    ids.forEach(id => {
      if (allSelected) this.selectedIds.delete(id);
      else this.selectedIds.add(id);
    });
    this.selectedIds = new Set(this.selectedIds);
  }

  selectAll() {
    this.groups.forEach(g => g.allActions.forEach(id => this.selectedIds.add(id)));
    this.selectedIds = new Set(this.selectedIds);
  }

  clearAll() { this.selectedIds = new Set(); }

  getModuleClass(index: number): string {
    return this.moduleColors[index % this.moduleColors.length];
  }

  getModuleIcon(name: string): string {
    const lower = (name || '').toLowerCase();
    for (const [key, icon] of Object.entries(this.moduleIcons)) {
      if (lower.includes(key)) return icon;
    }
    return 'pi pi-folder';
  }

  handleSave() {
    this.onSave.emit(Array.from(this.selectedIds));
  }
}
