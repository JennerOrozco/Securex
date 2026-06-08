import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

export interface TableActionsConfig {
  select?: boolean;
  create?: boolean;
  createLabel?: string;
  createIcon?: string;
  view?: boolean;
  edit?: boolean;
  addChild?: boolean;
  pdf?: boolean;
  send?: boolean;
  duplicate?: boolean;
  permissions?: boolean;
  delete?: boolean;
  activate?: boolean;
  reset?: boolean;
}

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="actions">
      @if (config.addChild) {
        <button class="act-btn view" pTooltip="Agregar Sub-elemento" tooltipPosition="top" (click)="onAddChild.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-plus"></i>
        </button>
      }
      @if (config.select) {
        <button class="act-btn select" pTooltip="Seleccionar" tooltipPosition="top" (click)="onSelect.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-check-circle"></i>
        </button>
      }
      @if (config.create) {
        <button class="btn btn--navy btn-sm" [pTooltip]="config.createLabel || 'Crear'" tooltipPosition="top" (click)="onCreate.emit(rowData); $event.stopPropagation()">
          <i class="pi" [ngClass]="config.createIcon || 'pi-plus'"></i>
          <span class="create-label-text">{{ config.createLabel || 'Crear' }}</span>
        </button>
      }
      @if (config.view) {
        <button class="act-btn view" pTooltip="Visualizar" tooltipPosition="top" (click)="onView.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-eye"></i>
        </button>
      }
      @if (config.edit) {
        <button class="act-btn edit" pTooltip="Editar" tooltipPosition="top" (click)="onEdit.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-pencil"></i>
        </button>
      }
      @if (config.pdf) {
        <button class="act-btn pdf" pTooltip="PDF" tooltipPosition="top" (click)="onPdf.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-file-pdf"></i>
        </button>
      }
      @if (config.send) {
        <button class="act-btn send" pTooltip="Enviar Correo" tooltipPosition="top" (click)="onSend.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-send"></i>
        </button>
      }
      @if (config.duplicate) {
        <button class="act-btn duplicate" pTooltip="Duplicar" tooltipPosition="top" (click)="onDuplicate.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-copy"></i>
        </button>
      }
      @if (config.permissions) {
        <button class="act-btn perm" pTooltip="Permisos" tooltipPosition="top" (click)="onPermissions.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-shield"></i>
        </button>
      }
      @if (config.delete) {
        <button class="act-btn del" pTooltip="Eliminar" tooltipPosition="top" (click)="onDelete.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-trash"></i>
        </button>
      }
      @if (config.activate) {
        <button class="act-btn activate" pTooltip="Act./Des." tooltipPosition="top" (click)="onActivate.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-sync"></i>
        </button>
      }
      @if (config.reset) {
        <button class="act-btn reset" pTooltip="Restablecer contraseña" tooltipPosition="top" (click)="onReset.emit(rowData); $event.stopPropagation()">
          <i class="pi pi-key"></i>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableActionsComponent {
  @Input() rowData: any;
  @Input() config: TableActionsConfig = {};

  @Output() onSelect = new EventEmitter<any>();
  @Output() onAddChild = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onPdf = new EventEmitter<any>();
  @Output() onSend = new EventEmitter<any>();
  @Output() onDuplicate = new EventEmitter<any>();
  @Output() onPermissions = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onActivate = new EventEmitter<any>();
  @Output() onReset = new EventEmitter<any>();
}
