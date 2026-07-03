import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShellComponent } from '../modal-shell.component';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ModalShellComponent,
  ],
  templateUrl: './reset-password-modal.component.html'
})
export class ResetPasswordModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() title = 'Restablecer Contraseña';
  @Input() loading = false;
  @Input() userEmail = '';
  @Input() userName = '';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
}
