import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { AuthFormBase } from '../shared/auth-form-base';
import { SubmitButtonComponent } from '../shared/submit-button.component';
import { AuthBottomLinkComponent } from '../shared/auth-bottom-link.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputComponent, SubmitButtonComponent, AuthBottomLinkComponent],
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordFormComponent extends AuthFormBase {
  @Output() onSubmit = new EventEmitter<string>();

  emailControl = new FormControl('', [Validators.required, Validators.email]);

  submit(): void {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    this.onSubmit.emit(this.emailControl.value ?? '');
  }
}
