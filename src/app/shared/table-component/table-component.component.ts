import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, HostListener, ContentChild, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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

import { TableColumn } from './table.types';
export type { TableColumn } from './table.types';
import { ColumnsModalComponent } from '../modals/modal-shell/columns-modal/columns-modal.component';
import { formatFileSize } from '../modals/modal-shell/modal-shell.utils';
import { ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { BottomSheetComponent } from '../components/bottom-sheet/bottom-sheet.component';
import { ActionItem } from '../components/action-menu.types';
import { ButtonComponent } from '../components/button/button.component';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { StatusClassPipe } from './status-class.pipe';
import { TableActionsComponent } from './table-actions.component';

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
    TableActionsComponent
  ],
  templateUrl: './table-component.component.html',
  styleUrl: './table-component.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() globalFilterFields: string[] = ['name'];
  @Input() rows: number = 10;
  @Input() scrollHeight: string = 'calc(100vh - 290px)';
  @Input() stripedRows: boolean = true;
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() minimalMode: boolean = false;

  // Permisos de botones principales
  @Input() showAdd: boolean = true;
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;
  @Input() addLabel: string = 'Añadir';

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
  @Input() showSelect: boolean = false;

  // Lógica de Row Grouping nativo que compartes en tu html
  @Input() enableRowGroup: boolean = false;
  @Input() groupRowsBy: string = '';
  @Input() groupHeaderLabel: string = '';
  @Input() showAddChild: boolean = false;
  @Input() expandableRowGroups: boolean = false;

  @Output() onAdd = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<any>();
  @Output() onAction = new EventEmitter<{ type: string; data: any }>();
  @Output() onView = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onSend = new EventEmitter<any>();
  @Output() onDuplicate = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onSelect = new EventEmitter<any>();

  @ContentChild('customActions') customActionsTemplate?: TemplateRef<any>;

  @ViewChild('dt') dataTable!: Table;

  selectedItems: any[] = [];
  selectedColumns: TableColumn[] = [];
  displayColumnsModal: boolean = false;
  isMenuOpen: boolean = false; // Controls mobile bottom sheet
  contextMenuVisible: boolean = false; // Controls desktop context menu
  menuPosition = { x: 0, y: 0 };
  activeRow: any = null;
  expandedRowKeys: { [s: string]: boolean } = {};

  constructor(private filterService: FilterService) {}

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

  // CORREGIDO: Se elimina el parámetro '$event' del decorador ya que la firma no lo requiere
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768 && (this.isMenuOpen || this.contextMenuVisible)) {
      this.closeMenus();
    }
  }

  onRowClick(event: MouseEvent, rowData: any) {
    if (window.innerWidth >= 768) {
      return;
    }

    const target = event.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('.actions')
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
    this.isMenuOpen = false;
    this.menuPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  openMobileMenu(row: any) {
    if (window.innerWidth <= 768) {
      this.activeRow = row;
      this.isMenuOpen = true;
      this.contextMenuVisible = false;
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenus() {
    this.isMenuOpen = false;
    this.contextMenuVisible = false;
    this.activeRow = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.closeMenus();
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-context-menu') && !target.closest('tr')) {
      this.closeMenus();
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

  get sheetItems(): ActionItem[] {
    return this.contextMenuItems;
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

  getStatusText(status: any): string {
    console.log("TEXTO");
    console.log(status);

    if (status === 1 || status === '1') {
      return 'Activo';
    }
    return 'Inactivo';
  }

  formatFileSize = formatFileSize;

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'rol-admin';
      case 'user': return 'rol-viewer';
      default: return '';
    }
  }

  get hasActionsColumn(): boolean {
    return this.selectedColumns.some(col => col.type === 'actions');
  }
}
