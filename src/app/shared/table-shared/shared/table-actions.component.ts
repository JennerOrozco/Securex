import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { TableActionsConfig } from './table.types';

export type { TableActionsConfig };

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  template: `
    <div class="actions">
      @if (config.select) {
         <button class="act-btn select" type="button" pTooltip="Seleccionar" tooltipPosition="top" (click)="onSelect.emit(rowData)">
           <i class="pi pi-check-circle"></i>
         </button>
       }
       @if (config.addChild) {
         <button class="act-btn add-child-btn" type="button" pTooltip="Agregar hijo" tooltipPosition="top" (click)="onAddChild.emit(rowData)">
           <i class="pi pi-plus"></i>
         </button>
       }
       @if (config.create) {
         <button class="act-btn create" type="button" [pTooltip]="config.createLabel || 'Crear'" tooltipPosition="top" (click)="onCreate.emit(rowData)">
           <i [class]="config.createIcon || 'pi pi-plus'"></i>
         </button>
       }
       @if (config.view) {
         <button class="act-btn view" type="button" pTooltip="Ver" tooltipPosition="top" (click)="onView.emit(rowData)">
           <i class="pi pi-eye"></i>
         </button>
       }
       @if (config.edit) {
         <button class="act-btn edit" type="button" pTooltip="Editar" tooltipPosition="top" (click)="onEdit.emit(rowData)">
           <i class="pi pi-pencil"></i>
         </button>
       }
       @if (config.pdf) {
         <button class="act-btn pdf" type="button" pTooltip="Descargar PDF" tooltipPosition="top" (click)="onPdf.emit(rowData)">
           <i class="pi pi-file-pdf"></i>
         </button>
       }
       @if (config.send) {
         <button class="act-btn send" type="button" pTooltip="Enviar Correo" tooltipPosition="top" (click)="onSend.emit(rowData)">
           <i class="pi pi-send"></i>
         </button>
       }
       @if (config.duplicate) {
         <button class="act-btn duplicate" type="button" pTooltip="Duplicar" tooltipPosition="top" (click)="onDuplicate.emit(rowData)">
           <i class="pi pi-copy"></i>
         </button>
       }
       @if (config.permissions) {
         <button class="act-btn perm" type="button" pTooltip="Permisos" tooltipPosition="top" (click)="onPermissions.emit(rowData)">
           <i class="pi pi-shield"></i>
         </button>
       }
       @if (config.activate) {
         <button class="act-btn activate" type="button" pTooltip="Activar" tooltipPosition="top" (click)="onActivate.emit(rowData)">
           <i class="pi pi-check"></i>
         </button>
       }
       @if (config.reset) {
         <button class="act-btn reset" type="button" pTooltip="Restablecer contraseña" tooltipPosition="top" (click)="onReset.emit(rowData)">
           <i class="pi pi-key"></i>
         </button>
       }
       @if (config.delete) {
        <button class="act-btn del" type="button" pTooltip="Eliminar" tooltipPosition="top" (click)="onDelete.emit(rowData)">
          <i class="pi pi-trash"></i>
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
  @Output() onActivate = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onReset = new EventEmitter<any>();
}
