import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputComponent, PasswordComponent],
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styles: [`
    .actions-wrap {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      width: 100%;
      align-items: stretch;
    }
    .actions-wrap .btn-login {
      flex: 1;
    }
  `],
  standalone: true
})
export class LoginFormComponent implements OnInit {
  @Input() loading = false;
  @Output() onSubmit = new EventEmitter<{ email: string; password: string }>();
  @Output() onToggleMode = new EventEmitter<string>();
  @Output() onBiometricLogin = new EventEmitter<string>();

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  rememberMe = false;

  ngOnInit() {
    const saved = localStorage.getItem('securex_remembered_email');
    if (saved) {
      this.loginForm.patchValue({ email: saved });
      this.rememberMe = true;
    }
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.saveEmailIfNeeded();
    this.onSubmit.emit({
      email: this.loginForm.value.email ?? '',
      password: this.loginForm.value.password ?? ''
    });
  }

  biometricLogin(): void {
    this.saveEmailIfNeeded();
    const email = this.loginForm.value.email ?? '';
    this.onBiometricLogin.emit(email);
  }

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }

  private saveEmailIfNeeded(): void {
    const email = this.loginForm.value.email ?? '';
    if (this.rememberMe && email) {
      localStorage.setItem('securex_remembered_email', email);
    } else if (!this.rememberMe) {
      localStorage.removeItem('securex_remembered_email');
    }
  }
}