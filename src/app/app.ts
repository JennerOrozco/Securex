import { Component, signal, computed, inject, ApplicationRef, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { InstallPromptComponent } from './features/access-login/install-prompt.component';
import { NotificationPromptComponent } from './features/access-login/notification-prompt.component';
import { UpdatePromptComponent } from '@shared/components/update-prompt';
import { RichNotificationComponent } from './shared/components/rich-notification/rich-notification.component';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, first } from 'rxjs/operators';
import { merge, interval, fromEvent } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InstallPromptComponent,
    NotificationPromptComponent,
    UpdatePromptComponent,
    ToastModule,
    ConfirmDialogModule,
    LoaderComponent,
    RichNotificationComponent
  ]
})
export class App {
  protected readonly title = signal('SECUREX');

  private authService = inject(AuthService);
  private router = inject(Router);
  private swPush = inject(SwPush);
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggerService);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  showLayout = computed(() => {
    return !!this.authService.currentUser() && this.currentUrl() !== '/login';
  });

  constructor() {
    this.startUpdatePolling();
    this.listenToNotificationClicks();
    this.scrollToTopOnNavigate();
  }

  private scrollToTopOnNavigate() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const main = document.querySelector('.main-content');
      if (main) {
        main.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
  }

  navigateTo(url: string): void {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      const targetUrl = url.startsWith('/') ? url : '/' + url;
      this.router.navigate([targetUrl]);
    }
  }

  private startUpdatePolling() {
    if (!this.swUpdate.isEnabled) return;

    const doCheck = () => {
      this.swUpdate.checkForUpdate().then(hasUpdate => {
        if (hasUpdate) {
          this.logger.log('Nueva versión disponible — descargándose...', undefined, 'AppComponent');
        }
      }).catch(err => {
        this.logger.warn('Error al verificar actualizaciones', err, 'AppComponent');
      });
    };

    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable));
    const everyMinute$ = interval(60 * 1000);
    const onNavigation$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    );
    const onVisibility$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => document.visibilityState === 'visible')
    );

    merge(appIsStable$, everyMinute$, onNavigation$, onVisibility$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => doCheck());
  }

  private listenToNotificationClicks() {
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(({ action, notification }) => {
        const url = notification.data?.url;

        if (url) {
          const origin = window.location.origin;

          if (url.startsWith(origin)) {
            const path = url.substring(origin.length);
            this.router.navigate([path]);
          } else if (url.startsWith('http')) {
            window.open(url, '_blank');
          } else {
            const targetUrl = url.startsWith('/') ? url : '/' + url;
            this.router.navigate([targetUrl]);
          }
        }
      });
    }
  }
}
