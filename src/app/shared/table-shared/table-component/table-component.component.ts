import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ContentChild, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { CardModule } from 'primeng/card';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

import { TableColumn } from '../shared/table.types';
export type { TableColumn } from '../shared/table.types';
import { ColumnsModalComponent } from '../../modals/modal-shell/columns-modal/columns-modal.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { ActionItem } from '../../components/action-menu.types';
import { ButtonComponent } from '../../components/button/button.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { StatusClassPipe } from '../shared/status-class.pipe';
import { BadgeClassPipe } from '../shared/badge-class.pipe';
import { TableActionsComponent, TableActionsConfig } from '../shared/table-actions.component';
import { CellRendererComponent } from '../shared/cell-renderer/cell-renderer.component';
import { BaseTableDirective } from '../shared/base-table.directive';

@Component({
  selector: 'app-table-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TagModule,
    IconFieldModule,
    CardModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    ToolbarModule,
    TooltipModule,
    MultiSelectModule,
    DialogModule,
    CheckboxModule,
    RippleModule,
    SelectModule,
    DatePickerModule,
    ColumnsModalComponent,
    ContextMenuComponent,
    BottomSheetComponent,
    ButtonComponent,
    ToolbarComponent,
    StatusClassPipe,
    BadgeClassPipe,
    TableActionsComponent,
    CellRendererComponent
  ],
  templateUrl: './table-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends BaseTableDirective implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() globalFilterFields: string[] = ['name'];
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() stripedRows: boolean = true;
  @Input() minimalMode: boolean = false;

  // Permisos de botones principales
  @Input() showAdd: boolean = true;
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;

  // Acciones secundarias / móviles
  @Input() showCreate: boolean = false;
  @Input() createLabel: string = 'Crear';
  @Input() createIcon: string = 'pi-plus';
  @Input() showView: boolean = false;
  @Input() viewLabel: string = 'Visualizar';
  @Input() viewIcon: string = 'pi-eye';
  @Input() showPdf: boolean = false;
  @Input() showSend: boolean = false;
  @Input() showDuplicate: boolean = false;
  @Input() showPermissions: boolean = false;
  @Input() showActivate: boolean = false;
  @Input() showSelect: boolean = false;

  // Lógica de Row Grouping nativo
  @Input() enableRowGroup: boolean = false;
  @Input() groupRowsBy: string = '';
  @Input() groupHeaderLabel: string = '';
  @Input() showAddChild: boolean = false;
  @Input() expandableRowGroups: boolean = false;

  @Output() onAdd = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<any>();
  @Output() onAction = new EventEmitter<{ type: string; data: any }>();
  @Output() onView = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onSend = new EventEmitter<any>();
  @Output() onDuplicate = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onActivate = new EventEmitter<any>();
  @Output() onSelect = new EventEmitter<any>();

  @ContentChild('customActions') customActionsTemplate?: TemplateRef<any>;

  @ViewChild('dt') dataTable!: Table;

  selectedItems: any[] = [];
  selectedColumns: TableColumn[] = [];
  displayColumnsModal: boolean = false;
  expandedRowKeys: { [s: string]: boolean } = {};

  constructor(private filterService: FilterService) {
    super();
  }

  filterGlobal(searchValue: string) {
    this.dataTable.filterGlobal(searchValue, 'contains');
  }

  trackByField(index: number, col: TableColumn): string {
    return col.field;
  }

  ngOnInit() {
    this.selectedColumns = [...this.columns];
    this._initExpandedGroups();

    // Patch PrimeNG date filters to handle string ISO dates without crashing
    const patchDateFilter = (filterName: string, comparisonFn: (val: Date, fil: Date) => boolean) => {
      this.filterService.register(filterName, (value: any, filter: any): boolean => {
        if (filter === undefined || filter === null) return true;
        if (value === undefined || value === null) return false;

        let valDate: Date | null = null;
        let filDate: Date | null = null;

        if (value instanceof Date) {
          valDate = value;
        } else if (typeof value === 'string') {
          const t = Date.parse(value);
          if (!isNaN(t)) valDate = new Date(t);
        }

        if (filter instanceof Date) {
          filDate = filter;
        } else if (typeof filter === 'string') {
          const t = Date.parse(filter);
          if (!isNaN(t)) filDate = new Date(t);
        }

        if (valDate && filDate) {
          return comparisonFn(valDate, filDate);
        }
        return false;
      });
    };

    patchDateFilter('dateIs', (v, f) => v.toDateString() === f.toDateString());
    patchDateFilter('dateIsNot', (v, f) => v.toDateString() !== f.toDateString());
    patchDateFilter('dateBefore', (v, f) => {
        const vTime = new Date(v.getFullYear(), v.getMonth(), v.getDate()).getTime();
        const fTime = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
        return vTime < fTime;
    });
    patchDateFilter('dateAfter', (v, f) => {
        const vTime = new Date(v.getFullYear(), v.getMonth(), v.getDate()).getTime();
        const fTime = new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();
        return vTime > fTime;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this._initExpandedGroups();
    }
  }

  private _initExpandedGroups() {
    if (this.enableRowGroup && this.expandableRowGroups && this.groupRowsBy && this.data?.length) {
      const keys: { [s: string]: boolean } = {};
      this.data.forEach(row => {
        const val = row[this.groupRowsBy];
        if (val != null) keys[String(val)] = true;
      });
      this.expandedRowKeys = keys;
    }
  }

  toggleGroupRow(groupValue: any) {
    const key = String(groupValue);
    if (this.expandedRowKeys[key]) {
      const updated = { ...this.expandedRowKeys };
      delete updated[key];
      this.expandedRowKeys = updated;
    } else {
      this.expandedRowKeys = { ...this.expandedRowKeys, [key]: true };
    }
  }

  onApplyColumns(columns: TableColumn[]) {
    this.selectedColumns = columns;
    this.displayColumnsModal = false;
  }

  get contextMenuItems(): ActionItem[] {
    return [
      { action: 'select', label: 'Seleccionar', icon: 'pi pi-check-circle', iconClass: 'select', visible: this.showSelect },
      { action: 'create', label: this.createLabel, icon: this.createIcon, iconClass: 'create', visible: this.showCreate },
      { action: 'view', label: this.viewLabel, icon: this.viewIcon, iconClass: 'view', visible: this.showView },
      { action: 'edit', label: 'Editar', icon: 'pi pi-pencil', iconClass: 'edit', visible: this.showEdit },
      { action: 'pdf', label: 'Descargar PDF', icon: 'pi pi-file-pdf', iconClass: 'pdf', visible: this.showPdf },
      { action: 'send', label: 'Enviar Correo', icon: 'pi pi-send', iconClass: 'send', visible: this.showSend },
      { action: 'duplicate', label: 'Duplicar', icon: 'pi pi-copy', iconClass: 'duplicate', visible: this.showDuplicate },
      { action: 'permissions', label: 'Permisos', icon: 'pi pi-shield', iconClass: 'perm', visible: this.showPermissions },
      { action: 'delete', label: 'Eliminar', icon: 'pi pi-trash', iconClass: 'del', danger: true, visible: this.showDelete },
    ];
  }

  executeAction(actionType: string) {
    const target = this.activeRow;
    this.closeMenus();

    setTimeout(() => {
      if (!target) return;
      switch (actionType) {
        case 'create': this.onCreate.emit(target); break;
        case 'view': this.onView.emit(target); break;
        case 'pdf': this.onPdf.emit(target); break;
        case 'send': this.onSend.emit(target); break;
        case 'duplicate': this.onDuplicate.emit(target); break;
        case 'edit': this.onEdit.emit(target); break;
        case 'delete': this.onDelete.emit(target); break;
        case 'permissions': this.onPermissions.emit(target); break;
        case 'select': this.onSelect.emit(target); break;
      }
    }, 300);
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | undefined {
    switch (status?.toUpperCase()) {
      case 'ACTIVO':
      case 'INSTOCK':
      case 'QUALIFIED':
        return 'success';
      case 'PENDIENTE':
      case 'LOWSTOCK':
      case 'CONTACTED':
        return 'warn';
      case 'INACTIVO':
      case 'OUTOFSTOCK':
      case 'LOST':
        return 'danger';
      case 'NEW':
        return 'info';
      default:
        return 'info';
    }
  }

  get hasActionsColumn(): boolean {
    return this.selectedColumns.some(col => col.type === 'actions');
  }

  get tableActionsConfig(): TableActionsConfig {
    return {
      select: this.showSelect,
      addChild: this.showAddChild,
      create: this.showCreate,
      createLabel: this.createLabel,
      createIcon: this.createIcon,
      view: this.showView,
      edit: this.showEdit,
      pdf: this.showPdf,
      send: this.showSend,
      duplicate: this.showDuplicate,
      permissions: this.showPermissions,
      activate: this.showActivate,
      delete: this.showDelete,
    };
  }

  trackByRow(index: number, row: any): any {
    return row?.id ?? row?.uuid ?? row?._trackId ?? index;
  }
}
