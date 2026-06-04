import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, InputComponent, PasswordComponent],
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  standalone: true
})
export class ResetPasswordFormComponent {
  @Input() loading = false;
  @Output() onSubmit = new EventEmitter<{ code: string; newPassword: string; confirmNewPassword: string }>();
  @Output() onToggleMode = new EventEmitter<string>();

  resetForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmNewPassword: new FormControl('', [Validators.required])
  });

  submit(event: Event): void {
    event.preventDefault();
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    this.onSubmit.emit({
      code: this.resetForm.value.code ?? '',
      newPassword: this.resetForm.value.newPassword ?? '',
      confirmNewPassword: this.resetForm.value.confirmNewPassword ?? ''
    });
  }

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }
}
