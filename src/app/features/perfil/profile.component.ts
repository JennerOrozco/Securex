import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { WebAuthnService } from '../../core/services/webauthn.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordComponent } from '../../shared/components/password/password.component';
import { TableComponent, TableColumn } from '../../shared/table-shared/table-component/table-component.component';
import { SkeletonModule } from 'primeng/skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeleteModalComponent } from '../../shared/modals/modal-shell/delete-modal/delete-modal.component';
import { ImageCropperComponent } from '../../shared/components/image-cropper/image-cropper.component';
import { base64ToBuffer, bufferToBase64, extractBase64 } from '../../shared/utils/webauthn-utils';

export interface ProfileData {
  uuid: string;
  full_name: string;
  email: string;
  role_name?: string;
  role_id?: number;
  company_name?: string;
  branch?: {
    uuid: string;
    name: string;
  };
  profile_picture?: string;
  phone?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordComponent, TableComponent, DeleteModalComponent, ImageCropperComponent, SkeletonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private webauthnService = inject(WebAuthnService);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  deleteModalVisible = signal(false);
  itemToDelete: any = null;
  cropVisible = signal(false);
  avatarDragOver = signal(false);

  profileData = signal<ProfileData | null>(null);
  profileLoading = signal<boolean>(true);
  profileError = signal<string | null>(null);
  avatarLoading = signal<boolean>(false);
 
  devices = signal<any[]>([]);
  devicesLoading = signal<boolean>(false);
  
  columns: TableColumn[] = [
    { field: 'device_name', header: 'Dispositivo', type: 'text' },
    { field: 'created_at', header: 'Fecha de Registro', type: 'date' },
    { field: 'acciones', header: 'Acciones', type: 'actions' }
  ];

  activeTab = signal<string>('info');

  passwordForm!: FormGroup;
  passwordLoading = signal<boolean>(false);
  passwordSuccess = signal<boolean>(false);
  passwordError = signal<string | null>(null);

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.profileData.set({
        uuid: currentUser.uuid,
        full_name: currentUser.full_name,
        email: currentUser.email,
        role_name: currentUser.role_name,
        profile_picture: currentUser.profile_picture,
      });
    }

    this.loadDevices();

    this.profileService.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = response.data || response;
          this.profileData.set(data);
          this.profileLoading.set(false);
        },
        error: () => {
          this.profileError.set('Error al cargar el perfil. Intente de nuevo.');
          this.profileLoading.set(false);
        }
      });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    if (tab === 'security') {
      this.loadDevices();
    }
  }

  fortifyAccount() {
    this.setTab('security');
  }

  loadDevices() {
    this.devicesLoading.set(true);
    this.webauthnService.getCredentials()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const devicesData = Array.isArray(res) ? res : (res.data || []);
          this.devices.set(devicesData);
          this.devicesLoading.set(false);
        },
        error: (err) => {
          this.devicesLoading.set(false);
        }
      });
  }

  deleteDevice(device: any) {
    this.itemToDelete = device;
    this.deleteModalVisible.set(true);
  }

  handleConfirmDelete() {
    if (!this.itemToDelete) return;
    
    if (this.itemToDelete.type === 'picture') {
      this.deleteModalVisible.set(false);
      this.itemToDelete = null;
      this.performDeletePicture();
      return;
    }
    
    this.webauthnService.deleteCredential(this.itemToDelete.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteModalVisible.set(false);
          this.itemToDelete = null;
          this.loadDevices();
        },
        error: () => {
          this.notificationService.error('Error al eliminar dispositivo');
        }
      });
  }

  getUserInitials(): string {
    const name = this.profileData()?.full_name || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  openCropModal() {
    this.cropVisible.set(true);
  }

  onAvatarDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver.set(true);
  }

  onAvatarDragLeave() {
    this.avatarDragOver.set(false);
  }

  onAvatarDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.avatarDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.openCropModal();
    }
  }

  handleCrop(croppedFile: File) {
    this.avatarLoading.set(true);

    this.profileService.uploadPicture(croppedFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data || res;
          const newUrl = data.url;
          this.profileData.update(profile => profile ? { ...profile, profile_picture: newUrl } : null);
          this.avatarLoading.set(false);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Error al subir la foto de perfil.');
          this.avatarLoading.set(false);
        }
      });
  }

  handleCropClose() {
    this.cropVisible.set(false);
  }

  deleteProfilePicture(event: Event) {
    event.stopPropagation();
    this.itemToDelete = { type: 'picture' };
    this.deleteModalVisible.set(true);
  }

  private performDeletePicture() {
    this.avatarLoading.set(true);
    this.profileService.deletePicture()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.profileData.update(profile => profile ? { ...profile, profile_picture: undefined } : null);
          this.notificationService.success('Foto de perfil eliminada correctamente.');
          this.avatarLoading.set(false);
        },
        error: (err) => {
          this.notificationService.error(err.error?.message || 'Error al eliminar la foto de perfil.');
          this.avatarLoading.set(false);
        }
      });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.passwordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const payload = {
      old_password: this.passwordForm.value.currentPassword,
      new_password: this.passwordForm.value.newPassword
    };

    this.profileService.changePassword(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.passwordLoading.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
        },
        error: (err) => {
          this.passwordLoading.set(false);
          this.passwordError.set(err.error?.message || 'Error al cambiar la contraseña');
        }
      });
  }

  biometricsLoading = signal<boolean>(false);
  biometricsSuccess = signal<boolean>(false);
  biometricsError = signal<string | null>(null);

  registerBiometrics() {
    this.biometricsLoading.set(true);
    this.biometricsError.set(null);
    this.biometricsSuccess.set(false);

    this.webauthnService.getRegisterOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: async (response) => {
        try {
          const data = (response as any).data ?? response;
          const options = data.options;

          // El objeto real de opciones está dentro de 'publicKey'
          const pubKeyOptions = options?.publicKey || options;

          if (!pubKeyOptions || !pubKeyOptions.challenge) {
            throw new Error('El backend no incluyó el challenge en las opciones.');
          }

          // El backend ya calcula el rp.id correctamente desde Origin/Referer/X-Forwarded-Host
          // Solo sobrescribir si el backend no envía rp.id
          if (!pubKeyOptions.rp?.id) {
            pubKeyOptions.rp = pubKeyOptions.rp || {};
            pubKeyOptions.rp.id = window.location.hostname;
          }

          const base64Challenge = extractBase64(pubKeyOptions.challenge);
          pubKeyOptions.challenge = base64ToBuffer(base64Challenge);
          
          if (pubKeyOptions.user && typeof pubKeyOptions.user.id === 'string') {
            const base64UserId = extractBase64(pubKeyOptions.user.id);
            pubKeyOptions.user.id = base64ToBuffer(base64UserId);
          }

          if (pubKeyOptions.excludeCredentials) {
            pubKeyOptions.excludeCredentials = pubKeyOptions.excludeCredentials.map((cred: any) => {
              cred.id = base64ToBuffer(extractBase64(cred.id));
              return cred;
            });
          }

          // Llamar a la API del navegador
          const credential = await navigator.credentials.create({
            publicKey: pubKeyOptions
          }) as PublicKeyCredential;

          if (!credential) {
            throw new Error('No se pudo crear la credencial.');
          }

          const responseObj = credential.response as AuthenticatorAttestationResponse;

          // Preparar datos para el backend
          const registrationData = {
            clientDataJSON: bufferToBase64(responseObj.clientDataJSON),
            attestationObject: bufferToBase64(responseObj.attestationObject),
            challenge: base64Challenge, // Mandamos el challenge original en base64
            device_name: navigator.userAgent // Opcional: Nombre del dispositivo
          };

          // Enviar al backend
          this.webauthnService.register(registrationData)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                this.biometricsLoading.set(false);
                this.biometricsSuccess.set(true);
                this.loadDevices();
              },
              error: (err) => {
                this.biometricsLoading.set(false);
                this.biometricsError.set(err.error?.message || 'Error al registrar la huella en el servidor');
              }
            });

        } catch (err: any) {
          this.biometricsLoading.set(false);
          this.biometricsError.set(err.message || 'Error en el proceso de autenticación');
          console.error(err);
        }
      },
      error: (err) => {
        this.biometricsLoading.set(false);
        this.biometricsError.set(err.error?.message || 'Error al obtener opciones de registro');
      }
    });
  }
}
