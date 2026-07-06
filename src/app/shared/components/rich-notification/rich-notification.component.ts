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
    <div class="hidden md:flex fixed top-[70px] right-4 md:right-6 z-[9999] flex-col gap-3 pointer-events-none max-w-sm w-[360px]">
      @for (notif of activeNotifications(); track notif._id) {
        <div class="pointer-events-auto bg-white border border-[color:var(--slate-200,#E4E6EA)] rounded-[20px] p-4 shadow-[0_10px_30px_-8px_rgba(11,27,51,0.12)] flex gap-3 items-start cursor-pointer transition-all duration-300 hover:border-[color:var(--slate-300,#D7DAE0)] hover:shadow-[0_14px_36px_-8px_rgba(11,27,51,0.16)] hover:-translate-y-0.5 origin-top-right relative overflow-hidden group"
             [class.opacity-0]="notif.isLeaving"
             [class.-translate-y-2]="notif.isLeaving"
             [class.translate-x-3]="notif.isLeaving"
             [class.scale-95]="notif.isLeaving"
             style="animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;"
             (click)="onClick(notif)">

          <div class="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center bg-[color:var(--navy-100,#E8ECF3)] border border-[color:var(--slate-200,#E4E6EA)] text-[color:var(--navy-900,#0B1B33)] overflow-hidden">
            @if (notif.icon_url) {
              <img [src]="notif.icon_url" class="w-full h-full object-cover">
            } @else {
              <i class="pi pi-bell text-lg"></i>
            }
          </div>

          <div class="flex-1 min-w-0 flex flex-col gap-1 mt-0.5 relative z-10">
            <div class="flex justify-between items-center gap-2">
              <span class="text-[color:var(--slate-900,#1F2430)] font-medium text-sm truncate tracking-tight">{{ notif.title || 'Nueva notificación' }}</span>
              <span class="text-[color:var(--crimson-500,#C81E3A)] text-[10px] font-medium tracking-wide flex-shrink-0 bg-[color:var(--crimson-100,#FBE4E8)] px-2 py-0.5 rounded-lg">Ahora</span>
            </div>
            <p class="text-[color:var(--slate-600,#6B7280)] text-xs leading-relaxed line-clamp-2">{{ notif.message }}</p>
          </div>

          <button (click)="close($event, notif._id)"
                  class="w-6.5 h-6.5 flex items-center justify-center rounded-full bg-[color:var(--slate-100,#F4F5F7)] text-[color:var(--slate-500,#8A8F9C)] hover:bg-[color:var(--slate-200,#E4E6EA)] hover:text-[color:var(--slate-900,#1F2430)] transition-all duration-200 flex-shrink-0 -mt-1 -mr-1 relative z-10">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      }
    </div>

    <style>
      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.92) translate3d(24px, -12px, 0);
        }
        to {
          opacity: 1;
          transform: scale(1) translate3d(0, 0, 0);
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

    if (typeof window !== 'undefined' && window.innerWidth < 768 && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    setTimeout(() => {
      this.triggerLeave(enriched._id);
    }, 6000);
  }

  triggerLeave(id: string) {
    this.activeNotifications.update(list =>
      list.map(n => n._id === id ? { ...n, isLeaving: true } : n)
    );

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