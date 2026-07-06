import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
// Force compiler rebuild to recognize copyable property in TableColumn
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TableColumn } from '../table.types';
import { BadgeClassPipe } from '@shared/pipes';
import { BooleanTextPipe, CurrencyFormatPipe } from '@shared/pipes';
import { formatFileSize } from '@shared/utils/file-utils';
import { NotificationService } from '@core/services/notification.service';

/**
 * @component CellRendererComponent
 * @description
 * Componente presentacional encargado de renderizar dinámicamente el contenido de una celda
 * en una tabla de datos. Soporta múltiples tipos de visualización (texto, imágenes, 
 * monedas, booleanos, etiquetas, usuarios, etc.) basándose en la configuración de la columna.
 * * Utiliza la moderna sintaxis de control de flujo de Angular (`@switch`, `@if`) para decidir 
 * en tiempo de ejecución cómo dibujar la celda.
 */
@Component({
  selector: 'app-cell-renderer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    InputTextModule,
    BadgeClassPipe,
    BooleanTextPipe,
    CurrencyFormatPipe,
  ],
  template: `
    @switch (col.type) {
      @case ('status') {
        @if (getCellValue(rowData, col.field)) {
          <span class="type-chip" [ngClass]="getRawValue(rowData, col.field) | badgeClass">
            {{ getCellValue(rowData, col.field) }}
          </span>
        }
      }
      
      @case ('image') {
        <div class="table-logo-container">
          @if (getCellValue(rowData, col.field)) {
            <img [src]="getCellValue(rowData, col.field)" alt="Logo" class="table-logo-img"
              (error)="onImageError($event)" />
            <div class="table-logo-fallback" style="display: none;">
              <i [class]="col.fallbackIcon || 'pi pi-building'"></i>
            </div>
          } @else {
            <div class="table-logo-fallback">
              <i [class]="col.fallbackIcon || 'pi pi-building'"></i>
            </div>
          }
        </div>
      }
      
      @case ('date') {
        <span class="cell-date">{{ getCellValue(rowData, col.field) | date:'dd/MM/yyyy HH:mm' }}</span>
      }
      
      @case ('currency') {
        <span class="cell-currency">{{ getCellValue(rowData, col.field) | currencyFormat:'Q':2 }}</span>
      }
      
      @case ('boolean') {
        <span class="type-chip" [ngClass]="getCellValue(rowData, col.field) ? 'type-true' : 'type-false'">
          {{ getCellValue(rowData, col.field) | booleanText:col.toggleTrueLabel:col.toggleFalseLabel:'yesno' }}
        </span>
      }
      
      @case ('badge') {
        @if (getCellValue(rowData, col.field)) {
          <span class="type-chip" [ngClass]="getBadgeSeverityClass(getCellValue(rowData, col.field), getRawValue(rowData, col.field))"
                [ngStyle]="col.cellStyle ? col.cellStyle(rowData) : undefined">
            {{ getBadgeLabel(getCellValue(rowData, col.field)) }}
          </span>
        }
      }
      
      @case ('user') {
        <div class="user-cell">
          @if (!col.hideAvatar) {
            <div class="avatar">
              @if (!col.fallbackIcon && getAvatarValue(rowData, col)) {
                <img [src]="getAvatarValue(rowData, col)" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />
              } @else {
                <i [class]="col.fallbackIcon || 'pi pi-user'"></i>
              }
            </div>
          }
          <div>
            <span class="user-name">{{ getCellValue(rowData, col.field) }}</span>
            @if (col.subField && getSubCellValue(rowData, col)) {
              <span class="user-email">{{ getSubCellValue(rowData, col) }}</span>
            }
          </div>
        </div>
      }
      
      @case ('link') {
        <a class="cell-link" [href]="getCellValue(rowData, col.field)" target="_blank" rel="noopener noreferrer">
          {{ getCellValue(rowData, col.field) }}
        </a>
      }
      
      @case ('role') {
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span class="rol-badge" [ngClass]="getRoleClass(getCellValue(rowData, col.field))" style="align-self: flex-start;">
            {{ getCellValue(rowData, col.field) }}
          </span>
          @if (col.subField && getSubCellValue(rowData, col)) {
            <span style="font-size: 0.75rem; color: var(--color-text-muted, #64748b);">{{ getSubCellValue(rowData, col) }}</span>
          }
        </div>
      }
      
      @case ('toggle') {
        <span class="badge-toggle" [ngClass]="getCellValue(rowData, col.field) ? 'badge-on' : 'badge-off'">
          {{ getCellValue(rowData, col.field) ? (col.toggleTrueLabel || 'Activo') : (col.toggleFalseLabel || 'Inactivo') }}
        </span>
      }
      
      @case ('filesize') {
        <span class="cell-filesize">{{ formatFileSize(getCellValue(rowData, col.field)) }}</span>
      }
      
      @case ('icon') {
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          @if (getCellValue(rowData, col.field)) {
            <i [class]="getCellValue(rowData, col.field)" style="font-size: 1.15rem; color: var(--sys-primary-hex, #10b981);"></i>
            <span class="cell-text" style="font-family: monospace; font-size: 0.8rem;">{{ getCellValue(rowData, col.field) }}</span>
          } @else {
            <span style="color: var(--sys-text-light, #94a3b8); font-style: italic; font-size: 0.8rem;">Sin ícono</span>
          }
        </div>
      }
      
      @case ('validation') {
        @if (getCellValue(rowData, col.field)) {
          <i class="pi pi-check-circle text-green-500" style="font-size: 1.25rem;"></i>
        } @else {
          <i class="pi pi-times-circle text-red-400" style="font-size: 1.25rem;"></i>
        }
      }
      
      @default {
        <div style="display: flex; flex-direction: column; gap: 2px;">
          @if (getCellValue(rowData, col.field) != null) {
            <span class="cell-text" [class.clickable]="col.copyable !== false"
              [ngStyle]="{'font-weight': col.subField ? '500' : 'normal', 'color': col.subField ? 'var(--text-color, #1e293b)' : 'inherit'}"
              (click)="copyToClipboard(getCellValue(rowData, col.field), col.field, $event)"
              [pTooltip]="col.copyable !== false ? 'Clic para copiar' : ''"
              tooltipPosition="top">
              {{ getCellValue(rowData, col.field) }}
            </span>
          }
          @if (col.subField && getSubCellValue(rowData, col)) {
            <span style="font-size: 0.75rem; color: var(--text-color-secondary, #64748b);">{{ getSubCellValue(rowData, col) }}</span>
          }
        </div>
      }
    }
  `,
  // Optimización de rendimiento: Solo re-renderiza la celda si cambian los inputs (col, rowData)
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellRendererComponent {
  private notification = inject(NotificationService);

  /** Configuración de la columna que define el tipo de celda, el campo de datos a leer y parámetros extra de renderizado. */
  @Input() col!: TableColumn;

  /** El objeto de datos completo correspondiente a la fila actual de la tabla. */
  @Input() rowData!: any;

  /**
   * Extrae el valor de la celda navegando por el objeto `rowData`.
   * Permite funciones personalizadas de renderizado y navegación profunda utilizando notación de puntos o arreglos.
   * * @param {any} rowData - El objeto de datos de la fila.
   * @param {string | undefined} field - La ruta del campo (ej. 'user.name' o 'access[0].role').
   * @returns {any} El valor extraído, el resultado de la función `render` personalizada, o nulo/indefinido.
   */
  getCellValue(rowData: any, colField: string | undefined): any {
    if (!rowData || !colField) return null;

    let field = colField;

    // Ejecuta el renderizador personalizado si está definido para este campo
    if (field === this.col.field && this.col.render) {
      if (typeof this.col.render === 'function') {
        return this.col.render(rowData);
      }
      field = this.col.render; // Si no es función, asume que es una propiedad alternativa en el objeto
    }

    return this.getRawValue(rowData, field);
  }

  /**
   * Extrae el valor crudo original (sin aplicar el `render`).
   */
  getRawValue(rowData: any, field: string | undefined): any {
    if (!rowData || !field) return null;

    // Normalizador: Transforma caminos con notación de corchetes a notación de puntos.
    // Ejemplo: 'access[0].role' se convierte en 'access.0.role'
    const normalizedField = field.replace(/\[(\d+)\]/g, '.$1');

    // Navega profundamente por el objeto para encontrar el valor final
    return normalizedField.split('.').reduce((obj, key) => {
      // Manejo especial para acceder a índices de arreglos dentro de la ruta
      if (Array.isArray(obj) && !isNaN(Number(key))) {
        return obj[Number(key)];
      }
      return obj ? obj[key] : undefined;
    }, rowData);
  }

  /**
   * Extrae el valor secundario (subcampo) para celdas compuestas (como la de tipo 'user').
   * Respeta renderizadores personalizados de subcampos si están definidos en la configuración de la columna.
   * * @param {any} rowData - El objeto de datos de la fila.
   * @param {TableColumn} col - La configuración de la columna actual.
   * @returns {any} El valor del subcampo extraído.
   */
  getSubCellValue(rowData: any, col: TableColumn): any {
    if (!rowData || !col) return null;

    if (col.subFieldRender) {
      if (typeof col.subFieldRender === 'function') {
        return col.subFieldRender(rowData);
      }
      return this.getCellValue(rowData, col.subFieldRender);
    }

    return this.getCellValue(rowData, col.subField);
  }

  /**
   * Extrae el valor de la imagen de avatar respetando configuraciones declarativas.
   */
  getAvatarValue(rowData: any, col: TableColumn): any {
    if (!rowData || !col) return null;

    if (col.avatarRender) {
      if (typeof col.avatarRender === 'function') return col.avatarRender(rowData);
      return this.getCellValue(rowData, col.avatarRender);
    }

    if (col.avatarField) {
      return this.getCellValue(rowData, col.avatarField);
    }

    // Fallbacks originales para compatibilidad con código antiguo
    return this.getRawValue(rowData, 'profile_picture') || this.getRawValue(rowData, 'access.0.profile_picture');
  }

  /**
   * Manejador de eventos nativo del DOM para cuando una imagen (ej. logo o avatar) falla al cargar (Error 404).
   * Oculta la etiqueta `<img>` rota y hace visible el `<div>` adyacente que contiene el ícono de respaldo (fallback).
   * * @param {Event} event - El evento de error nativo de la imagen.
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) {
      fallback.style.setProperty('display', 'flex');
    }
  }

  /**
   * Mapea un nombre de rol en texto plano a una clase CSS específica para dar estilo visual al badge.
   * @param {string} role - El nombre del rol a evaluar.
   * @returns {string} La clase CSS correspondiente.
   */
  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'rol-admin';
      case 'user': return 'rol-viewer';
      default: return '';
    }
  }

  /**
   * Helper functions para procesar badges que pueden retornar strings u objetos { value, severity }
   */
  getBadgeLabel(val: any): string {
    if (val && typeof val === 'object' && 'value' in val) return val.value;
    return val;
  }

  getBadgeSeverityClass(val: any, raw: any): string {
    if (val && typeof val === 'object') {
      if (val.severity) return `type-${val.severity}`;
      if (val.value) return `type-${val.value.toString().toLowerCase()}`;
    }
    if (raw == null) return 'type-default';
    return `type-${raw.toString().toLowerCase()}`;
  }

  /**
   * Convierte un valor numérico expresado en bytes a una cadena de texto legible humana (KB, MB, GB).
   * Utiliza base 1024 para cálculos de almacenamiento estándar.
   * * @param {number} bytes - Tamaño del archivo o dato en bytes.
   * @returns {string} Una cadena formateada (ej. "1.5 MB").
   */
  formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  copyToClipboard(value: any, field: string | undefined, event: MouseEvent): void {
    if (!value || this.col.copyable === false) return;
    event.stopPropagation();
    const text = String(value);
    navigator.clipboard.writeText(text).then(() => {
      this.notification.success('Copiado al portapapeles');
    }).catch(() => {
      this.notification.info('Selecciona y copia manualmente');
    });
  }
}