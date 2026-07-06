import { Component, ChangeDetectionStrategy, input, output, computed, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';

import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { NotificationService } from '@core/services/notification.service';
import { DeleteItemType } from '../../services/profile-delete.facade';

export interface UserDevice {
  id: number;
  user_uuid: string;
  app_uuid: string;
  device_token: string;
  device_type: string;
  created_at: string;
  last_active?: string | null;
  app?: { name: string };
}

@Component({
  selector: 'app-profile-devices',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SkeletonModule, TimeAgoPipe],
  templateUrl: './profile-devices.component.html',
  styleUrl: './profile-devices.component.css',
})
export class ProfileDevicesComponent {
  notificationDevices = input<UserDevice[]>([]);
  loading = input(false);
  currentPushEndpoint = input<string | null>(null);

  onDeleteDevice = output<{ type: DeleteItemType; id: string; device_name: string }>();
  onDeviceRegistered = output<void>();

  private notifService = inject(NotificationService);
  private zone = inject(NgZone);

  readonly processedDevices = computed(() =>
    this.notificationDevices().map(device => ({
      ...device,
      isCurrent: this.checkIsCurrentDevice(device),
    }))
  );

  readonly hasCurrentDevice = computed(() => 
    this.processedDevices().some(d => d.isCurrent)
  );

  private checkIsCurrentDevice(device: UserDevice): boolean {
    const endpoint = this.currentPushEndpoint();
    if (!endpoint || !device.device_token) return false;
    try {
      const parsed = typeof device.device_token === 'string'
        ? JSON.parse(device.device_token)
        : device.device_token;
      return parsed.endpoint === endpoint;
    } catch {
      return false;
    }
  }

  // Mapeo nativo a PrimeIcons para evitar el lag de renderizado de Lucide
  getDevicePrimeIcon(deviceType: string | undefined | null): string {
    const t = (deviceType ?? '').toLowerCase();
    if (t.includes('ios') || t.includes('iphone') || t.includes('ipad')) return 'pi-tablet text-primary';
    if (t.includes('android'))  return 'pi-mobile text-primary';
    if (t.includes('mac'))      return 'pi-desktop text-primary';
    if (t.includes('windows'))  return 'pi-desktop text-primary';
    if (t.includes('linux'))    return 'pi-code text-primary';
    return 'pi-globe text-primary';
  }

  emitDelete(device: UserDevice) {
    this.onDeleteDevice.emit({
      type: 'notification_device',
      id: String(device.id),
      device_name: device.device_type || 'Dispositivo'
    });
  }

  async registerThisDevice() {
    try {
      await this.notifService.registerForPush();
      this.zone.run(() => {
        this.notifService.info('Dispositivo registrado correctamente.');
        this.onDeviceRegistered.emit();
      });
    } catch (error) {
      this.zone.run(() => {
        this.notifService.error('No se pudo registrar el dispositivo para notificaciones.');
      });
    }
  }
}
