import {
  Component,
  OnInit,
  TemplateRef,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  contentChild,
  viewChild,
  effect,
  SimpleChanges,
  OutputEmitterRef,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from 'primeng/api';

// ── MÓDULOS DE COMPONENTES DE PRIMENG (VERSION v19+) ────────────────────────
// Se importan de forma individual para optimizar el árbol de sacudida (Tree-Shaking)
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
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select'; // 💡 Mandatorio en v19 para compilar <p-select>

// ── ARQUITECTURA PROPIA Y COMPONENTES COMPARTIDOS (SHARED MODULE) ───────────
import { TableColumn } from '../shared/table.types';
import { ColumnsModalComponent } from '../../modals/modal-shell/columns-modal/columns-modal.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component';
import { ActionItem } from '../../components/action-menu.types';
import { ButtonComponent } from '../../components/button/button.component';
import { ToolbarComponent } from '../../components/toolbar/toolbar.component';
import { TableActionsComponent, TableActionsConfig } from '../shared/table-actions.component';
import { CellRendererComponent } from '../shared/cell-renderer/cell-renderer.component';
import { BaseTableDirective } from '../shared/base-table.directive';
import { LoadingService } from '@core/services/loading.service';

/** Re-exportación de tipo para garantizar compatibilidad con módulos consumidores */
export type { TableColumn };

/**
 * COMPONENTE: TableComponent
 * DESCRIPCIÓN: Grid de datos genérico y altamente configurable basado en p-table de PrimeNG.
 * SOPORTA: Paginación en servidor (Lazy), Agrupamiento de filas (Row Grouping), Modales de columnas
 * dinámicas, Menús contextuales adaptativos (Escritorio/Móvil) e Inyección externa de plantillas de acción.
 * DESIGN PATTERN: Usa ChangeDetectionStrategy.OnPush para evitar sobrecargar los ciclos de renderizado.
 */
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
    SelectModule, // El compilador de Angular requiere este import para reconocer directivas e inputs de p-select
    ColumnsModalComponent,
    ContextMenuComponent,
    BottomSheetComponent,
    ButtonComponent,
    ToolbarComponent,
    TableActionsComponent,
    CellRendererComponent,
    SkeletonModule
  ],
  templateUrl: './table-component.component.html',
  styles: [`
    /* Oculta el overlay nativo grisáceo de PrimeNG para permitir la visualización fluida de Skeletons */
    :host ::ng-deep .p-datatable-loading-overlay { display: none !important; }
    :host ::ng-deep .p-datatable-loading { opacity: 1 !important; }
    /* Estilos de override para filas seleccionadas o con estados críticos destacados */
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.p-highlight {
      background: #fef2f2 !important;
      color: #991b1b !important;
    }
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.p-highlight:hover {
      background: #fee2e2 !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent extends BaseTableDirective implements OnInit {
  constructor() {
    super();
    effect(() => {
      const cols = this.columns();
      this.selectedColumns = [...cols];
    }, { allowSignalWrites: true });

    effect(() => {
      const d = this.data();
      if (this.enableRowGroup() && this.expandableRowGroups() && this.groupRowsBy() && d?.length) {
        const keys: Record<string, boolean> = {};
        d.forEach(row => {
          const val = row[this.groupRowsBy()];
          if (val != null) keys[String(val)] = true;
        });
        this.expandedRowKeys = keys;
      }
    }, { allowSignalWrites: true });
  }

  // ── SERVICIOS INYECTADOS (ANGULAR FUNCTIONAL INJECTION) ────────────────────
  /** Servicio global de PrimeNG para registro dinámico de algoritmos de filtrado custom */
  private readonly filterService = inject(FilterService);
  /** Intercepta estados de carga asíncronos distribuidos en la aplicación */
  protected readonly loadingService = inject(LoadingService);

  // ── INPUTS ESENCIALES DE CONTROL DE DATOS Y ESTRUCTURA ─────────────────────
  /** Fuente de datos principal de la tabla (Colección de objetos planos JSON) */
  data = input<any[] >([]);
  /** Configuración de metadatos de las columnas (Tipos, alineaciones, visibilidad, etc.) */
  columns = input<TableColumn[] >([]);
  /** Campos del objeto de datos permitidos para la evaluación del filtro de búsqueda global */
  globalFilterFields = input<string[] >(['name']);
  /** Opciones del selector del paginador para cambiar el límite de registros por página */
  rowsPerPageOptions = input<number[] >([5, 10, 20, 50]);
  /** Activa el coloreado alternado (cebreado) en las filas de la tabla */
  stripedRows = input<boolean>(true);
  /** Modo minimalista: Compacta márgenes y paddings para layouts embebidos o dashboards estrechos */
  minimalMode = input<boolean>(false);

  /** * PUENTE INTER-COMPONENTE ESENCIAL:
   * Recibe una referencia de plantilla (`TemplateRef`) inyectada jerárquicamente por el CRUD-Page padre.
   * Si este Input viene poblado, el HTML anulará los botones por defecto y pintará esta estructura.
   */
  actionButtonsTemplate = input<TemplateRef<any> | null >(null);

  // ── PERMISOS Y VISIBILIDAD DE ACCIONES BASE ───────────────────────────────
  showAdd = input<boolean>(true);
  showEdit = input<boolean>(true);
  showDelete = input<boolean>(true);

  // ── PAGINACIÓN EN SERVIDOR (LAZY LOADING) ──────────────────────────────────
  /** Define si la ordenación, filtrado y paginación se resuelven en Backend (true) o en memoria (false) */
  lazy = input<boolean>(false);
  /** Totalizador de registros en base de datos. Mandatorio cuando 'lazy' es true para pintar el paginador */
  totalRecords = input<number>(0);

  // ── COMPORTAMIENTOS SECUNDARIOS Y ENTORNOS MÓVILES (ACCIONES ADICIONALES) ──
  showCreate = input<boolean>(false);
  createLabel = input<string>('Crear');
  createIcon = input<string>('pi-plus');
  showView = input<boolean>(false);
  viewLabel = input<string>('Visualizar');
  viewIcon = input<string>('pi-eye');
  showPdf = input<boolean>(false);
  showSend = input<boolean>(false);
  showDuplicate = input<boolean>(false);
  showPermissions = input<boolean>(false);
  showActivate = input<boolean>(false);
  showSelect = input<boolean>(false);
  showReset = input<boolean>(false);

  // ── LOGICA DE AGRUPACIÓN NATIVA DE FILAS (ROW GROUPING) ────────────────────
  /** Activa la visualización por sub-cabeceras agrupadas */
  enableRowGroup = input<boolean>(false);
  /** Nombre del campo/propiedad de la fila por el cual se agruparán los elementos visuales */
  groupRowsBy = input<string>('');
  /** Prefijo textual que se antepondrá al valor agrupado en la sub-cabecera */
  groupHeaderLabel = input<string>('');
  /** Habilita la visualización de un botón secundario para agregar hijos dentro del grupo */
  showAddChild = input<boolean>(false);
  /** Determina si las filas de los grupos pueden colapsarse/expandirse interactivamente */
  expandableRowGroups = input<boolean>(false);

  // ── SISTEMA DE EVENTOS DE SALIDA (OUTPUT EMITTERS) ────────────────────────
  onAdd = output<void>();
  onAddChild = output<any>();
  onCreate = output<any>();
  onAction = output<{ type: string; data: any }>();
  onView = output<any>();
  onPdf = output<any>();
  onSend = output<any>();
  onDuplicate = output<any>();
  onPermissions = output<any>();
  onActivate = output<any>();
  onSelect = output<any>();
  onReset = output<any>();
  onLazyLoad = output<any>();

  // ── SELECTORES INTERNOS DE DOM (QUERIES DE PLANTILLAS Y CONTENIDOS) ────────
  /** Captura fragmentos HTML/Botones inyectados de manera directa mediante ng-content local */
  customActionsTemplate = contentChild<TemplateRef<any>>('customActions');
  /** Referencia nativa al componente p-table de PrimeNG para invocar su API de filtrado y ordenación */
  dataTable = viewChild<Table>('dt');

  // ── VARIABLES DE ESTADO LOCAL INTERNO ──────────────────────────────────────
  /** Almacena colecciones de elementos seleccionados mediante Checkbox multimodo */
  selectedItems: any[] = [];
  /** Lista activa de columnas que se renderizan actualmente (se altera mediante el modal selector) */
  selectedColumns: TableColumn[] = [];
  /** Flag de control de visibilidad del modal de configuración de columnas */
  displayColumnsModal = false;
  /** Diccionario de índices llave/valor para determinar qué grupos de filas están desplegados en pantalla */
  expandedRowKeys: Record<string, boolean> = {};

  /** Matriz con anchos porcentuales fijos para diversificar el tamaño aleatorio visual de las celdas de carga (Skeleton) */
  readonly skeletonWidths = ['70%', '55%', '85%', '40%', '65%', '75%', '50%', '60%', '80%', '45%'];

  // ── GETTERS DE EVALUACIÓN REACTIVA DINÁMICA ────────────────────────────────
  /** Filtra y retorna únicamente las especificaciones de columnas cuyo flag de visibilidad no sea explícitamente falso */
  get visibleColumns(): TableColumn[] {
    return this.selectedColumns.filter(c => c.visible !== false);
  }

  /** Determina si la matriz de columnas configurada tiene asignada una columna dedicada a acciones */
  get hasActionsColumn(): boolean {
    return this.selectedColumns.some(col => col.type === 'actions' || col.field === 'actions');
  }

  /**
   * CONSTRUCTOR DEL MENÚ CONTEXTUAL / MOBILE BOTTOM SHEET
   * Mapea de forma limpia qué opciones se dibujarán en los clics derechos o menús desplegables 
   * móviles basándose en los permisos de visualización (`@Input() showXXX`) resueltos por el padre.
   */
  get contextMenuItems(): ActionItem[] {
    return [
      { action: 'select', label: 'Seleccionar', icon: 'pi pi-check-circle', iconClass: 'select', visible: this.showSelect() },
      { action: 'create', label: this.createLabel(), icon: this.createIcon(), iconClass: 'create', visible: this.showCreate() },
      { action: 'view', label: this.viewLabel(), icon: this.viewIcon(), iconClass: 'view', visible: this.showView() },
      { action: 'edit', label: 'Editar', icon: 'pi pi-pencil', iconClass: 'edit', visible: this.showEdit() },
      { action: 'pdf', label: 'Descargar PDF', icon: 'pi pi-file-pdf', iconClass: 'pdf', visible: this.showPdf() },
      { action: 'send', label: 'Enviar Correo', icon: 'pi pi-send', iconClass: 'send', visible: this.showSend() },
      { action: 'duplicate', label: 'Duplicar', icon: 'pi pi-copy', iconClass: 'duplicate', visible: this.showDuplicate() },
      { action: 'permissions', label: 'Permisos', icon: 'pi pi-shield', iconClass: 'perm', visible: this.showPermissions() },
      { action: 'reset', label: 'Restablecer contraseña', icon: 'pi pi-key', iconClass: 'reset', visible: this.showReset() },
      { action: 'delete', label: 'Eliminar', icon: 'pi pi-trash', iconClass: 'del', danger: true, visible: this.showDelete() },
    ];
  }

  /** Simplifica el paso de configuraciones Boolean de permisos masivos hacia el componente interno de renderizado de botones */
  get tableActionsConfig(): TableActionsConfig {
    return {
      select: this.showSelect(),
      addChild: this.showAddChild(),
      create: this.showCreate(),
      createLabel: this.createLabel(),
      createIcon: this.createIcon(),
      view: this.showView(),
      edit: this.showEdit(),
      pdf: this.showPdf(),
      send: this.showSend(),
      duplicate: this.showDuplicate(),
      permissions: this.showPermissions(),
      activate: this.showActivate(),
      delete: this.showDelete(),
      reset: this.showReset(),
    };
  }

  // ── CICLOS DE VIDA DEL COMPONENTE (LIFECYCLE HOOKS) ────────────────────────
  ngOnInit(): void {
    // Inicializa la configuración de columnas haciendo una copia por valor del input original
    this.selectedColumns = [...this.columns()];
    // Evalúa si hay agrupaciones pre-definidas que requieran nacer expandidas
    this._initExpandedGroups();
    // Parsea e inyecta filtros avanzados para mitigar crashes por formatos de fecha ISO string
    this._registerSafeDateFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si la referencia de la data entrante cambia, recalcula y reevalúa los estados de expansión de los grupos
    if (changes['data']) {
      this._initExpandedGroups();
    }
    // Si las columnas entran de forma asíncrona (ej: Promise/Lazy Loading), actualizar selectedColumns
    if (changes['columns']) {
      this.selectedColumns = [...this.columns()];
    }
  }

  // ── MÉTODOS PÚBLICOS / MANEJADORES DE ACCIÓN E INTERFACES ──────────────────
  /** Dispara el filtro global unificado en la instancia nativa del PrimeNG DataTable */
  filterGlobal(searchValue: string): void {
    this.dataTable()?.filterGlobal(searchValue, 'contains');
  }

  /** Callback ejecutado por el modal selector de columnas para guardar la nueva visibilidad de la grilla */
  onApplyColumns(columns: TableColumn[]): void {
    this.selectedColumns = columns;
    this.displayColumnsModal = false;
  }

  /** Maneja el estado bitestable (abierto/cerrado) de las sub-cabeceras de filas cuando el agrupamiento está activo */
  toggleGroupRow(groupValue: any): void {
    const key = String(groupValue);
    const updated = { ...this.expandedRowKeys };

    if (updated[key]) {
      delete updated[key];
    } else {
      updated[key] = true;
    }
    this.expandedRowKeys = updated;
  }

  /**
   * DICCIONARIO DE DISPAROS DE OPERACIONES:
   * Vincula las acciones de tipo string con su respectivo emisor de Output. 
   * Incluye un leve retardo asíncrono para coordinar la animación de cerrado del ContextMenu.
   */
  executeAction(actionType: string): void {
    const target = this.activeRow; // Heredado de BaseTableDirective
    this.closeMenus();

    if (!target) return;

    const actionsMap: Record<string, any> = {
      create: this.onCreate,
      view: this.onView,
      pdf: this.onPdf,
      send: this.onSend,
      duplicate: this.onDuplicate,
      edit: this.onEdit,
      delete: this.onDelete,
      permissions: this.onPermissions,
      select: this.onSelect,
      reset: this.onReset
    };

    setTimeout(() => {
      actionsMap[actionType]?.emit(target);
    }, 300);
  }

  /**
   * Resuelve el string de estilo de color ('severity') para las etiquetas de estados (Badges)
   * basándose en un diccionario de equivalencias directo.
   */
  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | undefined {
    if (!status) return 'info';

    const severityMap: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      'ACTIVO': 'success', 'INSTOCK': 'success', 'QUALIFIED': 'success',
      'PENDIENTE': 'warn', 'LOWSTOCK': 'warn', 'CONTACTED': 'warn',
      'INACTIVO': 'danger', 'OUTOFSTOCK': 'danger', 'LOST': 'danger',
      'NEW': 'info'
    };

    return severityMap[status.toUpperCase()] ?? 'info';
  }

  // ── FUNCIONES INTERNAS PRIVADAS DE CONFIGURACIÓN Y PARSEO ──────────────────
  /** Escanea la colección de filas inicial e inicializa el mapa de llaves para expandir visualmente los grupos */
  private _initExpandedGroups(): void {
    if (this.enableRowGroup() && this.expandableRowGroups() && this.groupRowsBy() && this.data()?.length) {
      const keys: Record<string, boolean> = {};
      this.data().forEach(row => {
        const val = row[this.groupRowsBy()];
        if (val != null) keys[String(val)] = true;
      });
      this.expandedRowKeys = keys;
    }
  }

  /**
   * CONTROLADOR DE ERRORES CRÍTICOS DE FILTRADO DE FECHAS:
   * Re-escribe los filtros internos 'dateIs', 'dateIsNot', 'dateBefore' y 'dateAfter' del FilterService.
   * Permite que strings ISO 860ims provenientes del servidor se parseen de forma segura, evitando crashes fatales en la UI.
   */
  private _registerSafeDateFilters(): void {
    const parseToDate = (val: any): Date | null => {
      if (val instanceof Date) return val;
      if (typeof val === 'string') {
        const timestamp = Date.parse(val);
        if (!isNaN(timestamp)) return new Date(timestamp);
      }
      return null;
    };

    const registerSafeFilter = (filterName: string, compareFn: (v: Date, f: Date) => boolean) => {
      this.filterService.register(filterName, (value: any, filter: any): boolean => {
        if (filter == null) return true;
        if (value == null) return false;

        const valDate = parseToDate(value);
        const filDate = parseToDate(filter);

        return (valDate && filDate) ? compareFn(valDate, filDate) : false;
      });
    };

    const getZeroTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    registerSafeFilter('dateIs', (v, f) => v.toDateString() === f.toDateString());
    registerSafeFilter('dateIsNot', (v, f) => v.toDateString() !== f.toDateString());
    registerSafeFilter('dateBefore', (v, f) => getZeroTime(v) < getZeroTime(f));
    registerSafeFilter('dateAfter', (v, f) => getZeroTime(v) > getZeroTime(f));
  }

  // ── IDENTIFICADORES DE RENDIMIENTO (TRACK-BY OPTIMIZATIONS) ─────────────────
  /** Evita el parpadeo del DOM al reordenar columnas */
  trackByField(_index: number, col: TableColumn): string {
    return col.field;
  }

  /** Evita renderizados masivos de filas innecesarios al actualizar colecciones de datos */
  trackByRow(index: number, row: any): any {
    return row?.id ?? row?.uuid ?? row?._trackId ?? index;
  }
}