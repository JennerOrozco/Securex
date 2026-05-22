import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    RippleModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [breakpoints]="{ '960px': '80vw', '768px': '92vw', '480px': '96vw' }"
      (onHide)="onClose.emit()"
      [draggable]="true"
      [resizable]="false"
      styleClass="gm-dialog gm-dialog--delete"
      class="gm-dialog gm-dialog--delete">

      <ng-template pTemplate="header">
        <div class="gm-header">
          <div class="gm-header-icon gm-icon--delete">
            <i class="pi pi-trash"></i>
          </div>
          <div class="gm-header-text">
            <h2 class="gm-title">{{ title }}</h2>
          </div>
        </div>
      </ng-template>

      <div class="gm-body">
        <div class="gm-delete-zone">
          <div class="gm-delete-icon-wrap">
            <div class="gm-delete-ring gm-delete-ring--3"></div>
            <div class="gm-delete-ring gm-delete-ring--2"></div>
            <div class="gm-delete-ring gm-delete-ring--1"></div>
            <i class="pi pi-trash gm-delete-icon"></i>
          </div>
          <p class="gm-delete-title">{{ bodyTitle }}</p>
          <p class="gm-delete-sub" [innerHTML]="bodyMessage"></p>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="gm-footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" styleClass="gm-btn gm-btn--cancel" (onClick)="onClose.emit()"></p-button>
          <p-button [label]="confirmButtonLabel" icon="pi pi-trash" [severity]="confirmSeverity" [loading]="loading" styleClass="gm-btn gm-btn--confirm" (onClick)="onConfirm.emit()"></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styleUrls: ['../modals.css']
})
export class DeleteModalComponent {
  @Input() visible = false;
  @Input() title = 'Eliminar Registro';
  @Input() loading = false;
  @Input() bodyTitle = '¿Eliminar este registro?';
  @Input() bodyMessage = 'Esta acción es <strong>permanente</strong> y no puede deshacerse. El registro desaparecerá de inmediato.';
  @Input() confirmLabel = 'Sí, eliminar';
  @Input() confirmSeverity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = 'danger';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  get confirmButtonLabel(): string {
    if (typeof window !== 'undefined' && window.innerWidth <= 480) {
      return 'Aceptar';
    }
    return this.confirmLabel;
  }
}
