import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputComponent, PasswordComponent],
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['../auth-shared.css'],
  styles: [`
    .actions-wrap {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      width: 100%;
      align-items: stretch; /* Ensure both buttons have the same height */
    }
    .btn-login {
      flex: 1;
    }
    .btn-biometric {
      padding: 0 1.2rem;
      background: linear-gradient(135deg, #dc2626 0%, #880c0c 100%);
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
    }
    .btn-biometric:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(220, 38, 38, 0.55);
    }
    .btn-biometric:active:not(:disabled) {
      transform: scale(0.95);
    }
    .btn-biometric:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
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
    const saved = localStorage.getItem('ggts_remembered_email');
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
      localStorage.setItem('ggts_remembered_email', email);
    } else if (!this.rememberMe) {
      localStorage.removeItem('ggts_remembered_email');
    }
  }
}