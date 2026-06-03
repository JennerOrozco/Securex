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
  templateUrl: './delete-modal.component.html',
  styleUrls: ['../../modals.css']
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
