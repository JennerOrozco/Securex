import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { Observable, catchError, firstValueFrom, of, tap } from 'rxjs';
import { MessageService } from 'primeng/api';

export interface AppNotification {
  id: number;
  user_uuid: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  route_url?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);

  constructor() { }

  /**
   * Solicita permiso y registra el dispositivo en el microservicio de notificaciones.
   */
  async registerForPush() {
    if (!this.swPush.isEnabled) {
      console.warn('Push notifications are not enabled in this browser/environment.');
      return;
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: this.configService.vapidPublicKey
      });

      this.sendSubscriptionToApi(sub).subscribe({
        next: (res) => console.log('Device registered for push notifications:', res),
        error: (err) => console.error('Failed to register device for push:', err)
      });
    } catch (err) {
      console.error('Could not subscribe to push notifications', err);
    }
  }

  /**
   * Desinscribe el dispositivo de las notificaciones push.
   */
  async unsubscribeFromPush() {
    try {
      // Obtener la suscripción actual antes de desuscribirse
      const sub = await firstValueFrom(this.swPush.subscription);

      if (sub) {
        const payload = {
          device_token: JSON.stringify(sub)
        };

        // Llamar al backend para eliminar el registro
        this.http.delete(`${this.configService.notificationApiUrl}/notifications/devices`, { body: payload }).subscribe({
          next: () => console.log('Device unsubscribed in backend'),
          error: (err) => console.error('Failed to unsubscribe device in backend:', err)
        });

        // Desuscribirse en el navegador
        await this.swPush.unsubscribe();
      }
    } catch (err) {
      console.error('Could not unsubscribe from push notifications', err);
    }
  }

  private getCompanyUuid(): string | null {
    const storedCompany = localStorage.getItem('currentCompany');
    if (storedCompany) {
      try {
        const company = JSON.parse(storedCompany);
        return company?.uuid || null;
      } catch (e) {
        console.error('Error parsing company from localStorage', e);
      }
    }
    return null;
  }

  private sendSubscriptionToApi(sub: PushSubscription) {
    const payload: any = {
      device_token: JSON.stringify(sub),
      device_type: this.getDeviceType()
    };
    const companyUuid = this.getCompanyUuid();
    if (companyUuid) {
      payload.company_uuid = companyUuid;
    }

    return this.http.post(`${this.configService.notificationApiUrl}/notifications/devices`, payload);
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'PWA_ANDROID';
    if (/iPad|iPhone|iPod/.test(ua)) return 'PWA_IOS';
    return 'PWA_DESKTOP';
  }

  /**
   * Envía una notificación de prueba (solo para testing/QA)
   */
  sendTestNotification(userUuid: string, companyUuid: string) {
    const payload = {
      user_uuid: userUuid,
      app_uuid: this.configService.appUuid,
      company_uuid: companyUuid,
      title: '¡Prueba de SECUREX!',
      message: 'Esta es una notificación push de prueba desde tu PWA.',
      channels: 'PUSH'
    };

    return this.http.post(`${this.configService.notificationApiUrl}/notifications/send`, payload);
  }

  /**
   * Actualiza las preferencias de notificación del usuario (Email/Push).
   */
  updatePreferences(emailEnabled: boolean, pushEnabled: boolean, companyUuid: string) {
    const payload = {
      app_uuid: this.configService.appUuid,
      company_uuid: companyUuid,
      email_enabled: emailEnabled,
      push_enabled: pushEnabled
    };

    return this.http.put(`${this.configService.notificationApiUrl}/notifications/preferences`, payload);
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.configService.notificationApiUrl}/notifications`
    );
  }

  markAsRead(id: number): Observable<{ status: string; data: null; message: string }> {
    return this.http.put<{ status: string; data: null; message: string }>(
      `${this.configService.notificationApiUrl}/notifications/${id}/read`, null
    );
  }

  deleteNotification(id: number): Observable<{ status: string; data: null; message: string }> {
    return this.http.delete<{ status: string; data: null; message: string }>(
      `${this.configService.notificationApiUrl}/notifications/${id}`
    );
  }

  notify(severity: 'success' | 'error' | 'info' | 'warn', message: string) {
    const config: Record<string, { summary: string; life: number; icon: string }> = {
      success: { summary: 'Éxito', life: 2000, icon: 'pi pi-check-circle' },
      error: { summary: 'Error', life: 3000, icon: 'pi pi-times-circle' },
      info: { summary: 'Información', life: 2000, icon: 'pi pi-info-circle' },
      warn: { summary: 'Advertencia', life: 2500, icon: 'pi pi-exclamation-triangle' },
    };
    const cfg = config[severity];
    this.messageService.add({ severity, summary: cfg.summary, detail: message, life: cfg.life, icon: cfg.icon });
  }

  showError(message: string) {
    this.notify('error', message);
  }

  showSuccess(message: string) {
    this.notify('success', message);
  }

  success(message: string) {
    this.notify('success', message);
  }
}
