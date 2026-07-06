import { Component, ChangeDetectionStrategy, input, output, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { WebAuthnService } from '@core/services/webauthn.service';
import { TableComponent } from '@shared/table-shared/table-component/table-component.component';
import { PasswordChangeComponent } from './components/password-change/password-change.component';
import { DEVICE_TABLE_COLUMNS } from '../../profile.config';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SkeletonModule, TableComponent, PasswordChangeComponent],
  templateUrl: './profile-security.component.html',
  styleUrl: './profile-security.component.css',
})
export class ProfileSecurityComponent {
  private webauthnService = inject(WebAuthnService);
  private destroyRef = inject(DestroyRef);

  devices = input<any[]>([]);
  devicesLoading = input(false);

  onDeleteDevice = output<any>();
  onRefreshProfile = output();

  columns = DEVICE_TABLE_COLUMNS;
  biometricsLoading = signal(false);
  biometricsSuccess = signal(false);
  biometricsError = signal<string | null>(null);

  registerBiometrics() {
    this.biometricsError.set(null);
    this.biometricsSuccess.set(false);
    this.biometricsLoading.set(true);

    this.webauthnService.registerDevice().subscribe({
      next: () => {
        this.biometricsLoading.set(false);
        this.biometricsSuccess.set(true);
        this.onRefreshProfile.emit();
        timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.biometricsSuccess.set(false));
      },
      error: (err: any) => {
        this.biometricsLoading.set(false);
        this.biometricsError.set(err.message || err.error?.message || 'Error en el proceso de autenticación');
      }
    });
  }
}
