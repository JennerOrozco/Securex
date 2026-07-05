import { Component, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';

interface RichNotification extends AppNotification {
  _id: string;
  isLeaving?: boolean;
}

@Component({
  selector: 'app-rich-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full md:w-[360px]">
      @for (notif of activeNotifications(); track notif._id) {
        <div class="pointer-events-auto bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-3 items-start cursor-pointer transition-all duration-300 hover:bg-[#252525]/95 hover:border-white/20 hover:scale-[1.02] origin-bottom-left"
             [class.opacity-0]="notif.isLeaving"
             [class.translate-y-4]="notif.isLeaving"
             [class.scale-95]="notif.isLeaving"
             [class.animate-fade-in-up]="!notif.isLeaving"
             style="animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
             (click)="onClick(notif)">
          
          <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 overflow-hidden border border-blue-500/30">
            <i class="pi pi-bell text-lg"></i>
          </div>

          <div class="flex-1 min-w-0 flex flex-col gap-1">
            <div class="flex justify-between items-center gap-2">
              <span class="text-white font-semibold text-sm truncate">{{ notif.title || 'Nueva Notificación' }}</span>
              <span class="text-white/40 text-[10px] font-medium uppercase tracking-wider flex-shrink-0">Ahora</span>
            </div>
            <p class="text-white/60 text-xs leading-snug line-clamp-2">{{ notif.message }}</p>
          </div>

          <button (click)="close($event, notif._id)" 
                  class="w-6 h-6 flex items-center justify-center rounded-full text-white/30 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0 -mt-1 -mr-1">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      }
    </div>

    <style>
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translate3d(0, 100%, 0) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }
    </style>
  `
})
export class RichNotificationComponent {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  activeNotifications = signal<RichNotification[]>([]);

  constructor() {
    this.notificationService.realTimeNotification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(notif => {
        this.addNotification(notif);
      });
  }

  addNotification(notif: AppNotification) {
    const enriched: RichNotification = {
      ...notif,
      _id: Math.random().toString(36).substr(2, 9),
      isLeaving: false
    };
    
    this.activeNotifications.update(list => [...list, enriched]);

    setTimeout(() => {
      this.triggerLeave(enriched._id);
    }, 6000);
  }

  triggerLeave(id: string) {
    this.activeNotifications.update(list => 
      list.map(n => n._id === id ? { ...n, isLeaving: true } : n)
    );

    // Esperar que termine la transición de CSS (300ms) para removerlo del DOM
    setTimeout(() => {
      this.removeNotification(id);
    }, 300);
  }

  removeNotification(id: string) {
    this.activeNotifications.update(list => list.filter(n => n._id !== id));
  }

  close(event: Event, id: string) {
    event.stopPropagation();
    this.triggerLeave(id);
  }

  onClick(notif: RichNotification) {
    if (notif.route_url) {
      this.router.navigateByUrl(notif.route_url);
    }
    this.triggerLeave(notif._id);
  }
}
