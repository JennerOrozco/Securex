import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputComponent],
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  standalone: true
})
export class ForgotPasswordFormComponent {
  @Input() loading = false;
  @Output() onSubmit = new EventEmitter<string>();
  @Output() onToggleMode = new EventEmitter<string>();

  emailControl = new FormControl('', [Validators.required, Validators.email]);

  submit(event: Event): void {
    event.preventDefault();
    console.log(' [ForgotPasswordForm] submit() called');
    if (this.emailControl.invalid) {
      console.log(' [ForgotPasswordForm] Form is invalid');
      this.emailControl.markAsTouched();
      return;
    }
    console.log(' [ForgotPasswordForm] Form is valid, emitting email:', this.emailControl.value);
    this.onSubmit.emit(this.emailControl.value ?? '');
  }

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }
}