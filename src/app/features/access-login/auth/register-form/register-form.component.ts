import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Output, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PasswordComponent } from '@shared/components/password/password.component';
import { AuthFormBase } from '../shared/auth-form-base';
import { SubmitButtonComponent } from '../shared/submit-button.component';
import { AuthBottomLinkComponent } from '../shared/auth-bottom-link.component';
import { ConfigService } from '@core/services/config.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, InputComponent, PasswordComponent, SubmitButtonComponent, AuthBottomLinkComponent],
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterFormComponent extends AuthFormBase implements OnInit, OnDestroy {
  @Output() onSubmit = new EventEmitter<Record<string, string>>();

  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  captchaResponse: string | null = null;
  recaptchaSiteKey = '';
  private recaptchaScript: HTMLScriptElement | null = null;

  ngOnInit(): void {
    this.recaptchaSiteKey = this.configService.recaptchaSiteKey;

    (window as any).onCaptchaSuccess = (response: string) => {
      this.captchaResponse = response;
    };

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    this.recaptchaScript = script;
  }

  ngOnDestroy(): void {
    delete (window as any).onCaptchaSuccess;
    if (this.recaptchaScript) {
      this.recaptchaScript.remove();
      this.recaptchaScript = null;
    }
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.captchaResponse) {
      this.notificationService.warn('Por favor completa el captcha.');
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
}
