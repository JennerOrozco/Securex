import {
  Component,
  OnInit,
  HostListener,
  input,
  output,
  contentChild,
  viewChild,
  effect,
  inject,
  ElementRef
} from '@angular/core';
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

/**
 * @component TreeTableComponent
 * @description
 * Componente que renderiza una tabla jerárquica (TreeTable).
 * Extiende de `BaseTableDirective` para heredar la gestión unificada de menús de acciones (contextual y móvil).
 * Soporta ordenamiento, búsqueda, coloreado de filas y arrastrar y soltar (drag & drop) para reordenamiento de nodos.
 */
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
  // --- Entradas de Datos (Inputs) ---
  /** @property Nodos jerárquicos de la tabla provistos por PrimeNG. */
  nodes = input<TreeNode[] >([]);
  /** @property Definición estructural de las columnas de la tabla. */
  columns = input<TableColumn[] >([]);
  /** @property Muestra u oculta la leyenda visual explicativa. */
  showLegend = input<boolean >(true);
  /** @property Habilita o deshabilita la funcionalidad de arrastrar y soltar para reorganizar nodos. */
  dragdrop = input<boolean >(false);
  /** @property Muestra el botón global de agregar elemento raíz. */
  showAdd = input<boolean >(true);
  /** @property Si es true, aplica colores de fondo a la fila entera basados en su tipo (ej. Menú, Submenú). */
  colorRows = input<boolean >(false);

  // --- Salidas de Eventos (Outputs) ---
  onAddRoot = output<void>();
  onAddChild = output<number>();
  onFilter = output<string>();
  onFilterType = output<string>();
  /** @emits Objeto indicando el nodo arrastrado y su nuevo nodo destino (o null si va a la raíz). */
  onNodeReorder = output<any>();
  onReset = output<any>();

  // --- Estado de Ordenamiento (Sorting) ---
  sortField: string = '';
  sortOrder: number = 1; // 1 = Ascendente, -1 = Descendente

  readonly skeletonWidths = ['65%', '80%', '45%', '70%', '55%', '85%'];

  // Referencia nativa al componente TreeTable de PrimeNG
  treeTable = viewChild<TreeTable>('tt');

  /**
   * @description
   * Getter dinámico que filtra las columnas para retornar solo aquellas
   * configuradas explícitamente para ser visibles en la UI.
   */
  get visibleColumns(): TableColumn[] {
    return this.columns().filter(c => c.visible !== false);
  }

  constructor() {
    super(); // Llama al constructor de la directiva base
  }

  private readonly el = inject(ElementRef);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === '/' && event.target === document.body) {
      event.preventDefault();
      const input = this.el.nativeElement.querySelector('.search-inp') as HTMLInputElement;
      if (input) input.focus();
    }
  }

  /**
   * @description Función de seguimiento para iteradores `ngFor` que mejora el rendimiento de renderizado.
   */
  trackByField(index: number, col: TableColumn): string {
    return col.field;
  }

  /**
   * @action Maneja la lógica manual de ordenamiento de columnas por clic en la cabecera.
   * @description 
   * Incluye una zona muerta (10px al borde derecho) para ignorar clics si el usuario 
   * está intentando redimensionar la columna en lugar de ordenarla.
   */
  sortByField(field: string, event?: MouseEvent) {
    if (event) {
      const rect = (event.target as HTMLElement).closest('th')!.getBoundingClientRect();
      const offsetX = event.clientX - rect.right;
      // Zona muerta de 10px: Asume que el usuario intenta redimensionar la columna
      if (offsetX > -10) return;
    }
    // Si ya estaba ordenado por este campo, invierte el orden. Si es nuevo, ordena ascendente.
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
  }

  // =======================================================================
  // REGION: Estado y Lógica Drag-and-Drop
  // =======================================================================

  draggedNode: any = null;
  dragOverNode: any = null;
  dragOverRoot = false;

  /** @listener Inicio del arrastre de una fila */
  onRowDragStart(event: DragEvent, rowData: any) {
    this.draggedNode = rowData;
    // Permite que el navegador sepa que este elemento puede ser movido
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', ''); // Requerido en Firefox para habilitar D&D
  }

  /** @listener El nodo arrastrado pasa sobre otro nodo (posible destino hijo) */
  onRowDragOver(event: DragEvent, rowData: any) {
    // Evita soltar sobre sí mismo
    if (!this.draggedNode || this.draggedNode === rowData) return;
    event.preventDefault(); // Necesario para permitir el "drop" (soltar)
    this.dragOverNode = rowData;
  }

  /** @listener El nodo arrastrado sale de la zona del nodo destino */
  onRowDragLeave(event: DragEvent) {
    this.dragOverNode = null;
  }

  /** @listener Se suelta el nodo sobre otro nodo específico */
  onRowDrop(event: DragEvent, rowData: any) {
    event.preventDefault();
    if (this.draggedNode && this.draggedNode !== rowData) {
      this.onNodeReorder.emit({ dragNode: this.draggedNode, dropNode: rowData });
    }
    // Limpieza de estado
    this.draggedNode = null;
    this.dragOverNode = null;
  }

  /** @listener El nodo arrastrado pasa sobre la zona general de "Raíz" (fuera de las filas existentes) */
  onRootDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOverRoot = true;
  }

  /** @listener El nodo sale de la zona de "Raíz" */
  onRootDragLeave(event: DragEvent) {
    this.dragOverRoot = false;
  }

  /** @listener Se suelta el nodo en la zona "Raíz" para convertirlo en un nodo padre de nivel 0 */
  onRootDrop(event: DragEvent) {
    event.preventDefault();
    if (this.draggedNode) {
      this.onNodeReorder.emit({ dragNode: this.draggedNode, dropNode: null });
    }
    this.draggedNode = null;
    this.dragOverRoot = false;
  }

  // =======================================================================
  // REGION: Configuración y Ejecución de Menús de Acciones
  // =======================================================================

  /**
   * @description Implementación obligatoria desde `BaseTableDirective`.
   * Construye dinámicamente las opciones del menú contextual evaluando 
   * banderas internas de permisos (`_canAdd`, `_canEdit`, etc.) de la fila activa.
   */
  get contextMenuItems(): ActionItem[] {
    return [
      { action: 'add-child', label: 'Agregar Sub-elemento', icon: 'pi pi-plus', iconClass: 'view', visible: this.activeRow?._canAdd !== false },
      { action: 'edit', label: 'Editar', icon: 'pi pi-pencil', iconClass: 'edit', visible: this.activeRow?._canEdit !== false },
      { action: 'reset', label: 'Restablecer contraseña', icon: 'pi pi-key', iconClass: 'reset', visible: this.activeRow?._canReset === true },
      { action: 'delete', label: 'Eliminar', icon: 'pi pi-trash', iconClass: 'del', danger: true, visible: this.activeRow?._canDelete !== false },
    ];
  }

  ngOnInit() { }

  /** @action Emite el texto a filtrar desde la barra de búsqueda superior */
  onSearch(event: any) {
    this.onFilter.emit(event.target.value);
  }

  /** @action Emite un tipo específico para filtros predefinidos (ej. filtros por tipo de rol/modulo) */
  filterByType(type: string) {
    this.onFilterType.emit(type);
  }

  /**
   * @description Mapea el tipo de la fila a un estilo de fondo de ícono (ej. Tailwind class).
   */
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

  /**
   * @description Mapea el tipo de la fila a una clase CSS para colorear todo el renglón (si `colorRows` está activo).
   */
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

  /**
   * @description Convierte la fila de datos en una configuración estandarizada 
   * que lee el componente `TableActionsComponent` para dibujar los botones de línea.
   */
  getActionsConfig(row: any): TableActionsConfig {
    return {
      addChild: row._canAdd !== false,
      edit: row._canEdit !== false,
      delete: row._canDelete !== false,
      reset: row._canReset === true,
    };
  }

  /**
   * @action Implementación obligatoria desde `BaseTableDirective`.
   * Ejecuta la lógica correspondiente cuando el usuario hace clic en un elemento del menú,
   * emitiendo eventos hacia el componente padre y cerrando los menús.
   */
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
      case 'reset':
        this.onReset.emit(this.activeRow);
        break;
    }

    this.closeMenus(); // Heredado de BaseTableDirective
  }
}