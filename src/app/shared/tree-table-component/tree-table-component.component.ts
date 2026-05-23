import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';

export interface TreeTableColumn {
  field: string;
  header: string;
  type?: 'text' | 'tree' | 'badge' | 'actions' | 'link' | 'status' | 'image' | 'date' | 'boolean';
  sortable?: boolean;
  filterOptions?: any[];
  style?: any;
}

@Component({
  selector: 'app-tree-table-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeTableModule,
    ButtonModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  styleUrls: ['./tree-table-component.component.css'],
  template: `
    <div class="perm-card">
      <!-- HEADER -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div>
            <h2 class="toolbar-title">{{ title }}</h2>
            <p class="toolbar-sub">{{ subtitle }}</p>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="search-box">
            <i class="pi pi-search search-ic"></i>
            <input
              pInputText
              type="text"
              (input)="onSearch($event)"
              [placeholder]="searchPlaceholder"
              class="search-inp"
            />
          </div>
          <button class="btn-new" (click)="onAddRoot.emit()">
            <i class="pi pi-plus"></i> {{ addLabel }}
          </button>
        </div>
      </div>

      <!-- LEGEND / ACTION TYPES THEAD -->
      @if (showLegend) {
        <div class="types-legend-bar">
          <div class="legend-label">Tipos de acción:</div>
          <div class="legend-items">
            <div class="legend-item" (click)="filterByType('MENU')">
              <span class="type-chip type-menu">MENU</span>
              <span class="legend-desc">Módulo Sidebar</span>
            </div>
            <div class="legend-item" (click)="filterByType('SUBMENU')">
              <span class="type-chip type-submenu">SUBMENU</span>
              <span class="legend-desc">Ítem Interno</span>
            </div>
            <div class="legend-item" (click)="filterByType('ACTION')">
              <span class="type-chip type-action">ACTION</span>
              <span class="legend-desc">Botón / Proceso</span>
            </div>
            <div class="legend-item" (click)="filterByType('COMPONENT')">
              <span class="type-chip type-component">COMPONENT</span>
              <span class="legend-desc">UI / Visual</span>
            </div>
          </div>
        </div>
      }

      <!-- TREE TABLE -->
      <div class="p-0">
        <p-treeTable 
          [value]="nodes" 
          [columns]="columns"
          [loading]="loading"
          [scrollable]="true"
          [scrollHeight]="scrollHeight"
          [paginator]="true" 
          [rows]="rows"
          [rowsPerPageOptions]="[5, 10, 20, 50]"
          [resizableColumns]="true"
          columnResizeMode="expand"
          [sortField]="sortField"
          [sortOrder]="sortOrder"
          class="gm-treetable">
          <ng-template pTemplate="header">
            <tr>
              @for (col of columns; track $index) {
                <th ttResizableColumn [style]="col.style" [class.sortable]="col.sortable" (click)="col.sortable && sortByField(col.field, $event)">
                  <div class="th-content">
                    <span>{{ col.header }}</span>
                    @if (col.sortable) {
                      <i class="pi" [class.pi-sort-alt]="sortField !== col.field" [class.pi-sort-up]="sortField === col.field && sortOrder === 1" [class.pi-sort-down]="sortField === col.field && sortOrder === -1"></i>
                    }
                  </div>
                </th>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
            <tr [ttRow]="rowNode" (click)="onRowClick($event, rowData)" (contextmenu)="onRowContextMenu($event, rowData)"
              [attr.draggable]="dragdrop && rowData._canReorder !== false ? true : null"
              [class.drag-over]="dragOverNode === rowData"
              (dragstart)="onRowDragStart($event, rowData)"
              (dragover)="onRowDragOver($event, rowData)" 
              (dragleave)="onRowDragLeave($event)"
              (drop)="onRowDrop($event, rowData)">
              @for (col of columns; track $index; let first = $first) {
                <td [style]="col.style">
                  @switch (col.type) {
                    @case ('tree') {
                      <div class="node-content">
                        <p-treeTableToggler [rowNode]="rowNode"></p-treeTableToggler>
                        <div class="node-icon-wrap" [ngClass]="getIconBg(rowData.type)">
                          <i [class]="rowData.icon || 'pi pi-tag'"></i>
                        </div>
                        <div class="flex flex-col">
                          <span class="node-name">{{ rowData[col.field] }}</span>
                          @if (rowData.slug) {
                            <span class="node-slug">{{ rowData.slug }}</span>
                          }
                        </div>
                      </div>
                    }
                    @case ('badge') {
                      @if (rowData[col.field]) {
                        <span class="type-chip" [ngClass]="'type-' + rowData[col.field]?.toString()?.toLowerCase()">
                          {{ rowData[col.field] }}
                        </span>
                      }
                    }
                    @case ('link') {
                      <div>
                        @if (rowData[col.field]) {
                          <a class="route-link" [pTooltip]="'Ir a ' + rowData[col.field]">
                            <i class="pi pi-external-link"></i>
                            <span>{{ rowData[col.field] }}</span>
                          </a>
                        } @else {
                          <span class="body-text text-muted">-</span>
                        }
                      </div>
                    }
                    @case ('actions') {
                      <div class="actions justify-center">
                        @if (rowData._canAdd !== false) {
                          <button 
                            class="act-btn view" 
                            pTooltip="Agregar Sub-elemento"
                            tooltipPosition="top"
                            (click)="onAddChild.emit(rowData.id)">
                            <i class="pi pi-plus"></i>
                          </button>
                        }
                        @if (rowData._canEdit !== false) {
                          <button 
                            class="act-btn edit" 
                            pTooltip="Editar"
                            tooltipPosition="top"
                            (click)="onEdit.emit(rowData)">
                            <i class="pi pi-pencil"></i>
                          </button>
                        }
                        @if (rowData._canDelete !== false) {
                          <button 
                            class="act-btn del" 
                            pTooltip="Eliminar"
                            tooltipPosition="top"
                            (click)="onDelete.emit(rowData)">
                            <i class="pi pi-trash"></i>
                          </button>
                        }
                      </div>
                    }
                    @default {
                      <span class="body-text">{{ rowData[col.field] }}</span>
                    }
                  }
                </td>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="columns.length">
                <div class="empty-state">
                  <i class="pi pi-shield empty-icon"></i>
                  <p class="text-xl font-bold text-slate-700 mb-1">Sin Registros</p>
                  <p class="text-sm text-slate-400">No hay información jerárquica para mostrar.</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-treeTable>
      </div>

      @if (draggedNode) {
        <div class="root-drop-zone"
          (dragover)="onRootDragOver($event)"
          (dragleave)="onRootDragLeave($event)"
          (drop)="onRootDrop($event)"
          [class.drag-over]="dragOverRoot">
          <i class="pi pi-arrow-up"></i>
          <span>Soltar aquí para convertir en <strong>elemento raíz</strong> (sin padre)</span>
        </div>
      }

      <!-- Custom Context Menu for Desktop -->
      <div class="custom-context-menu" 
           *ngIf="contextMenuVisible" 
           [style.top.px]="menuPosition.y" 
           [style.left.px]="menuPosition.x"
           (click)="$event.stopPropagation()">
        <div class="menu-header">
          <span class="menu-title">Acciones</span>
        </div>
        <ul class="menu-list">
          @if (activeRow?._canAdd !== false) {
            <li (click)="executeAction('add-child')">
              <i class="pi pi-plus text-indigo-500"></i>
              <span>Agregar Sub-elemento</span>
            </li>
          }
          @if (activeRow?._canEdit !== false) {
            <li (click)="executeAction('edit')">
              <i class="pi pi-pencil text-teal-500"></i>
              <span>Editar</span>
            </li>
          }
          @if (activeRow?._canDelete !== false) {
            <li (click)="executeAction('delete')" class="menu-item-danger">
              <i class="pi pi-trash text-red-500"></i>
              <span>Eliminar</span>
            </li>
          }
        </ul>
      </div>

      <!-- Mobile Bottom Sheet for Actions -->
      <div class="mobile-sheet-backdrop" *ngIf="mobileMenuVisible" (click)="closeMenus()"></div>
      <div class="mobile-bottom-sheet" [class.show]="mobileMenuVisible" (click)="$event.stopPropagation()">
        <div class="sheet-handle-container" (click)="closeMenus()">
          <div class="sheet-handle"></div>
        </div>
        <div class="sheet-header">
          <h3 class="sheet-title">Acciones de Fila</h3>
          <p class="sheet-subtitle" *ngIf="activeRow">Selecciona una opción para el registro</p>
        </div>
        <div class="sheet-body">
          <ul class="sheet-list">
            @if (activeRow?._canAdd !== false) {
              <li (click)="executeAction('add-child')">
                <div class="sheet-item-icon view"><i class="pi pi-plus"></i></div>
                <span>Agregar Sub-elemento</span>
              </li>
            }
            @if (activeRow?._canEdit !== false) {
              <li (click)="executeAction('edit')">
                <div class="sheet-item-icon edit"><i class="pi pi-pencil"></i></div>
                <span>Editar</span>
              </li>
            }
            @if (activeRow?._canDelete !== false) {
              <li (click)="executeAction('delete')" class="sheet-item-danger">
                <div class="sheet-item-icon del"><i class="pi pi-trash"></i></div>
                <span>Eliminar</span>
              </li>
            }
          </ul>
          <button class="sheet-cancel-btn" (click)="closeMenus()">Cancelar</button>
        </div>
      </div>
    </div>
  `
})
export class TreeTableComponent implements OnInit {
  @Input() title: string = 'Gestión Jerárquica';
  @Input() subtitle: string = 'Administra la estructura del sistema';
  @Input() nodes: TreeNode[] = [];
  @Input() columns: TreeTableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() scrollHeight: string = 'calc(100vh - 300px)';
  @Input() rows: number = 10;
  @Input() addLabel: string = 'Nuevo';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() showLegend: boolean = true;
  @Input() dragdrop: boolean = false;

  @Output() onAddRoot = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onFilter = new EventEmitter<string>();
  @Output() onFilterType = new EventEmitter<string>();
  @Output() onNodeReorder = new EventEmitter<any>();

  // Sort state
  sortField: string = '';
  sortOrder: number = 1;

  sortByField(field: string, event?: MouseEvent) {
    if (event) {
      const rect = (event.target as HTMLElement).closest('th')!.getBoundingClientRect();
      const offsetX = event.clientX - rect.right;
      if (offsetX > -10) return;
    }
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
  }

  // Drag-drop state
  draggedNode: any = null;
  dragOverNode: any = null;
  dragOverRoot = false;

  onRowDragStart(event: DragEvent, rowData: any) {
    this.draggedNode = rowData;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', '');
  }

  onRowDragOver(event: DragEvent, rowData: any) {
    if (!this.draggedNode || this.draggedNode === rowData) return;
    event.preventDefault();
    this.dragOverNode = rowData;
  }

  onRowDragLeave(event: DragEvent) {
    this.dragOverNode = null;
  }

  onRowDrop(event: DragEvent, rowData: any) {
    event.preventDefault();
    if (this.draggedNode && this.draggedNode !== rowData) {
      this.onNodeReorder.emit({ dragNode: this.draggedNode, dropNode: rowData });
    }
    this.draggedNode = null;
    this.dragOverNode = null;
  }

  onRootDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOverRoot = true;
  }

  onRootDragLeave(event: DragEvent) {
    this.dragOverRoot = false;
  }

  onRootDrop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedNode) {
      this.onNodeReorder.emit({ dragNode: this.draggedNode, dropNode: null });
    }
    this.draggedNode = null;
    this.dragOverRoot = false;
  }

  // Menu State
  contextMenuVisible = false;
  mobileMenuVisible = false;
  menuPosition = { x: 0, y: 0 };
  activeRow: any = null;

  ngOnInit() {}

  onSearch(event: any) {
    this.onFilter.emit(event.target.value);
  }

  filterByType(type: string) {
    this.onFilterType.emit(type);
  }

  getIconBg(type: string): string {
    switch (type?.toUpperCase()) {
      case 'MENU': return 'bg-indigo';
      case 'SUBMENU': return 'bg-emerald';
      case 'ACTION': return 'bg-amber';
      case 'COMPONENT': return 'bg-rose';
      default: return 'bg-slate';
    }
  }

  // Row Interactions
  onRowClick(event: MouseEvent, rowData: any) {
    if (window.innerWidth >= 768) {
      return;
    }

    const target = event.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('.actions') || 
      target.closest('.p-treetable-toggler')
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openMobileMenu(rowData);
  }

  onRowContextMenu(event: MouseEvent, rowData: any) {
    if (window.innerWidth < 768) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.openContextMenu(event, rowData);
  }

  openContextMenu(event: MouseEvent, rowData: any) {
    this.activeRow = rowData;
    this.contextMenuVisible = true;
    this.mobileMenuVisible = false;
    this.menuPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  openMobileMenu(rowData: any) {
    this.activeRow = rowData;
    this.mobileMenuVisible = true;
    this.contextMenuVisible = false;
  }

  closeMenus() {
    this.contextMenuVisible = false;
    this.mobileMenuVisible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.closeMenus();
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-context-menu') && !target.closest('tr')) {
      this.closeMenus();
    }
  }

  executeAction(action: string) {
    if (!this.activeRow) return;

    switch (action) {
      case 'add-child':
        this.onAddChild.emit(this.activeRow.id);
        break;
      case 'edit':
        this.onEdit.emit(this.activeRow);
        break;
      case 'delete':
        this.onDelete.emit(this.activeRow);
        break;
    }

    this.closeMenus();
  }
}
