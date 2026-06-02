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
  selector: 'app-send-email-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ModalShellComponent,
  ],
  templateUrl: './send-email-modal.component.html'
})
export class SendEmailModalComponent {
  @Input() visible = false;
  @Input() title = 'Enviar Correo';
  @Input() loading = false;
  @Input() emails: string[] = [];
  @Input() bodyMessage = '';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
}
