import {
  Directive,
  HostListener,
  inject,
  Renderer2,
  input,
  output,
  contentChild,
  viewChild,
  effect
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TableColumn } from './table.types';
import { ActionItem } from '../../components/action-menu.types';

/**
 * @directive BaseTableDirective
 * @description
 * Directiva base abstracta para componentes de tablas.
 * Centraliza las propiedades de configuración comunes (título, paginación, etc.) 
 * y gestiona unificadamente la lógica de interacción para menús de acciones:
 * - Menú contextual nativo (clic derecho) para pantallas de escritorio.
 * - Menú modal/bottom-sheet (tap/clic izquierdo) para dispositivos móviles.
 */
@Directive()
export abstract class BaseTableDirective {
  // --- Inyecciones ---
  /** Utilizados para una manipulación segura del DOM, previniendo errores en SSR */
  protected renderer = inject(Renderer2);
  protected document = inject(DOCUMENT);

  // --- Propiedades de Configuración (Inputs) ---
  title = input<string >('');
  subtitle = input<string >('');
  loading = input<boolean >(false);
  scrollHeight = input<string >('calc(100vh - 300px)');
  rows = input<number >(10);
  addLabel = input<string >('Añadir');
  searchPlaceholder = input<string >('Buscar...');
  reorderableColumns = input<boolean >(true);

  // --- Eventos (Outputs) ---
  onEdit = output<any>();
  onDelete = output<any>();
  onColReorder = output<any>();

  // --- Estado Interno de Menús ---
  contextMenuVisible = false;
  mobileMenuVisible = false;
  menuPosition = { x: 0, y: 0 };
  activeRow: any = null;

  /**
   * @abstract
   * @description Obliga a los componentes hijos a definir la lista de acciones disponibles para su tabla.
   */
  abstract get contextMenuItems(): ActionItem[];

  /**
   * @abstract
   * @description Obliga a los componentes hijos a implementar la lógica de ejecución de cada acción.
   */
  abstract executeAction(actionType: string): void;

  /**
   * @action Cierra cualquier menú abierto (contextual o móvil), limpia la fila activa
   * y restaura el scroll de la página usando Renderer2 de forma segura.
   */
  closeMenus() {
    this.contextMenuVisible = false;
    this.mobileMenuVisible = false;
    this.activeRow = null;
    this.renderer.removeStyle(this.document.body, 'overflow');
  }

  /**
   * @listener window:resize
   * @description Cierra los menús preventivamente si el usuario redimensiona la ventana 
   * cruzando el breakpoint de móvil a escritorio.
   */
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768 && (this.mobileMenuVisible || this.contextMenuVisible)) {
      this.closeMenus();
    }
  }

  /**
   * @action Maneja el clic izquierdo sobre una fila.
   * @description En móviles (ancho < 768px), abre el menú de acciones móvil. 
   * Ignora el clic si el target fue un botón, un enlace o un control de expansión.
   */
  onRowClick(event: MouseEvent, rowData: any) {
    if (window.innerWidth >= 768) {
      return; // En escritorio no hace nada en clic normal
    }

    const target = event.target as HTMLElement;

    // Evita abrir el menú si el usuario interactuó con un elemento específico de la fila
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

  /**
   * @action Maneja el clic derecho sobre una fila.
   * @description En escritorio (ancho >= 768px), previene el menú nativo del navegador 
   * y abre el menú contextual personalizado en las coordenadas del cursor.
   */
  onRowContextMenu(event: MouseEvent, rowData: any) {
    if (window.innerWidth < 768) {
      return; // En móvil delegamos las acciones al clic normal
    }

    event.preventDefault(); // Bloquea el menú por defecto del navegador
    event.stopPropagation();
    this.openContextMenu(event, rowData);
  }

  /**
   * @private
   * @action Configura y muestra el menú contextual para escritorio.
   */
  openContextMenu(event: MouseEvent, rowData: any) {
    this.activeRow = rowData;
    this.contextMenuVisible = true;
    this.mobileMenuVisible = false;
    this.menuPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  /**
   * @private
   * @action Configura y muestra el menú móvil. Bloquea el scroll de fondo por UX.
   */
  openMobileMenu(rowData: any) {
    this.activeRow = rowData;
    this.mobileMenuVisible = true;
    this.contextMenuVisible = false;
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
  }

  /**
   * @listener document:click
   * @description Cierra cualquier menú flotante cuando el usuario hace clic 
   * en cualquier parte fuera de los menús.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.closeMenus();
  }

  /**
   * @listener document:contextmenu
   * @description Cierra el menú contextual si el usuario hace clic derecho 
   * fuera del área de una fila o de un menú ya abierto.
   */
  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si el clic derecho no fue sobre un menú contextual abierto ni sobre una fila de tabla
    if (!target.closest('app-context-menu') && !target.closest('tr')) {
      this.closeMenus();
    }
  }
}