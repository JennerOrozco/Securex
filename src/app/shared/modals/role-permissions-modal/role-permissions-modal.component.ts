import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { SecurityService } from '../../../core/services/security.service';

interface ProcessedGroup {
  id: number;
  name: string;
  icon: string;
  type: string;
  items: any[]; 
  allActions: number[];
  expanded?: boolean;
}

@Component({
  selector: 'app-role-permissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, TooltipModule, CheckboxModule],
  styleUrls: ['../modals.css'],
  styles: [`
    .perm-search-wrap { position: relative; }
    .perm-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.75rem; pointer-events: none; }
    .perm-search { width: 100%; border: 1px solid rgba(226,232,240,0.9); border-radius: 8px; padding: 0.4rem 0.65rem 0.4rem 2rem; font-size: 0.8rem; color: #0f172a; background: rgba(248,250,252,0.75); outline: none; transition: all 0.2s; }
    .perm-search:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); background: #fff; }
    
    .gm-body { padding: 0rem 0rem 0rem !important; }

    /* Scope Color Coding classes directly on existing icons */
    .icon-menu {
      color: #6366f1 !important;
    }

    .icon-submenu {
      color: #10b981 !important;
    }

    .icon-action {
      color: #f59e0b !important;
    }

    .icon-component {
      color: #ef4444 !important;
    }

    /* TreeTable Container */
    .gm-treetable {
      width: 100%;
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.6);
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
    }

    /* Column definitions */
    .gm-tt-header, .gm-tt-row {
      display: flex;
      align-items: center;
      width: 100%;
      transition: background-color 0.2s;
    }

    .gm-tt-header {
      background: rgba(241, 245, 249, 0.9);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      height: 38px;
    }

    .gm-tt-row {
      height: 44px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.45);
      background: rgba(255, 255, 255, 0.25);
    }
    
    .gm-tt-row:last-child {
      border-bottom: none;
    }

    .gm-tt-row:hover {
      background: rgba(99, 102, 241, 0.03);
    }

    .gm-tt-col-name {
      flex: 1;
      display: flex;
      align-items: center;
      padding-left: 16px;
      min-width: 0;
      height: 100%;
    }

    .gm-tt-col-select {
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 100%;
      border-left: 1px solid rgba(226, 232, 240, 0.45);
    }

    /* Depths / Indentations */
    .gm-tt-row.depth-0 {
      padding-left: 0px;
      background: rgba(248, 250, 252, 0.55);
      font-weight: 700;
    }

    .gm-tt-row.depth-1 {
      padding-left: 28px;
      font-weight: 600;
    }

    .gm-tt-row.depth-2 {
      padding-left: 56px;
      font-weight: 500;
    }

    /* Chevrons */
    .gm-tt-chevron {
      font-size: 0.62rem;
      color: #94a3b8;
      cursor: pointer;
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      margin-right: 6px;
      border-radius: 4px;
      transition: transform 0.2s, background-color 0.15s;
    }

    .gm-tt-chevron:hover {
      background: rgba(148, 163, 184, 0.15);
      color: #475569;
    }

    .gm-tt-chevron.open {
      transform: rotate(90deg);
    }

    .gm-tt-chevron-placeholder {
      width: 20px;
      margin-right: 6px;
    }

    /* Checkbox Select */
    .gm-tt-checkbox {
      width: 18px;
      height: 18px;
      border-radius: 6px;
      border: 1.5px solid #cbd5e1;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.65rem;
      background: white;
      color: transparent;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    .gm-tt-checkbox:hover {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .gm-tt-checkbox.all {
      background: #323462;
      border-color: #323462;
      color: white;
      box-shadow: 0 2px 6px rgba(50, 52, 98, 0.25);
    }

    .gm-tt-checkbox.partial {
      background: rgba(50, 52, 98, 0.12);
      border-color: #323462;
      color: #323462;
    }
    
    .gm-tt-checkbox.action.all {
      background: #10b981;
      border-color: #10b981;
      color: white;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
    }

    /* Icon wrappers for modules - Menu Color Indigo */
    .gm-tt-icon-wrap {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      margin-right: 10px;
      flex-shrink: 0;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.22)) !important;
      border: 1px solid rgba(99, 102, 241, 0.25) !important;
      color: #6366f1 !important;
    }

    .gm-tt-icon-wrap.menu-type {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.22)) !important;
      border: 1px solid rgba(99, 102, 241, 0.25) !important;
      color: #6366f1 !important;
    }
    .gm-tt-icon-wrap.submenu-type {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.22)) !important;
      border: 1px solid rgba(16, 185, 129, 0.25) !important;
      color: #10b981 !important;
    }
    .gm-tt-icon-wrap.action-type {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.22)) !important;
      border: 1px solid rgba(245, 158, 11, 0.25) !important;
      color: #f59e0b !important;
    }
    .gm-tt-icon-wrap.component-type {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.22)) !important;
      border: 1px solid rgba(239, 68, 68, 0.25) !important;
      color: #ef4444 !important;
    }

    .gm-tt-name {
      font-size: 0.78rem;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .depth-2 .gm-tt-name {
      color: #475569;
    }

    .mod-purple { background: linear-gradient(135deg,#e0e7ff,#c7d2fe); color: #323462; }
    .mod-blue   { background: linear-gradient(135deg,#dbeafe,#bfdbfe); color: #1e40af; }
    .mod-green  { background: linear-gradient(135deg,#d1fae5,#a7f3d0); color: #065f46; }
    .mod-orange { background: linear-gradient(135deg,#fff7ed,#fed7aa); color: #9a3412; }
    .mod-pink   { background: linear-gradient(135deg,#fce7f3,#fbcfe8); color: #9d174d; }
    .mod-teal   { background: linear-gradient(135deg,#ccfbf1,#99f6e4); color: #134e4a; }
    .mod-red    { background: linear-gradient(135deg,#ffe4e6,#fecdd3); color: #9f1239; }
    .mod-slate  { background: linear-gradient(135deg,#f1f5f9,#e2e8f0); color: #334155; }
  `],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: '820px', maxHeight: '90vh' }"
      (onHide)="onClose.emit()"
      styleClass="gm-dialog gm-dialog--view"
      class="gm-dialog gm-dialog--view">

      <ng-template pTemplate="header">
        <div class="gm-header w-full">
          <div class="gm-header-icon mod-purple">
            <i class="pi pi-shield"></i>
          </div>
          <div class="gm-header-text flex-1 min-w-0">
            <span class="gm-header-badge gm-badge--view">Permisos de Seguridad</span>
            <p class="gm-title">{{ roleName }}</p>
          </div>
        </div>
      </ng-template>

      <div class="gm-body p-0" style="min-height:450px">
        <div class="p-3 border-b bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div class="flex items-center justify-between gap-4 mb-2">
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest m-0">Matriz de Acceso</p>
            <div class="flex gap-3">
              <button class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors" (click)="selectAll()">Marcar Todo</button>
              <button class="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors" (click)="clearAll()">Limpiar Todo</button>
            </div>
          </div>

          <div class="perm-search-wrap">
            <i class="pi pi-search perm-search-icon"></i>
            <input class="perm-search" type="text" placeholder="Filtrar por módulo, submenú o acción..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()">
          </div>
        </div>

        <div class="flex flex-col items-center justify-center p-20 gap-4" *ngIf="isLoading">
          <div class="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span class="text-xs font-medium text-slate-500">Cargando jerarquía de permisos...</span>
        </div>

        <div *ngIf="!isLoading" class="p-4">
          <div *ngIf="filteredGroups.length === 0" class="flex flex-col items-center p-12 text-slate-400">
            <i class="pi pi-filter-slash text-3xl mb-2"></i>
            <span class="text-sm">No se encontraron resultados para tu búsqueda.</span>
          </div>

          <!-- TreeTable Container -->
          <div *ngIf="filteredGroups.length > 0" class="gm-treetable">
            
            <!-- TreeTable Header -->
            <div class="gm-tt-header">
              <div class="gm-tt-col-name">Recurso / Módulo / Permiso</div>
              <div class="gm-tt-col-select">Estado de Acceso</div>
            </div>

            <!-- TreeTable Body -->
            <div class="gm-tt-body">
              <ng-container *ngFor="let group of filteredGroups; let gi = index">
                
                <!-- MODULE ROW (Depth 0) -->
                <div class="gm-tt-row depth-0">
                  <div class="gm-tt-col-name cursor-pointer" (click)="group.items.length > 0 ? (group.expanded = !group.expanded) : null">
                    <i *ngIf="group.items.length > 0" class="pi pi-chevron-right gm-tt-chevron" [class.open]="group.expanded"></i>
                    <div *ngIf="group.items.length === 0" class="gm-tt-chevron-placeholder"></div>
                    <div class="gm-tt-icon-wrap" [ngClass]="{
                      'menu-type': group.type === 'MENU',
                      'submenu-type': group.type === 'SUBMENU',
                      'action-type': group.type === 'ACTION',
                      'component-type': group.type === 'COMPONENT'
                    }">
                      <i [class]="getModuleIcon(group.name)"></i>
                    </div>
                    <span class="gm-tt-name">{{ group.name }}</span>
                  </div>
                  <div class="gm-tt-col-select">
                    <div class="gm-tt-checkbox"
                         [class.all]="isAllSelected(group.allActions)"
                         [class.partial]="isPartialSelected(group.allActions)"
                         (click)="$event.stopPropagation(); toggleBatch(group.allActions)">
                      <i class="pi"
                         [class.pi-check]="isAllSelected(group.allActions)"
                         [class.pi-minus]="isPartialSelected(group.allActions)"></i>
                    </div>
                  </div>
                </div>

                <!-- SUB-ITEMS (Rendered if expanded) -->
                <ng-container *ngIf="group.expanded">
                  <ng-container *ngFor="let item of group.items">
                    
                    <!-- SUBMENU ROW (Depth 1) -->
                    <ng-container *ngIf="item.type === 'SUBMENU'">
                      <div class="gm-tt-row depth-1">
                        <div class="gm-tt-col-name cursor-pointer" (click)="item.actions.length > 0 ? (item.expanded = !item.expanded) : null">
                          <i *ngIf="item.actions.length > 0" class="pi pi-chevron-right gm-tt-chevron" [class.open]="item.expanded"></i>
                          <div *ngIf="item.actions.length === 0" class="gm-tt-chevron-placeholder"></div>
                          <i class="pi pi-folder-open icon-submenu mr-2 text-[10px]"></i>
                          <span class="gm-tt-name">{{ item.name }}</span>
                        </div>
                        <div class="gm-tt-col-select">
                          <div class="gm-tt-checkbox"
                               [class.all]="isAllSelected(item.actionIds)"
                               [class.partial]="isPartialSelected(item.actionIds)"
                               (click)="$event.stopPropagation(); toggleBatch(item.actionIds)">
                            <i class="pi"
                               [class.pi-check]="isAllSelected(item.actionIds)"
                               [class.pi-minus]="isPartialSelected(item.actionIds)"></i>
                          </div>
                        </div>
                      </div>

                      <!-- ACTIONS UNDER SUBMENU (Depth 2, rendered if submenu expanded) -->
                      <ng-container *ngIf="item.expanded">
                        <div *ngFor="let action of item.actions" class="gm-tt-row depth-2">
                          <div class="gm-tt-col-name cursor-pointer" (click)="toggle(action.id)">
                            <div class="gm-tt-chevron-placeholder"></div>
                            <i class="pi pi-cog mr-2 text-[10px]"
                               [class.icon-menu]="action.type === 'MENU'"
                               [class.icon-submenu]="action.type === 'SUBMENU'"
                               [class.icon-action]="action.type === 'ACTION'"
                               [class.icon-component]="action.type === 'COMPONENT'"></i>
                            <span class="gm-tt-name">{{ action.name }}</span>
                          </div>
                          <div class="gm-tt-col-select">
                            <div class="gm-tt-checkbox action"
                                 [class.all]="selectedIds.has(action.id)"
                                 (click)="$event.stopPropagation(); toggle(action.id)">
                              <i class="pi pi-check" *ngIf="selectedIds.has(action.id)"></i>
                            </div>
                          </div>
                        </div>
                      </ng-container>
                    </ng-container>

                    <!-- DIRECT ACTIONS (Depth 1) -->
                    <ng-container *ngIf="item.type === 'DIRECT_ACTIONS'">
                      <div *ngFor="let action of item.actions" class="gm-tt-row depth-1">
                        <div class="gm-tt-col-name cursor-pointer" (click)="toggle(action.id)">
                          <div class="gm-tt-chevron-placeholder"></div>
                          <i class="pi pi-cog mr-2 text-[10px]"
                             [class.icon-menu]="action.type === 'MENU'"
                             [class.icon-submenu]="action.type === 'SUBMENU'"
                             [class.icon-action]="action.type === 'ACTION'"
                             [class.icon-component]="action.type === 'COMPONENT'"></i>
                          <span class="gm-tt-name">{{ action.name }}</span>
                        </div>
                        <div class="gm-tt-col-select">
                          <div class="gm-tt-checkbox action"
                               [class.all]="selectedIds.has(action.id)"
                               (click)="$event.stopPropagation(); toggle(action.id)">
                            <i class="pi pi-check" *ngIf="selectedIds.has(action.id)"></i>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                  </ng-container>
                </ng-container>

              </ng-container>
            </div>

          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="gm-footer py-2 px-4">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" styleClass="p-button-sm" (onClick)="onClose.emit()"></p-button>
          <p-button
            label="Guardar"
            icon="pi pi-save"
            severity="info"
            [loading]="loading"
            styleClass="p-button-sm"
            (onClick)="handleSave()">
          </p-button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class RolePermissionsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() roleId: any = null;
  @Input() roleName = '';
  @Input() loading = false;

  @Output() onSave = new EventEmitter<number[]>();
  @Output() onClose = new EventEmitter<void>();

  private securityService = inject(SecurityService);

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
    this.securityService.getRolePermissions(this.roleId).subscribe({
      next: (res) => {
        this.processPermissions(res);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  private processPermissions(data: any[]) {
    const processed: ProcessedGroup[] = [];

    data.forEach(node => {
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

        const directActions: any[] = [];
        
        (node.children || []).forEach((child: any) => {
          if (child.type === 'SUBMENU') {
            const submenu = {
              id: child.id,
              name: child.name,
              type: 'SUBMENU',
              expanded: false, // Ocultos por default
              actions: [] as any[],
              actionIds: [] as number[]
            };
            
            if (child.id) {
              group.allActions.push(child.id);
              submenu.actionIds.push(child.id);
              this.submenuIds.add(child.id);
              if (child.assigned) this.selectedIds.add(child.id);
            }

            (child.children || []).forEach((grandChild: any) => {
              submenu.actions.push(grandChild);
              submenu.actionIds.push(grandChild.id);
              group.allActions.push(grandChild.id);
              if (grandChild.assigned) this.selectedIds.add(grandChild.id);
            });
            group.items.push(submenu);
          } else {
            directActions.push(child);
            group.allActions.push(child.id);
            if (child.assigned) this.selectedIds.add(child.id);
          }
        });

        if (directActions.length > 0) {
          group.items.push({ type: 'DIRECT_ACTIONS', actions: directActions });
        }

        processed.push(group);
    });

    this.groups = processed;
    this.filteredGroups = [...this.groups];
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) { 
      this.filteredGroups = [...this.groups];
      return; 
    }
    
    const results: ProcessedGroup[] = [];

    this.groups.forEach(g => {
      const groupMatch = g.name.toLowerCase().includes(q);
      const matchedItems: any[] = [];
      let hasMatch = groupMatch;

      g.items.forEach(item => {
        if (item.type === 'SUBMENU') {
          const submenuMatch = item.name.toLowerCase().includes(q);
          const matchedActions = item.actions.filter((a: any) => a.name.toLowerCase().includes(q));
          
          if (submenuMatch || matchedActions.length > 0) {
            hasMatch = true;
            matchedItems.push({
              ...item,
              expanded: submenuMatch || matchedActions.length > 0,
              actions: matchedActions.length > 0 ? matchedActions : item.actions
            });
          } else if (groupMatch) {
            matchedItems.push({
              ...item,
              expanded: false
            });
          }
        } else if (item.type === 'DIRECT_ACTIONS') {
          const matchedActions = item.actions.filter((a: any) => a.name.toLowerCase().includes(q));
          if (matchedActions.length > 0) {
            hasMatch = true;
            matchedItems.push({
              ...item,
              actions: matchedActions
            });
          } else if (groupMatch) {
            matchedItems.push({
              ...item
            });
          }
        }
      });

      if (hasMatch) {
        results.push({
          ...g,
          expanded: true,
          items: matchedItems
        });
      }
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
