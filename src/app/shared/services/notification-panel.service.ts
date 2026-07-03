import { Injectable, inject, DestroyRef, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NotificationPanelService {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  notifications = signal<AppNotification[]>([]);
  notificationsLoading = signal<boolean>(false);
  notificationsError = signal<string | null>(null);
  showPanel = signal(false);

  unreadCount = computed(() => this.notifications().filter(n => !n.is_read).length);

  loadNotifications(): void {
    this.notificationsLoading.set(true);
    this.notificationsError.set(null);
    this.notificationService.getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notifications.set(res ?? []);
          this.notificationsLoading.set(false);
        },
        error: () => {
          this.notifications.set([]);
          this.notificationsError.set('Error al cargar notificaciones');
          this.notificationsLoading.set(false);
        }
      });
  }

  togglePanel(): void {
    this.showPanel.update(v => !v);
    if (this.showPanel()) {
      this.loadNotifications();
    }
  }

  closePanel(): void {
    this.showPanel.set(false);
  }

  markAsRead(id: number): void {
    const notif = this.notifications().find(n => n.id === id);
    if (!notif) return;
    if (!notif.is_read) {
      notif.is_read = true;
      this.notificationService.markAsRead(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: () => { notif.is_read = false; }
        });
    }
    if (notif.route_url) {
      this.showPanel.set(false);
      this.router.navigateByUrl(notif.route_url);
    }
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.update(notifs => notifs.filter(n => n.id !== id));
        },
        error: () => {
          this.notificationService.error('Error al eliminar la notificación');
        }
      });
  }

  markAllAsRead(): void {
    this.notifications().forEach(n => {
      if (!n.is_read) {
        n.is_read = true;
        this.notificationService.markAsRead(n.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: () => { n.is_read = false; }
          });
      }
    });
  }
}
