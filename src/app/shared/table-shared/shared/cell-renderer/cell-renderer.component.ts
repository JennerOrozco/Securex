import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TableColumn } from '../table.types';
import { BadgeClassPipe } from '../badge-class.pipe';

@Component({
  selector: 'app-cell-renderer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    InputTextModule,
    BadgeClassPipe,
  ],
  template: `
    @switch (col.type) {
      @case ('status') {
        @if (getCellValue(rowData, col.field)) {
          <span class="type-chip" [ngClass]="getCellValue(rowData, col.field) | badgeClass">
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
        <span class="cell-currency">{{ getCellValue(rowData, col.field) | currency:'GTQ':'symbol-narrow':'1.2-2' }}</span>
      }
      @case ('boolean') {
        @if (getCellValue(rowData, col.field)) {
          <span class="type-chip type-true">Sí</span>
        } @else {
          <span class="type-chip type-false">No</span>
        }
      }
      @case ('badge') {
        @if (getCellValue(rowData, col.field)) {
          <span class="type-chip" [ngClass]="getCellValue(rowData, col.field) | badgeClass">
            {{ getCellValue(rowData, col.field) }}
          </span>
        }
      }
      @case ('user') {
        <div class="user-cell">
          <div class="avatar"><i class="pi pi-user"></i></div>
          <div>
            <span class="user-name">{{ getCellValue(rowData, col.field) }}</span>
            @if (col.subField && getCellValue(rowData, col.subField)) {
              <span class="user-email">{{ getCellValue(rowData, col.subField) }}</span>
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
        <span class="rol-badge" [ngClass]="getRoleClass(getCellValue(rowData, col.field))">
          {{ getCellValue(rowData, col.field) }}
        </span>
      }
      @case ('toggle') {
        <span class="badge-toggle" [ngClass]="getCellValue(rowData, col.field) ? 'badge-on' : 'badge-off'">
          {{ getCellValue(rowData, col.field) ? (col.toggleTrueLabel || 'Activo') : (col.toggleFalseLabel || 'Inactivo') }}
        </span>
      }
      @case ('filesize') {
        <span class="cell-filesize">{{ formatFileSize(getCellValue(rowData, col.field)) }}</span>
      }
      @case ('validation') {
        @if (getCellValue(rowData, col.field)) {
          <i class="pi pi-check-circle text-green-500" style="font-size: 1.25rem;"></i>
        } @else {
          <i class="pi pi-times-circle text-red-400" style="font-size: 1.25rem;"></i>
        }
      }
      @default {
        @if (getCellValue(rowData, col.field) != null) {
          <span class="cell-text">{{ getCellValue(rowData, col.field) }}</span>
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellRendererComponent {
  @Input() col!: TableColumn;
  @Input() rowData!: any;

  /**
   * Obtiene de forma segura valores de propiedades planas o anidadas con notación de punto (.)
   */
  getCellValue(rowData: any, field: string | undefined): any {
    if (!rowData || !field) return null;
    return field.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), rowData);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) {
      fallback.style.setProperty('display', 'flex');
    }
  }

  getRoleClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'rol-admin';
      case 'user': return 'rol-viewer';
      default: return '';
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
  }
}