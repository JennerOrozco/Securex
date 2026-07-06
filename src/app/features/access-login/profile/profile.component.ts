import { Component, OnInit, signal, inject, DestroyRef, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { GraphqlService } from '@core/graphql/graphql.service';
import { SECUREX_QUERIES } from '@core/graphql/queries/securex.queries';
import { NOTIFICATION_QUERIES } from '@core/graphql/queries/notification.queries';

import { AvatarUploadComponent } from '@shared/components/avatar-upload/avatar-upload.component';
import { DeleteModalComponent } from '@shared/modals/modal-shell/delete-modal/delete-modal.component';
import { trackSignal } from '@shared/utils/rxjs-utils';

import { ProfileData, ProfileTab } from './profile.config';
import { ProfileDeleteFacade } from './services/profile-delete.facade';
import { ProfileInfoComponent } from './tabs/profile-info/profile-info.component';
import { ProfileSecurityComponent } from './tabs/profile-security/profile-security.component';
import { ProfileDevicesComponent } from './tabs/profile-devices/profile-devices.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SkeletonModule,
    AvatarUploadComponent,
    DeleteModalComponent,
    ProfileInfoComponent,
    ProfileSecurityComponent,
    ProfileDevicesComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  providers: [ProfileDeleteFacade],
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private gql = inject(GraphqlService);
  private destroyRef = inject(DestroyRef);
  private swPush = inject(SwPush);

  protected deleteFacade = inject(ProfileDeleteFacade);

  ProfileTab = ProfileTab;

  profileData = signal<ProfileData | null>(null);
  profileLoading = signal<boolean>(true);
  profileError = signal<string | null>(null);
  avatarLoading = signal<boolean>(false);

  devices = signal<any[]>([]);
  devicesLoading = signal<boolean>(false);

  notificationDevices = signal<any[]>([]);
  notificationDevicesLoading = signal<boolean>(false);
  currentPushSubscription = signal<string | null>(null);

  activeTab = signal<ProfileTab>(ProfileTab.INFO);

  userInitials = computed(() => {
    const name = this.profileData()?.full_name || 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  ngOnInit() {
    this.loadInitialProfileFromCache();
    this.fetchProfileFromServer();
    this.getCurrentSubscription();
  }

  private getCurrentSubscription() {
    if (this.swPush.isEnabled) {
      this.swPush.subscription.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (sub) => {
          this.currentPushSubscription.set(sub ? sub.endpoint : null);
        },
        error: (err) => console.error('Error al obtener suscripción:', err)
      });
    }
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

  fetchProfileFromServer() {
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

  setTab(tab: ProfileTab) {
    this.activeTab.set(tab);
    if (tab === ProfileTab.DEVICES && this.notificationDevices().length === 0) {
      this.fetchNotificationDevices();
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
    this.deleteFacade.requestDelete('picture');
  }

  deleteDevice(device: any) {
    this.deleteFacade.requestDelete('webauthn_device', { id: device.id, device_name: device.device_name });
  }

  deleteNotificationDevice(item: { type: string; id: string; device_name: string }) {
    this.deleteFacade.requestDelete('notification_device', { id: item.id, device_name: item.device_name });
  }

  handleConfirmDelete() {
    this.deleteFacade.executeDelete(
      (type) => {
        if (type === 'picture') {
          this.profileData.update(profile => profile ? { ...profile, profile_picture: undefined } : null);
        } else if (type === 'notification_device') {
          this.fetchNotificationDevices();
        } else {
          this.fetchProfileFromServer();
        }
      },
      (loading) => {
        if (loading) this.notificationDevicesLoading.set(true);
      }
    );
  }
}
