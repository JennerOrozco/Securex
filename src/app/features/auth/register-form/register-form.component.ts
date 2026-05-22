import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';

@Component({
  imports: [CommonModule, ReactiveFormsModule, InputComponent, PasswordComponent],
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['../auth-shared.css'],
  standalone: true
})
export class RegisterFormComponent implements OnInit, OnDestroy {
  @Input() loading = false;
  @Output() onSubmit = new EventEmitter<Record<string, string>>();
  @Output() onToggleMode = new EventEmitter<string>();

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  captchaResponse: string | null = null;

  ngOnInit(): void {
    // Definir el callback global para el captcha
    (window as any).onCaptchaSuccess = (response: string) => {
      this.captchaResponse = response;
    };

    // Cargar el script de Google reCAPTCHA
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  ngOnDestroy(): void {
    // Limpiar el callback global
    delete (window as any).onCaptchaSuccess;
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.captchaResponse) {
      alert('Por favor completa el captcha.');
      return;
    }

    const data: Record<string, string> = {};
    const formValue = this.registerForm.value;
    for (const key of Object.keys(formValue)) {
      data[key] = (formValue as Record<string, string | null | undefined>)[key] ?? '';
    }
    data['captcha'] = this.captchaResponse;
    this.onSubmit.emit(data);
  }

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }
}
