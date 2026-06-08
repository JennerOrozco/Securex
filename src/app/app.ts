import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { InstallPromptComponent } from './features/notificaciones/install-prompt.component';
import { NotificationPromptComponent } from './features/notificaciones/notification-prompt.component';
import { SwUpdate, SwPush } from '@angular/service-worker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InstallPromptComponent,
    NotificationPromptComponent,
    ToastModule,
    ConfirmDialogModule,
    LoaderComponent
  ]
})
export class App {
  protected readonly title = signal('SECUREX');
  private currentUrl = signal('');

  private authService = inject(AuthService);
  private router = inject(Router);
  private swUpdate = inject(SwUpdate);
  private swPush = inject(SwPush);

  showLayout = computed(() => {
    return !!this.authService.currentUser() && this.currentUrl() !== '/login';
  });

  constructor() {
    this.currentUrl.set(this.router.url);
    this.checkForUpdates();
    this.listenToNotificationClicks();
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
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


}
