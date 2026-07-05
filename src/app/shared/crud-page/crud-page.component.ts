import {
  Component,
  inject,
  TemplateRef,
  input,
  output,
  contentChild,
  viewChild,
  effect,
  ChangeDetectionStrategy,
  Input
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
  externalActionButtons = contentChild<TemplateRef<any>>('rowActionButtons');

  /** Referencia al componente FormModal para manipulaciones programáticas */
  formModal = viewChild(FormModalComponent);

  /** Permite actualizar de forma reactiva el formulario abierto sin tener que cerrarlo */
  patchFormValue(value: any): void {
    const modal = this.formModal();
    if (modal && modal.form) {
      modal.form.patchValue(value);
      Object.keys(value).forEach(key => {
        const ctrl = modal.form.get(key);
        if (ctrl) {
          ctrl.markAsDirty();
          ctrl.updateValueAndValidity();
        }
      });
    }
  }

  // ── 🛡️ CONTROL DE ACCESO / SEGURIDAD (PERMISSION GATE) ─────────────────────
  /** String identificador de la acción/permiso requerida para renderizar el módulo (ej: 'USERS_VIEW') */
  permission = input<string>('');
  /** Mensaje de advertencia o bloqueo visual si el usuario carece del privilegio necesario */
  permissionMessage = input<string>('No tienes permisos para acceder a este módulo.');

  private _hasPermission: boolean | null = null;
  /** Permite forzar o sobreescribir explícitamente el estado del permiso desde el componente padre */
  @Input() set hasPermission(val: boolean) {
    this._hasPermission = val;
  }

  // ── CONFIGURACIONES DE LA TABLA PRINCIPAL (DATA GRID INPUTS) ──────────────
  title = input<string>('');
  subtitle = input<string>('');
  /** Matriz con la colección de datos planos JSON a listar */
  data = input<any[]>([]);
  /** Configuración estructural y de tipado de las columnas */
  columns = input<TableColumn[]>([]);
  /** Estado visual de carga (Activa Skeletons o Spinners en los componentes hijos) */
  loading = input<boolean>(false);
  addLabel = input<string>('Nuevo');
  resourceName = input<string>('');

  // Flags booleanos de visibilidad de operaciones básicas y extendidas
  showAdd = input<boolean>(true);
  showEdit = input<boolean>(true);
  showDelete = input<boolean>(true);
  showPermissions = input<boolean>(false);
  showView = input<boolean>(false);
  showReset = input<boolean>(false);
  showCreate = input<boolean>(false);
  showDuplicate = input<boolean>(false);
  showPdf = input<boolean>(false);
  showSend = input<boolean>(false);
  createLabel = input<string>('Crear');
  createIcon = input<string>('pi-plus');

  // ── CONFIGURACIONES DE PAGINACIÓN DE SERVIDOR (LAZY MODE) ─────────────────
  /** Determina si la tabla resuelve sus operaciones en backend de forma segmentada */
  lazy = input<boolean>(false);
  /** Cardinalidad máxima de registros para el cálculo de páginas en el control inferior */
  totalRecords = input<number>(0);
  /** Emite los parámetros de ordenamiento, saltos (skip) y límites (take) al backend */
  onLazyLoad = output<any>();

  // ── CONFIGURACIONES DE TABLA JERÁRQUICA (TREE TABLE OPTIONAL) ─────────────
  /** Interruptor que define si se dibuja una tabla plana o una vista arbórea */
  isTreeTable = input<boolean>(false);
  /** Nodos con tipado estructurado de PrimeNG que representan relaciones Padre-Hijo */
  treeNodes = input<TreeNode[]>([]);
  /** Alterna colores especiales o sangrías en las filas basadas en su profundidad de nivel */
  colorRows = input<boolean>(false);
  showLegend = input<boolean>(true);
  /** Habilita comportamientos de arrastrar y soltar para reestructurar el árbol */
  dragdrop = input<boolean>(false);
  searchPlaceholder = input<string>('Buscar...');

  // ── FORMULARIO DINÁMICO POR METADATOS (FORM MODAL CONFIG) ─────────────────
  /** Esquema JSON que describe los controles, validaciones y layouts del formulario */
  formFields = input<FormField[]>([]);
  formAddTitle = input<string>('');
  formEditTitle = input<string>('');
  /** Clase CSS para el grid del formulario dinámico (default: single column) */
  gridClass = input<string>('flex flex-col gap-3');
  /** Carga útil con diccionarios o catálogos externos necesarios para dropdowns internos del formulario */
  formExtraData = input<any>(null);
  /** Estado de validación inyectado de forma externa para flujos de negocio complejos */
  customFormValid = input<boolean | null>(null);
  /** Callback interceptor que permite transformar el objeto de la fila antes de ser editado en el formulario */
  mapItemForEdit = input<(item: any) => any>((item) => item);

  private _isSaving = false;
  /** Bloquea los botones del modal si los catálogos o llamadas remotas siguen en tránsito */
  catalogLoading = input<boolean>(false);

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
  deleteTitle = input<string>('Eliminar Registro');
  /** Soporta un string estático o una función callback que recibe el registro activo para interpolar nombres dinámicos */
  deleteMessage = input<string | ((item: any) => string)>('¿Eliminar este registro?');
  minimalMode = input<boolean>(false);
  reorderableColumns = input<boolean>(true);

  // ── CONFIGURACIONES DE COMPORTAMIENTO GENERAL (TOGGLES) ────────────────────
  /** Desactiva por completo la evaluación de seguridad perimetral si el módulo es de acceso libre */
  hidePermissionGate = input<boolean>(false);

  // ── FLUJO DE SALIDA DE ACCIONES COMPORTAMENTALES (OUTPUTS EMITTERS) ────────
  onAdd = output<void>();
  onEdit = output<any>();
  onDelete = output<any>();
  onPermissions = output<any>();
  onView = output<any>();
  onReset = output<any>();
  onPdf = output<any>();
  onSend = output<any>();
  onCreate = output<any>();
  onDuplicate = output<any>();
  /** Notifica al padre la confirmación del formulario enviando el modo operacional junto con el Payload del JSON editado */
  onSave = output<{ mode: 'add' | 'edit'; data: any }>();
  onConfirmDelete = output<any>();
  onRefresh = output<void>();
  onColReorder = output<any>();
  onCloseModal = output<void>();
  onSelectGridEmptyFilter = output<string>();

  // ── EVENTOS EXCLUSIVOS PARA ESTRUCTURAS JERÁRQUICAS (TREE TABLE OUTPUTS) ──
  onAddRoot = output<void>();
  onAddChild = output<number>();
  onFilter = output<string>();
  onFilterType = output<string>();
  onNodeReorder = output<any>();

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
    if (!this.permission()) return true;
    return this.authService.checkPermission(this.permission());
  }

  /** Ejecuta la función de mensaje dinámico de borrado o retorna el string plano configurado */
  get resolvedDeleteMessage(): string {
    if (typeof this.deleteMessage() === 'function') {
      const msg = this.deleteMessage();
      return typeof msg === 'function' ? msg(this.selectedItem) : msg;
    }
    if (this.resourceName()) {
      return `¿Está seguro de eliminar este(a) ${this.resourceName().toLowerCase()}? Esta acción es <strong>permanente</strong> y no puede deshacerse.`;
    }
    return this.deleteMessage() as string;
  }

  get resolvedDeleteTitle(): string {
    return this.resourceName() ? `Eliminar ${this.resourceName()}` : this.deleteTitle();
  }

  get resolvedFormAddTitle(): string {
    return this.resourceName() ? `Nuevo ${this.resourceName()}` : this.formAddTitle();
  }

  get resolvedFormEditTitle(): string {
    return this.resourceName() ? `Editar ${this.resourceName()}` : this.formEditTitle();
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
    this.selectedItem = this.mapItemForEdit()(item);
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