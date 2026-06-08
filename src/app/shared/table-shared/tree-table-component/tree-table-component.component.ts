import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule, TreeTable } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import type { TableColumn } from '../shared/table.types';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { ActionItem } from '../../components/action-menu.types';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { CellRendererComponent } from '../shared/cell-renderer/cell-renderer.component';
import { TableActionsComponent, TableActionsConfig } from '../shared/table-actions.component';
import { BaseTableDirective } from '../shared/base-table.directive';

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
    InputTextModule,
    ContextMenuComponent,
    BottomSheetComponent,
    ToolbarComponent,
    CellRendererComponent,
    TableActionsComponent
  ],
  templateUrl: './tree-table-component.component.html'
})
export class TreeTableComponent extends BaseTableDirective implements OnInit {
  @Input() nodes: TreeNode[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() showLegend: boolean = true;
  @Input() dragdrop: boolean = false;
  @Input() showAdd: boolean = true;
  @Input() colorRows: boolean = false;

  @Output() onAddRoot = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<number>();
  @Output() onFilter = new EventEmitter<string>();
  @Output() onFilterType = new EventEmitter<string>();
  @Output() onNodeReorder = new EventEmitter<any>();

  // Sort state
  sortField: string = '';
  sortOrder: number = 1;

  @ViewChild('tt') treeTable!: TreeTable;

  constructor() {
    super();
  }

  trackByField(index: number, col: TableColumn): string {
    return col.field;
  }

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

  get contextMenuItems(): ActionItem[] {
    return [
      { action: 'add-child', label: 'Agregar Sub-elemento', icon: 'pi pi-plus', iconClass: 'view', visible: this.activeRow?._canAdd !== false },
      { action: 'edit', label: 'Editar', icon: 'pi pi-pencil', iconClass: 'edit', visible: this.activeRow?._canEdit !== false },
      { action: 'delete', label: 'Eliminar', icon: 'pi pi-trash', iconClass: 'del', danger: true, visible: this.activeRow?._canDelete !== false },
    ];
  }

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
      case 'APP': return 'bg-indigo';
      case 'COMPANY': return 'bg-emerald';
      default: return 'bg-slate';
    }
  }

  getRowClass(type: string): string {
    if (!this.colorRows) return '';
    switch (type?.toUpperCase()) {
      case 'MENU': return 'row-menu';
      case 'SUBMENU': return 'row-submenu';
      case 'ACTION': return 'row-action';
      case 'COMPONENT': return 'row-component';
      case 'APP': return 'row-app';
      case 'COMPANY': return 'row-company';
      default: return '';
    }
  }

  getActionsConfig(row: any): TableActionsConfig {
    return {
      addChild: row._canAdd !== false,
      edit: row._canEdit !== false,
      delete: row._canDelete !== false,
    };
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
