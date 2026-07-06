import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer, firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { SwPush } from '@angular/service-worker';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WebAuthnService } from '../../../core/services/webauthn.service';
import { ProfileService } from '../../../core/services/profile.service';
import { GraphqlService } from '../../../core/graphql/graphql.service';
import { FormMapperService } from '../../../core/services/form-mapper.service';
import { SECUREX_QUERIES, SECUREX_MUTATIONS } from '../../../core/graphql/queries/securex.queries';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../../../core/graphql/queries/notification.queries';

import { PasswordComponent } from '../../../shared/components/password/password.component';
import { AvatarUploadComponent } from '../../../shared/components/avatar-upload/avatar-upload.component';
import { TableComponent } from '../../../shared/table-shared/table-component/table-component.component';
import { DeleteModalComponent } from '../../../shared/modals/modal-shell/delete-modal/delete-modal.component';

import { trackSignal } from '../../../shared/utils/rxjs-utils';
import { ProfileData, DEVICE_TABLE_COLUMNS } from './profile.config';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    PasswordComponent, TableComponent,
    DeleteModalComponent, AvatarUploadComponent, SkeletonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private webauthnService = inject(WebAuthnService);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private gql = inject(GraphqlService);
  private formMapper = inject(FormMapperService);
  private destroyRef = inject(DestroyRef);
  private swPush = inject(SwPush);

  deleteModalVisible = signal(false);
  itemToDelete = signal<any | null>(null);

  profileData = signal<ProfileData | null>(null);
  profileLoading = signal<boolean>(true);
  profileError = signal<string | null>(null);
  avatarLoading = signal<boolean>(false);
  
  devices = signal<any[]>([]);
  devicesLoading = signal<boolean>(false);

  notificationDevices = signal<any[]>([]);
  notificationDevicesLoading = signal<boolean>(false);
  currentPushSubscription = signal<string | null>(null);

  columns = DEVICE_TABLE_COLUMNS;
  activeTab = signal<string>('info');

  passwordForm!: FormGroup;
  passwordLoading = signal<boolean>(false);
  passwordSuccess = signal<boolean>(false);
  passwordError = signal<string | null>(null);

  biometricsLoading = signal<boolean>(false);
  biometricsSuccess = signal<boolean>(false);
  biometricsError = signal<string | null>(null);

  constructor() {
    this.initPasswordForm();
  }

  ngOnInit() {
    this.loadInitialProfileFromCache();
    this.fetchProfileFromServer();
    this.getCurrentSubscription();
  }

  private async getCurrentSubscription() {
    if (this.swPush.isEnabled) {
      try {
        const sub = await firstValueFrom(this.swPush.subscription);
        if (sub) {
          this.currentPushSubscription.set(sub.endpoint);
        }
      } catch (e) {
        // Silencioso
      }
    }
  }

  isCurrentDevice(device: any): boolean {
    const currentEndpoint = this.currentPushSubscription();
    if (!currentEndpoint || !device.device_token) return false;
    try {
      const parsed = JSON.parse(device.device_token);
      return parsed.endpoint === currentEndpoint;
    } catch {
      return false;
    }
  }

  fetchNotificationDevices() {
    this.gql.query<any>('notification', NOTIFICATION_QUERIES.USER_DEVICES, { limit: 100 })
      .pipe(trackSignal(this, this.notificationDevicesLoading))
      .subscribe({
        next: (res) => {
          this.notificationDevices.set(res?.userDevices?.data || []);
        }
      });
  }

  private initPasswordForm() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  private loadInitialProfileFromCache() {
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
  }

  private fetchProfileFromServer() {
    this.gql.query<any>('security', SECUREX_QUERIES.ME)
      .pipe(trackSignal(this, this.profileLoading))
      .subscribe({
        next: (data: any) => {
          this.devicesLoading.set(false);
          const me = data?.me;
          if (me) {
            const access = me.access && me.access[0] ? me.access[0] : null;
            this.profileData.update((current: any) => ({
              ...current,
              uuid: me.uuid,
              full_name: me.full_name,
              email: me.email,
              profile_picture: me.profile_picture,
              company_name: access?.company?.name,
              branch: access?.branch ? { uuid: '', name: access.branch.name } : undefined,
              role_name: me.role_name || current?.role_name
            }));
            if (me.webauthnCredentials) {
              this.devices.set(me.webauthnCredentials);
            }
          }
        },
        error: () => {
          this.profileLoading.set(false);
          this.profileError.set('Error al cargar el perfil. Intente de nuevo.');
        }
      });
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
    this.passwordError.set(null);
    this.passwordSuccess.set(false);
    
    if (tab === 'devices' && this.notificationDevices().length === 0) {
      this.fetchNotificationDevices();
    }
  }

  fortifyAccount() {
    this.setTab('security');
  }

  deleteNotificationDevice(device: any) {
    this.itemToDelete.set({ ...device, type: 'notification_device' });
    this.deleteModalVisible.set(true);
  }

  deleteDevice(device: any) {
    this.itemToDelete.set(device);
    this.deleteModalVisible.set(true);
  }

  handleConfirmDelete() {
    const item = this.itemToDelete();
    if (!item) return;

    if (item.type === 'picture') {
      this.resetDeleteState();
      this.performDeletePicture();
      return;
    }

    if (item.type === 'notification_device') {
      this.gql.query<any>('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, { id: parseInt(item.id, 10) })
        .pipe(trackSignal(this, this.notificationDevicesLoading, 'Dispositivo desvinculado exitosamente'))
        .subscribe({
          next: () => {
            this.resetDeleteState();
            this.fetchNotificationDevices();
          }
        });
      return;
    }

    this.gql.query<any>('security', SECUREX_MUTATIONS.DELETE_WEBAUTHN_CREDENTIAL, { id: parseInt(item.id, 10) })
      .pipe(trackSignal(this, this.devicesLoading, 'Dispositivo eliminado'))
      .subscribe({
        next: () => {
          this.resetDeleteState();
          this.fetchProfileFromServer();
        }
      });
  }

  private resetDeleteState() {
    this.deleteModalVisible.set(false);
    this.itemToDelete.set(null);
  }

  getUserInitials(): string {
    const name = this.profileData()?.full_name || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  handleCrop(croppedFile: File) {
    this.profileService.uploadPicture(croppedFile)
      .pipe(trackSignal(this, this.avatarLoading))
      .subscribe({
        next: (res: any) => {
          const data = res.data || res;
          this.profileData.update(profile => profile ? { ...profile, profile_picture: data.url } : null);
        }
      });
  }

  deleteProfilePicture(event: Event) {
    event.stopPropagation();
    this.itemToDelete.set({ type: 'picture' });
    this.deleteModalVisible.set(true);
  }

  private performDeletePicture() {
    this.profileService.deletePicture()
      .pipe(trackSignal(this, this.avatarLoading, 'Foto de perfil eliminada correctamente.'))
      .subscribe({
        next: () => {
          this.profileData.update(profile => profile ? { ...profile, profile_picture: undefined } : null);
        }
      });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    const payload = this.formMapper.mapPayload(this.passwordForm.value, {
      mode: 'edit',
      alias: { currentPassword: 'old_password', newPassword: 'new_password' },
    });

    this.profileService.changePassword(payload)
      .pipe(trackSignal(this, this.passwordLoading))
      .subscribe({
        next: () => {
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
          timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.passwordSuccess.set(false));
        },
        error: (err: any) => this.passwordError.set(err.error?.message || 'Error al cambiar la contraseña')
      });
  }

  registerBiometrics() {
    this.biometricsError.set(null);
    this.biometricsSuccess.set(false);

    this.webauthnService.registerDevice()
      .pipe(trackSignal(this, this.biometricsLoading))
      .subscribe({
        next: () => {
          this.biometricsSuccess.set(true);
          this.fetchProfileFromServer();
          timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.biometricsSuccess.set(false));
        },
        error: (err: any) => {
          this.biometricsError.set(err.message || err.error?.message || 'Error en el proceso de autenticación');
        }
      });
  }
}
