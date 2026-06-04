import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { InstallPromptComponent } from './features/notifications/install-prompt.component';
import { NotificationPromptComponent } from './features/notifications/notification-prompt.component';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InstallPromptComponent,
    NotificationPromptComponent,
    ToastModule
  ]
})
export class App {
  protected readonly title = signal('SECUREX');

  private authService = inject(AuthService);
  private router = inject(Router);
  private swUpdate = inject(SwUpdate);
  private swPush = inject(SwPush);

  constructor() {
    this.checkForUpdates();
    this.listenToNotificationClicks();
  }

  private checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          if (confirm('Nueva versión disponible. ¿Deseas actualizar?')) {
            this.swUpdate.activateUpdate().then(() => {
              window.location.reload();
            });
          }
        }
      });
    }
  }

  private listenToNotificationClicks() {
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        console.log('Notification clicked:', notification);
        const url = notification.data?.url;

        if (url) {
          const origin = window.location.origin;

          if (url.startsWith(origin)) {
            // Es el mismo dominio! Extraemos la ruta y navegamos sin recargar
            const path = url.substring(origin.length);
            this.router.navigate([path]);
          } else if (url.startsWith('http')) {
            // Es un dominio externo, abrimos pestaña nueva
            window.open(url, '_blank');
          } else {
            // Es una ruta relativa
            const targetUrl = url.startsWith('/') ? url : '/' + url;
            this.router.navigate([targetUrl]);
          }
        }
      });
    }
  }

  get showLayout(): boolean {
    // Solo mostrar Header/Footer si hay usuario logueado Y no estamos en login
    return !!this.authService.currentUserValue && this.router.url !== '/login';
  }
}
