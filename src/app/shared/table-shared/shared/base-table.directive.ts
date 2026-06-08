import { Directive, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TableColumn } from './table.types';
import { ActionItem } from '../../components/action-menu.types';

@Directive()
export abstract class BaseTableDirective {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() loading: boolean = false;
  @Input() scrollHeight: string = 'calc(100vh - 300px)';
  @Input() rows: number = 10;
  @Input() addLabel: string = 'Añadir';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() reorderableColumns: boolean = true;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onColReorder = new EventEmitter<any>();

  // Menu State
  contextMenuVisible = false;
  mobileMenuVisible = false;
  menuPosition = { x: 0, y: 0 };
  activeRow: any = null;

  abstract get contextMenuItems(): ActionItem[];

  closeMenus() {
    this.contextMenuVisible = false;
    this.mobileMenuVisible = false;
    this.activeRow = null;
    document.body.style.overflow = '';
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768 && (this.mobileMenuVisible || this.contextMenuVisible)) {
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
    document.body.style.overflow = 'hidden';
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

  abstract executeAction(actionType: string): void;
}
