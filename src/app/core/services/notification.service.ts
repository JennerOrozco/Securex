import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { Observable, firstValueFrom, map, timeout, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { GraphqlService } from '../graphql/graphql.service';
import { NOTIFICATION_QUERIES, NOTIFICATION_MUTATIONS } from '../graphql/queries/notification.queries';

export interface AppNotification {
  id: number;
  user_uuid: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  route_url?: string | null;
  icon_url?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private swPush = inject(SwPush);
  private configService = inject(ConfigService);
  private storage = inject(StorageService);
  private gql = inject(GraphqlService);
  private messageService = inject(MessageService);

  constructor() { }

  /**
   * Solicita permiso y registra el dispositivo en el microservicio de notificaciones.
   */
  async registerForPush() {
    if (!this.swPush.isEnabled) {
      return;
    }

    let serverPublicKey = this.configService.vapidPublicKey; // Fallback inicial


    try {
      const res = await firstValueFrom(
        this.http.get<any>(
          `${this.configService.notificationApiUrl}/notifications/vapid-public-key?app_uuid=${this.configService.appUuid}`
        ).pipe(timeout(3000))
      );
      if (res && res.data && res.data.public_key) {
        serverPublicKey = res.data.public_key;
      } else if (res && res.public_key) {
        serverPublicKey = res.public_key;
      }
    } catch (e: any) {
      console.warn('[NotificationService] No se pudo obtener llave VAPID dinámica, usando fallback. Error:', e.message);
    }

    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: serverPublicKey
      });

      await firstValueFrom(this.sendSubscriptionToApi(sub));
    } catch (err: any) {
      if (err?.name === 'NotSupportedError' || err?.name === 'DOMException' || err?.message?.includes('applicationServerKey')) {
        try {
          const oldSub = await firstValueFrom(this.swPush.subscription.pipe(timeout(2000)));
          if (oldSub) {
            await this.swPush.unsubscribe();
          }
          const newSub = await this.swPush.requestSubscription({
            serverPublicKey: serverPublicKey
          });
          await firstValueFrom(this.sendSubscriptionToApi(newSub));
        } catch (retryErr) {
          throw retryErr;
        }
      } else {
        throw err;
      }
    }
  }

  /**
   * Desinscribe el dispositivo de las notificaciones push.
   */
  async unsubscribeFromPush() {
    if (!this.swPush.isEnabled) {
      return;
    }
    try {
      const sub = await firstValueFrom(this.swPush.subscription.pipe(timeout(2000)));

      if (sub) {
        const payload = {
          device_token: JSON.stringify(sub)
        };

        this.http.delete(`${this.configService.notificationApiUrl}/notifications/devices`, { body: payload }).subscribe({
          error: () => {} // Silencioso en producción
        });

        await this.swPush.unsubscribe();
      }
    } catch {
      // Silencioso: no bloquear si falla desuscripción
    }
  }

  private getCompanyUuid(): string | null {
    return this.storage.getCompany()?.uuid ?? null;
  }

  private sendSubscriptionToApi(sub: PushSubscription) {
    const user = this.storage.getUser();
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.REGISTER_DEVICE, {
      user_uuid: user?.uuid ?? '',
      app_uuid: this.configService.appUuid,
      device_token: JSON.stringify(sub),
      device_type: this.getDeviceType()
    });
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'Unknown Device';
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Web Browser';

    // Detectar Sistema Operativo
    if (/windows phone/i.test(ua)) { os = 'Windows Phone'; }
    else if (/windows/i.test(ua)) { os = 'Windows'; }
    else if (/Android/i.test(ua)) { os = 'Android'; }
    else if (/iPad|iPhone|iPod/.test(ua)) { os = 'iOS'; }
    else if (/Mac/i.test(ua)) { os = 'Mac OS'; }
    else if (/Linux/i.test(ua)) { os = 'Linux'; }

    // Detectar Navegador (el orden importa por cómo se construyen los user-agents)
    if (/samsungbrowser/i.test(ua)) { browser = 'Samsung Internet'; }
    else if (/edg/i.test(ua)) { browser = 'Edge'; }
    else if (/opr|opera/i.test(ua)) { browser = 'Opera'; }
    else if (/chrome|crios|crmo/i.test(ua)) { browser = 'Chrome'; }
    else if (/firefox|iceweasel|fxios/i.test(ua)) { browser = 'Firefox'; }
    else if (/safari/i.test(ua)) { browser = 'Safari'; }

    return `${os} - ${browser}`;
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

  getNotifications(page = 1, limit = 50): Observable<AppNotification[]> {
    return this.gql.query<{ notifications: { data: AppNotification[]; total: number } }>('notification', NOTIFICATION_QUERIES.NOTIFICATIONS, { page, limit }).pipe(
      map(d => d.notifications.data)
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.MARK_READ, { id });
  }

  deleteNotification(id: number): Observable<any> {
    return this.gql.mutate('notification', NOTIFICATION_MUTATIONS.DELETE_NOTIFICATION, { id });
  }

  private toastConfig: Record<string, { severity: string; summary: string; life: number; icon: string }> = {
    success: { severity: 'success', summary: 'Éxito', life: 2000, icon: 'pi pi-check-circle' },
    error: { severity: 'error', summary: 'Error', life: 3000, icon: 'pi pi-times-circle' },
    info: { severity: 'info', summary: 'Información', life: 2000, icon: 'pi pi-info-circle' },
    warn: { severity: 'warn', summary: 'Advertencia', life: 2500, icon: 'pi pi-exclamation-triangle' },
  };

  notify(type: keyof typeof this.toastConfig, message: string, data?: any) {
    const cfg = this.toastConfig[type];
    this.messageService.add({ severity: cfg.severity, summary: cfg.summary, detail: message, life: cfg.life, icon: cfg.icon, data });
  }

  success(message: string, data?: any) { this.notify('success', message, data); }

  error(message: string, data?: any) { this.notify('error', message, data); }

  info(message: string, data?: any) { this.notify('info', message, data); }

  warn(message: string, data?: any) { this.notify('warn', message, data); }

  private eventSource: EventSource | null = null;
  private zone = inject(NgZone);
  public realTimeNotification$ = new Subject<AppNotification>();

  initSSE(token: string) {
    this.closeSSE(); // Cerramos si hubiera alguna conexión previa activa
    
    // Conectamos pasando el token por query param, ya que EventSource no admite cabeceras nativas
    const url = `${this.configService.notificationApiUrl}/notifications/stream?token=${token}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const newNotification: AppNotification = JSON.parse(event.data);
          this.realTimeNotification$.next(newNotification);
        } catch (e) {
          console.error('Error parseando notificación SSE:', e);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      // EventSource reconecta automáticamente, por lo que un error aquí es normal cuando el backend cierra por timeout (Long Polling behavior)
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        // La conexión se cerró definitivamente, o el navegador está offline
      }
    };
  }

  closeSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
