import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalShellComponent } from '../modal-shell.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

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
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() visible = false;
  @Input() title = 'Restablecer Contraseña';
  @Input() userEmail = '';
  @Input() userName = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  loading = false;

  confirm(): void {
    if (!this.userEmail) return;
    this.loading = true;
    this.authService.adminResetUserPassword(this.userEmail).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.visible = false;
        this.visibleChange.emit(false);
        this.onClose.emit();
        if (res.success) {
          this.notificationService.success(`Código de restablecimiento enviado a ${this.userEmail}`);
        } else {
          this.notificationService.notify('error', res.error || 'No se pudo enviar el código.');
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.notificationService.notify('error', 'Error al enviar el código de restablecimiento.');
        this.cdr.markForCheck();
      }
    });
  }
}
