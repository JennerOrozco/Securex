import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Output } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';
import { AuthFormBase } from '../shared/auth-form-base';
import { SubmitButtonComponent } from '../shared/submit-button.component';
import { AuthBottomLinkComponent } from '../shared/auth-bottom-link.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, InputComponent, PasswordComponent, SubmitButtonComponent, AuthBottomLinkComponent],
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  standalone: true
})
export class ResetPasswordFormComponent extends AuthFormBase {
  @Output() onSubmit = new EventEmitter<{ code: string; newPassword: string; confirmNewPassword: string }>();

  resetForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmNewPassword: new FormControl('', [Validators.required])
  });

  submit(): void {
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
}
