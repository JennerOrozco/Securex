import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="actions">
      @if (showSelect) {
        <button class="act-btn select" pTooltip="Seleccionar" tooltipPosition="top" (click)="onSelect.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-check-circle"></i>
        </button>
      }
      @if (showCreate) {
        <button class="act-btn-create" [pTooltip]="createLabel" tooltipPosition="top" (click)="onCreate.emit(rowData); $event.stopPropagation()">
          <i class="pi" [ngClass]="createIcon" style="font-size: 11px;"></i>
          <span style="margin-left: 6px; font-weight: 600; font-size: 12px;">{{ createLabel }}</span>
        </button>
      }
      @if (showView) {
        <button class="act-btn view" pTooltip="Visualizar" tooltipPosition="top" (click)="onView.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-eye"></i>
        </button>
      }
      @if (showEdit) {
        <button class="act-btn edit" pTooltip="Editar" tooltipPosition="top" (click)="onEdit.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-pencil"></i>
        </button>
      }
      @if (showPdf) {
        <button class="act-btn pdf" pTooltip="PDF" tooltipPosition="top" style="color: var(--red-500); background: var(--red-50);" (click)="onPdf.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-file-pdf"></i>
        </button>
      }
      @if (showSend) {
        <button class="act-btn send" pTooltip="Enviar Correo" tooltipPosition="top" style="color: var(--emerald-500); background: var(--emerald-50);" (click)="onSend.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-send"></i>
        </button>
      }
      @if (showDuplicate) {
        <button class="act-btn duplicate" pTooltip="Duplicar" tooltipPosition="top" (click)="onDuplicate.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-copy"></i>
        </button>
      }
      @if (showPermissions) {
        <button class="act-btn perm" pTooltip="Permisos" tooltipPosition="top" (click)="onPermissions.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-shield"></i>
        </button>
      }
      @if (showDelete) {
        <button class="act-btn del" pTooltip="Eliminar" tooltipPosition="top" (click)="onDelete.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-trash"></i>
        </button>
      }
      @if (showActivate) {
        <button class="act-btn activate" pTooltip="Act./Des." tooltipPosition="top" (click)="onActivate.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-sync"></i>
        </button>
      }
    </div>
  `,
  styleUrl: './table-component.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableActionsComponent {
  @Input() rowData: any;

  @Input() showSelect = false;
  @Input() showCreate = false;
  @Input() createLabel = 'Crear';
  @Input() createIcon = 'pi-plus';
  @Input() showView = false;
  @Input() showEdit = false;
  @Input() showPdf = false;
  @Input() showSend = false;
  @Input() showDuplicate = false;
  @Input() showPermissions = false;
  @Input() showDelete = false;
  @Input() showActivate = false;

  @Output() onSelect = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onSend = new EventEmitter<any>();
  @Output() onDuplicate = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onActivate = new EventEmitter<any>();
}
