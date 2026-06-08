import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone, ChangeDetectorRef, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ConfigService } from '@core/services/config.service';
import { NotificationService } from '@core/services/notification.service';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';
import { forkJoin, timer } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    LoginFormComponent,
    RegisterFormComponent,
    ForgotPasswordFormComponent,
    ResetPasswordFormComponent
  ]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particlesContainer') set particles(content: ElementRef) {
    if (content) {
      this.particlesContainer = content;
      this.initParticles();
    }
  }
  particlesContainer!: ElementRef;
  @ViewChild('waveCanvas') waveCanvas!: ElementRef<HTMLCanvasElement>;
  private waveAnimId: number = 0;
  loading = false;
  loadingConfig = false;
  error: string | null = null;



  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'error';

  // New properties for password recovery
  view: 'login' | 'register' | 'forgot-password' | 'reset-password' = 'login';

  // We need to store the email for the reset password step
  resetEmail: string = '';

  // Multi-tenant company selection properties
  showCompanySelect = false;
  availableCompanies: any[] = [];
  selectedCompanyUuid: string = '';
  selectedBranchUuid: string = '';
  lastUsedCredentials: any = null;
  googleIdToken: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);

  ngOnInit() { }

  ngAfterViewInit() {
    this.initGoogleButton();
    this.initWaves();
  }

  private initWaves() {
    const canvas = this.waveCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const h = canvas.clientHeight || 400;
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(h);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const amp = H / 400;
      ctx.clearRect(0, 0, W, H);

      for (const layer of [
        { freqs: [3.5, 5.5, 8], amps: [30 * amp, 16 * amp, 8 * amp], speeds: [0.8, -0.5, 1.2], fill: 'rgba(100,18,18,0.3)', stroke: 'rgba(100,18,18,0.18)' },
        { freqs: [4.5, 7, 10], amps: [50 * amp, 28 * amp, 14 * amp], speeds: [1.3, -0.8, 0.5], fill: 'rgba(60,8,8,0.45)', stroke: 'rgba(60,8,8,0.25)' },
      ]) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x++) {
          const nx = x / W;
          let y = 0.35;
          for (let i = 0; i < layer.freqs.length; i++) {
            y += Math.sin(nx * Math.PI * layer.freqs[i] + t * layer.speeds[i]) * layer.amps[i] / 400;
          }
          ctx.lineTo(x, y * H);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = layer.fill;
        ctx.fill();
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      t += 0.0015;
      this.waveAnimId = requestAnimationFrame(draw);
    };

    draw();
  }

  ngOnDestroy() {
    if (this.waveAnimId) cancelAnimationFrame(this.waveAnimId);
  }

  private initParticles() {
    const container = this.particlesContainer?.nativeElement;
    if (!container) return;

    // Clear existing dots if any
    container.innerHTML = '';

    for (let i = 0; i < 80; i++) {
      const d = document.createElement('div');
      d.className = 'dot';
      const size = Math.random() * 8 + 4;
      d.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation-delay:${Math.random() * 6}s;
        animation-duration:${4 + Math.random() * 5}s;
      `;
      container.appendChild(d);
    }
  }

  private initGoogleButton(): void {
    if (typeof google === 'undefined') return;

    try {
      google.accounts.id.initialize({
        client_id: this.configService.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response)
      });

      const renderBtn = () => {
        const btn = document.getElementById('google-btn');
        if (btn) {
          google.accounts.id.renderButton(btn, {
            theme: 'outline',
            size: 'large',
            width: btn.parentElement?.clientWidth || 300,
            text: 'continue_with',
            shape: 'rectangular'
          });
          return true;
        }
        return false;
      };

      if (!renderBtn()) {
        const interval = setInterval(() => {
          if (renderBtn()) clearInterval(interval);
        }, 100);
        setTimeout(() => clearInterval(interval), 3000); // Stop after 3s
      }
    } catch (e) {
      console.error('Error initializing Google Button:', e);
    }
  }

  handleGoogleCredential(response: any) {
    this.ngZone.run(() => {
      if (response.credential) {
        this.loading = true;
        this.error = null;
        this.authService.loginWithGoogle(response.credential).subscribe({
          next: (res) => {
            this.loading = false;
            if (res.requires_company_select) {
              this.showCompanySelect = true;
              this.availableCompanies = res.companies || [];
              this.lastUsedCredentials = null;
              this.googleIdToken = response.credential;
              this.selectedCompanyUuid = '';
              this.selectedBranchUuid = '';
              this.cdr.detectChanges();
              return;
            }

            if (res.success) {
              this.showCompanySelect = false;
              const user = res.user;

              // All good, proceed to fetch profile and menu then redirect
              this.loadingConfig = true;
              this.cdr.detectChanges();
              forkJoin([
                this.authService.getUserProfile(),
                this.authService.refreshPermissions(),
                timer(2000)
              ]).subscribe({
                next: () => {
                  this.loadingConfig = false;
                  this.redirectUser(user);
                },
                error: () => {
                  this.loadingConfig = false;
                  this.redirectUser(user); // Fallback
                }
              });
            } else {
              this.error = res.error || 'Error al iniciar sesión con Google';
              this.cdr.detectChanges();
            }

          },
          error: (err) => {
            this.loading = false;
            console.error(err);
            this.error = 'Error de conexión con el servidor.';
            this.cdr.detectChanges();
          }
        })
      }
    });
  }



  redirectUser(user: any) {
    const firstRoute = this.authService.getFirstAccessibleRoute();
    if (firstRoute) {
      this.router.navigate([firstRoute]);
    } else {
      // Si no tiene acceso a nada, o bien va a home si es público, 
      // o se le desloguea según el requerimiento.
      this.router.navigate(['/home']);
    }
  }

  toggleMode(mode: string) {
    this.view = mode as 'login' | 'register' | 'forgot-password' | 'reset-password';
    this.error = null;
    this.toastMessage = null;

    if (this.view === 'login') {
      setTimeout(() => this.initGoogleButton(), 50);
    }
  }

  onRequestReset(email: string) {
    this.resetEmail = email;
    if (!this.resetEmail) {
      this.error = 'Por favor ingresa tu correo.';
      return;
    }
    this.loading = true;
    this.error = null;

    this.authService.requestPasswordReset(this.resetEmail).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.view = 'reset-password';
          this.showToast(res.message || 'Código enviado. Revisa tu correo.', 'success');
        } else {
          this.error = res.error || 'Error al solicitar recuperación.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Error de conexión. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  onResetPassword(data: any) {
    const { code, newPassword, confirmNewPassword } = data;

    if (!code || !newPassword || !confirmNewPassword) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }
    if (newPassword !== confirmNewPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.authService.resetPassword({
      email: this.resetEmail,
      code: code,
      newPassword: newPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.view = 'login';
          this.showToast('Contraseña actualizada. Inicia sesión.', 'success');
        } else {
          this.error = res.error || 'Error al restablecer contraseña.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Error de conexión. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  onRegister(data: any) {
    if (!data.name || !data.email || !data.password) {
      this.error = 'Por favor completa los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(data).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toggleMode('login');
          this.showToast('Registro exitoso. Por favor inicia sesión.', 'success');
        } else {
          this.error = res.error || 'Error al registrar.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.error = 'Error de conexión.';
        this.showToast('Error de conexión.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'error') {
    if (type === 'success') {
      this.notificationService.showSuccess(message);
    } else {
      this.notificationService.showError(message);
    }
  }

  login(credentials: any) {
    this.loading = true;
    this.error = null;
    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.requires_company_select) {
          this.showCompanySelect = true;
          this.availableCompanies = res.companies || [];
          this.lastUsedCredentials = credentials;
          this.googleIdToken = null;
          this.selectedCompanyUuid = '';
          this.selectedBranchUuid = '';
          this.cdr.detectChanges();
          return;
        }

        if (res.success) {
          this.showCompanySelect = false;
          this.loadingConfig = true;
          this.cdr.detectChanges();
          forkJoin([
            this.authService.getUserProfile(),
            this.authService.refreshPermissions(),
            timer(2000)
          ]).subscribe({
            next: () => {
              this.loadingConfig = false;
              this.redirectUser(res.user);
            },
            error: () => {
              this.loadingConfig = false;
              this.redirectUser(res.user);
            }
          });
        } else {
          this.error = res.error || 'Credenciales inválidas.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.error && err.error.error) {
          this.error = err.error.error;
        } else {
          this.error = 'Error de conexión con el servidor.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  selectCompany(company: any) {
    this.selectedCompanyUuid = company.uuid;
    this.selectedBranchUuid = company.branch_uuid || '';
  }

  confirmCompanySelect() {
    if (!this.selectedCompanyUuid) {
      this.error = 'Por favor selecciona una compañía.';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.googleIdToken) {
      this.authService.loginWithGoogle(this.googleIdToken, this.selectedCompanyUuid, this.selectedBranchUuid || undefined).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.showCompanySelect = false;
            this.authService.setUserCompanies(this.availableCompanies);
            const user = res.user;
            this.loadingConfig = true;
            this.cdr.detectChanges();
            forkJoin([
              this.authService.getUserProfile(),
              this.authService.refreshPermissions(),
              timer(2000)
            ]).subscribe({
              next: () => {
                this.loadingConfig = false;
                this.redirectUser(user);
              },
              error: () => {
                this.loadingConfig = false;
                this.redirectUser(user);
              }
            });
          } else {
            this.error = res.error || 'Error al iniciar sesión.';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error de conexión.';
          this.cdr.detectChanges();
        }
      });
    } else if (this.lastUsedCredentials) {
      const credentialsWithCompany: any = {
        ...this.lastUsedCredentials,
        company_uuid: this.selectedCompanyUuid
      };
      if (this.selectedBranchUuid) {
        credentialsWithCompany.branch_uuid = this.selectedBranchUuid;
      }
      this.authService.login(credentialsWithCompany).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.showCompanySelect = false;
            this.authService.setUserCompanies(this.availableCompanies);
            this.loadingConfig = true;
            this.cdr.detectChanges();
            forkJoin([
              this.authService.getUserProfile(),
              this.authService.refreshPermissions(),
              timer(2000)
            ]).subscribe({
              next: () => {
                this.loadingConfig = false;
                this.redirectUser(res.user);
              },
              error: () => {
                this.loadingConfig = false;
                this.redirectUser(res.user);
              }
            });
          } else {
            this.error = res.error || 'Error al iniciar sesión.';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error de conexión.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancelCompanySelect() {
    this.showCompanySelect = false;
    this.availableCompanies = [];
    this.selectedCompanyUuid = '';
    this.selectedBranchUuid = '';
    this.lastUsedCredentials = null;
    this.googleIdToken = null;
    this.error = null;
    this.cdr.detectChanges();
  }

  loginWithBiometrics(email: string) {
    this.loading = true;
    this.error = null;

    // Si no hay email, el backend genera challenge sin allowCredentials
    // y el browser muestra todas las huellas disponibles en el dispositivo
    this.authService.getWebAuthnLoginOptions(email || undefined).subscribe({
      next: async (response) => {
        try {
          const data = (response as any).options ? (response as any) : ((response as any).data ?? response);
          const options = data.options;
          const challengeBase64 = data.challenge;

          // El objeto real de opciones está dentro de 'publicKey'
          const pubKeyOptions: any = options?.publicKey ? { ...options.publicKey } : { ...options };

          if (!pubKeyOptions || !pubKeyOptions.challenge) {
            throw new Error('El backend no incluyó el challenge en las opciones.');
          }

          // Función para limpiar el formato =?BINARY?B?...?= que manda la librería PHP
          const extractBase64 = (str: string) => {
            if (typeof str !== 'string') return str;
            const match = str.match(/^=\?BINARY\?B\?(.+)\?=$/);
            return match ? match[1] : str;
          };

          // Convertir challenge de base64 a Buffer
          const base64Challenge = extractBase64(pubKeyOptions.challenge);
          pubKeyOptions.challenge = this.base64ToBuffer(base64Challenge);

          // Si el backend mandó allowCredentials con items, los convertimos.
          // Si vino vacío, lo eliminamos para que el browser use las passkeys del dispositivo.
          if (pubKeyOptions.allowCredentials && pubKeyOptions.allowCredentials.length > 0) {
            pubKeyOptions.allowCredentials = pubKeyOptions.allowCredentials.map((cred: any) => {
              if (cred && cred.id) {
                return { ...cred, id: this.base64ToBuffer(extractBase64(cred.id)) };
              }
              return cred;
            });
          } else {
            delete pubKeyOptions.allowCredentials;
          }

          // Llamar a la API del navegador
          const credential = await navigator.credentials.get({
            publicKey: pubKeyOptions
          }) as PublicKeyCredential;

          if (!credential) {
            throw new Error('No se pudo obtener la credencial.');
          }

          const responseObj = credential.response as AuthenticatorAssertionResponse;

          // Preparar datos para el backend
          // El userHandle identifica al usuario cuando no se mandó email
          const loginData = {
            id: credential.id,
            clientDataJSON: this.bufferToBase64(responseObj.clientDataJSON),
            authenticatorData: this.bufferToBase64(responseObj.authenticatorData),
            signature: this.bufferToBase64(responseObj.signature),
            userHandle: responseObj.userHandle ? this.bufferToBase64(responseObj.userHandle) : null,
            challenge: challengeBase64
          };

          // Enviar al backend
          this.authService.loginWithWebAuthn(loginData).subscribe({
            next: (res) => {
              this.loading = false;
              if (res.success) {
                this.loadingConfig = true;
                this.cdr.detectChanges();
                forkJoin([
                  this.authService.getUserProfile(),
                  this.authService.refreshPermissions(),
                  timer(2000)
                ]).subscribe({
                  next: () => {
                    this.loadingConfig = false;
                    this.redirectUser(res.user);
                  },
                  error: () => {
                    this.loadingConfig = false;
                    this.redirectUser(res.user);
                  }
                });
              } else {
                this.error = res.error || 'Error al iniciar sesión con huella.';
                this.cdr.detectChanges();
              }
            },
            error: (err) => {
              this.loading = false;
              this.error = err.error?.message || 'Error al verificar la huella en el servidor';
              this.cdr.detectChanges();
            }
          });

        } catch (err: any) {
          this.loading = false;
          if (err.name === 'NotAllowedError') {
            this.error = 'No se reconoció ninguna huella en este dispositivo.';
          } else {
            this.error = err.message || 'Error en el proceso de autenticación';
          }
          console.error(err);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al obtener opciones de inicio de sesión';
        this.cdr.detectChanges();
      }
    });
  }

  // Helper to convert base64 to ArrayBuffer (supports Base64URL)
  private base64ToBuffer(base64Url: string): ArrayBuffer {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = window.atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return buffer.buffer;
  }

  // Helper to convert ArrayBuffer to base64
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
