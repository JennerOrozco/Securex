import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ContentChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── COMPONENTES Y TIPOS DE LA ARQUITECTURA COMPARTIDA (SHARED) ──────────────
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormModalComponent } from '@shared/modals/modal-shell/form-modal/form-modal.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TreeTableComponent } from '@shared/table-shared/tree-table-component/tree-table-component.component';

// ── CONFIGURACIONES Y SERVICIOS CORE ────────────────────────────────────────
import { AuthService } from '@core/services/auth.service';
import { TreeNode } from 'primeng/api';

/**
 * COMPONENTE: CrudPageComponent
 * DESCRIPCIÓN: Orquestador genérico de vistas tipo CRUD (Create, Read, Update, Delete).
 * ARQUITECTURA: Actúa como un contenedor inteligente (Smart Component / Shell) que unifica:
 * 1. Grillas de datos estándar (`TableComponent`) o estructuras jerárquicas (`TreeTableComponent`).
 * 2. Un modal dinámico de formularios basado en metadatos (`FormModalComponent`).
 * 3. Un modal de confirmación destructiva (`DeleteModalComponent`).
 * 4. Una compuerta perimetral de seguridad basada en permisos de usuario (`AuthService`).
 */
@Component({
  selector: 'app-crud-page',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    FormModalComponent,
    DeleteModalComponent,
    TreeTableComponent
  ],
  templateUrl: './crud-page.component.html'
})
export class CrudPageComponent {
  // ── SERVICIOS INYECTADOS ──────────────────────────────────────────────────
  /** Servicio centralizado encargado de verificar roles, claims y permisos del usuario activo */
  private readonly authService = inject(AuthService);

  // ── 🔀 COMPUERTA DE INYECCIÓN DE PLANTILLAS EXTERNAS (TEMPLATE INJECTION) ──
  /**
   * Captura dinámicamente un template declarado externamente con la referencia `#rowActionButtons`.
   * Permite inyectar botones customizados de fila (ej: descargas, correos) desde la vista que invoca al CRUD,
   * delegándolo posteriormente a la tabla hija mediante Data Binding.
   */
  @ContentChild('rowActionButtons') externalActionButtons!: TemplateRef<any>;

  // ── 🛡️ CONTROL DE ACCESO / SEGURIDAD (PERMISSION GATE) ─────────────────────
  /** String identificador de la acción/permiso requerida para renderizar el módulo (ej: 'USERS_VIEW') */
  @Input() permission = '';
  /** Mensaje de advertencia o bloqueo visual si el usuario carece del privilegio necesario */
  @Input() permissionMessage = 'No tienes permisos para acceder a este módulo.';

  private _hasPermission: boolean | null = null;
  /** Permite forzar o sobreescribir explícitamente el estado del permiso desde el componente padre */
  @Input() set hasPermission(val: boolean) {
    this._hasPermission = val;
  }

  // ── CONFIGURACIONES DE LA TABLA PRINCIPAL (DATA GRID INPUTS) ──────────────
  @Input() title = '';
  @Input() subtitle = '';
  /** Matriz con la colección de datos planos JSON a listar */
  @Input() data: any[] = [];
  /** Configuración estructural y de tipado de las columnas */
  @Input() columns: TableColumn[] = [];
  /** Estado visual de carga (Activa Skeletons o Spinners en los componentes hijos) */
  @Input() loading = false;
  @Input() addLabel = 'Nuevo';
  @Input() resourceName = '';

  // Flags booleanos de visibilidad de operaciones básicas y extendidas
  @Input() showAdd = true;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showPermissions = false;
  @Input() showView = false;
  @Input() showReset = false;
  @Input() showCreate = false;
  @Input() showDuplicate = false;
  @Input() showPdf = false;
  @Input() showSend = false;
  @Input() createLabel = 'Crear';
  @Input() createIcon = 'pi-plus';

  // ── CONFIGURACIONES DE PAGINACIÓN DE SERVIDOR (LAZY MODE) ─────────────────
  /** Determina si la tabla resuelve sus operaciones en backend de forma segmentada */
  @Input() lazy = false;
  /** Cardinalidad máxima de registros para el cálculo de páginas en el control inferior */
  @Input() totalRecords = 0;
  /** Emite los parámetros de ordenamiento, saltos (skip) y límites (take) al backend */
  @Output() onLazyLoad = new EventEmitter<any>();

  // ── CONFIGURACIONES DE TABLA JERÁRQUICA (TREE TABLE OPTIONAL) ─────────────
  /** Interruptor que define si se dibuja una tabla plana o una vista arbórea */
  @Input() isTreeTable = false;
  /** Nodos con tipado estructurado de PrimeNG que representan relaciones Padre-Hijo */
  @Input() treeNodes: TreeNode[] = [];
  /** Alterna colores especiales o sangrías en las filas basadas en su profundidad de nivel */
  @Input() colorRows = false;
  @Input() showLegend = true;
  /** Habilita comportamientos de arrastrar y soltar para reestructurar el árbol */
  @Input() dragdrop = false;
  @Input() searchPlaceholder = 'Buscar...';

  // ── FORMULARIO DINÁMICO POR METADATOS (FORM MODAL CONFIG) ─────────────────
  /** Esquema JSON que describe los controles, validaciones y layouts del formulario */
  @Input() formFields: FormField[] = [];
  @Input() formAddTitle = '';
  @Input() formEditTitle = '';
  /** Clase CSS para el grid del formulario dinámico (default: single column) */
  @Input() gridClass = 'flex flex-col gap-3';
  /** Carga útil con diccionarios o catálogos externos necesarios para dropdowns internos del formulario */
  @Input() formExtraData: any = null;
  /** Estado de validación inyectado de forma externa para flujos de negocio complejos */
  @Input() customFormValid: boolean | null = null;
  /** Callback interceptor que permite transformar el objeto de la fila antes de ser editado en el formulario */
  @Input() mapItemForEdit: (item: any) => any = (item) => item;

  private _isSaving = false;
  /** Bloquea los botones del modal si los catálogos o llamadas remotas siguen en tránsito */
  @Input() catalogLoading = false;

  /**
   * Intercepta el estado de guardado (Efecto de persistencia en Backend).
   * Si el estado transiciona de `true` a `false` (guardado exitoso) y el modal sigue abierto,
   * se encarga de cerrarlo de manera reactiva y automática.
   */
  @Input() set isSaving(val: boolean) {
    const wasSaving = this._isSaving;
    this._isSaving = val;
    if (wasSaving && !val && this.modalVisible) {
      this.modalVisible = false;
    }
  }
  get isSaving(): boolean {
    return this._isSaving;
  }

  // ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (DELETE MODAL CONFIG) ────────────
  @Input() deleteTitle = 'Eliminar Registro';
  /** Soporta un string estático o una función callback que recibe el registro activo para interpolar nombres dinámicos */
  @Input() deleteMessage: string | ((item: any) => string) = '¿Eliminar este registro?';
  @Input() minimalMode = false;
  @Input() reorderableColumns = true;

  // ── CONFIGURACIONES DE COMPORTAMIENTO GENERAL (TOGGLES) ────────────────────
  /** Desactiva por completo la evaluación de seguridad perimetral si el módulo es de acceso libre */
  @Input() hidePermissionGate = false;

  // ── FLUJO DE SALIDA DE ACCIONES COMPORTAMENTALES (OUTPUTS EMITTERS) ────────
  @Output() onAdd = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onReset = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onSend = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<any>();
  @Output() onDuplicate = new EventEmitter<any>();
  /** Notifica al padre la confirmación del formulario enviando el modo operacional junto con el Payload del JSON editado */
  @Output() onSave = new EventEmitter<{ mode: 'add' | 'edit'; data: any }>();
  @Output() onConfirmDelete = new EventEmitter<any>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onColReorder = new EventEmitter<any>();
  @Output() onCloseModal = new EventEmitter<void>();
  @Output() onSelectGridEmptyFilter = new EventEmitter<string>();

  // ── EVENTOS EXCLUSIVOS PARA ESTRUCTURAS JERÁRQUICAS (TREE TABLE OUTPUTS) ──
  @Output() onAddRoot = new EventEmitter<void>();
  @Output() onAddChild = new EventEmitter<number>();
  @Output() onFilter = new EventEmitter<string>();
  @Output() onFilterType = new EventEmitter<string>();
  @Output() onNodeReorder = new EventEmitter<any>();

  // ── 📑 MÁQUINA DE ESTADOS INTERNOS (INTERNAL CONTEXT STATE) ────────────────
  /** Flag unificado que controla la apertura o cierre de los modales en pantalla */
  modalVisible = false;
  /** Determina qué tipo de modal y contenido se debe renderizar en el árbol del DOM */
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  /** Mantiene la referencia en memoria del registro (objeto JSON) que está siendo operado */
  selectedItem: any = null;

  // ── RESOLUTORES DINÁMICOS Y GETTERS REACTIVOS ──────────────────────────────
  /** Evalúa si el usuario cuenta con accesos. Prioriza overrides manuales, de lo contrario consulta al AuthService */
  get hasPermission(): boolean {
    if (this._hasPermission !== null) return this._hasPermission;
    if (!this.permission) return true;
    return this.authService.checkPermission(this.permission);
  }

  /** Ejecuta la función de mensaje dinámico de borrado o retorna el string plano configurado */
  get resolvedDeleteMessage(): string {
    if (typeof this.deleteMessage === 'function') {
      return this.deleteMessage(this.selectedItem);
    }
    if (this.resourceName) {
      return `¿Está seguro de eliminar este(a) ${this.resourceName.toLowerCase()}? Esta acción es <strong>permanente</strong> y no puede deshacerse.`;
    }
    return this.deleteMessage as string;
  }

  get resolvedDeleteTitle(): string {
    return this.resourceName ? `Eliminar ${this.resourceName}` : this.deleteTitle;
  }

  get resolvedFormAddTitle(): string {
    return this.resourceName ? `Nuevo ${this.resourceName}` : this.formAddTitle;
  }

  get resolvedFormEditTitle(): string {
    return this.resourceName ? `Editar ${this.resourceName}` : this.formEditTitle;
  }

  get resolvedFormTitle(): string {
    return this.modalMode === 'add' ? this.resolvedFormAddTitle : this.resolvedFormEditTitle;
  }

  /** Provee los datos precargados al formulario únicamente si el flujo actual corresponde a una edición */
  get resolvedFormData(): any {
    return this.modalMode === 'edit' ? this.selectedItem : null;
  }

  // ── CONTROLADORES DE EVENTOS PÚBLICOS (INVOCADOS POR EL TEMPLATE HTML) ────

  /** Inicializa el estado contextual para la creación de un nuevo registro plano */
  handleAdd(): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAdd.emit();
  }

  /** Inicializa la creación de un elemento raíz en configuraciones jerárquicas */
  handleTreeAddRoot(): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAddRoot.emit();
  }

  /** Inicializa la creación de un nodo hijo vinculándolo al identificador del padre */
  handleTreeAddChild(parentId: number): void {
    this.modalMode = 'add';
    this.selectedItem = null;
    this.modalVisible = true;
    this.onAddChild.emit(parentId);
  }

  /** Abre el formulario en modalidad de edición aplicando previamente la función de mapeo (si existe) */
  handleEdit(item: any): void {
    this.modalMode = 'edit';
    this.selectedItem = this.mapItemForEdit(item);
    this.modalVisible = true;
    this.onEdit.emit(item);
  }

  /** Configura la máquina de estados para desplegar el modal destructivo de confirmación de borrado */
  handleDelete(item: any): void {
    this.modalMode = 'delete';
    this.selectedItem = item;
    this.modalVisible = true;
    this.onDelete.emit(item);
  }

  /** Redirige la orden de restablecimiento de credenciales o estados hacia el componente padre */
  handleReset(item: any): void {
    this.onReset.emit(item);
  }

  /**
   * Procesa los datos capturados y validados del formulario.
   * Si estamos en modo edición, realiza una fusión (merge) conservando las llaves primarias
   * no editables (`id`, `uuid`, etc.) del registro original antes de emitir el evento definitivo.
   */
  handleSave(data: any): void {
    const finalData = this.modalMode === 'edit' && this.selectedItem
      ? { ...this.selectedItem, ...data }
      : data;
    this.onSave.emit({ mode: this.modalMode as 'add' | 'edit', data: finalData });
  }

  /** Confirma la acción de eliminación, despacha el evento al exterior y cierra la capa visual */
  handleConfirmDelete(): void {
    this.onConfirmDelete.emit(this.selectedItem);
    this.modalVisible = false;
  }

  /** Limpia estados de apertura y notifica la destrucción o cancelación de los modales */
  handleCloseModal(): void {
    this.modalVisible = false;
    this.onCloseModal.emit();
  }
}