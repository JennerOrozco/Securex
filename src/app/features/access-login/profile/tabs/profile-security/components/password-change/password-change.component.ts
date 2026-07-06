import { Component, ChangeDetectionStrategy, output, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileService } from '@core/services/profile.service';
import { FormMapperService } from '@core/services/form-mapper.service';
import { PasswordComponent } from '@shared/components/password/password.component';

@Component({
  selector: 'app-password-change',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordComponent],
  templateUrl: './password-change.component.html',
  styleUrl: './password-change.component.css',
})
export class PasswordChangeComponent {
  private profileService = inject(ProfileService);
  private formMapper = inject(FormMapperService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  passwordUpdated = output();

  passwordForm: FormGroup;
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.matchValidator });
  }

  private matchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.error.set(null);
    this.success.set(false);

    const payload = this.formMapper.mapPayload(this.passwordForm.value, {
      mode: 'edit',
      alias: { currentPassword: 'old_password', newPassword: 'new_password' },
    });

    this.loading.set(true);
    this.profileService.changePassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.passwordForm.reset();
        this.passwordUpdated.emit();
        timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.success.set(false));
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }
}
