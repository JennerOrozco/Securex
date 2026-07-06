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
        <div class="pointer-events-auto bg-[#1a1a1e]/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex gap-3 items-start cursor-pointer transition-all duration-300 hover:bg-[#252528]/90 hover:border-white/30 hover:scale-[1.03] hover:shadow-[0_10px_40px_-5px_rgba(255,255,255,0.1)] origin-top-right relative overflow-hidden group"
             [class.opacity-0]="notif.isLeaving"
             [class.-translate-y-4]="notif.isLeaving"
             [class.translate-x-4]="notif.isLeaving"
             [class.scale-75]="notif.isLeaving"
             style="animation: popOut 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;"
             (click)="onClick(notif)">
          
          <!-- Efecto de resplandor sutil (glow) -->
          <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div class="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 overflow-hidden border border-blue-500/30 shadow-inner">
            @if (notif.icon_url) {
              <img [src]="notif.icon_url" class="w-full h-full object-cover">
            } @else {
              <i class="pi pi-bell text-xl animate-pulse"></i>
            }
          </div>

          <div class="flex-1 min-w-0 flex flex-col gap-0.5 mt-0.5 relative z-10">
            <div class="flex justify-between items-center gap-2">
              <span class="text-white font-bold text-sm truncate tracking-tight">{{ notif.title || 'Nueva Notificación' }}</span>
              <span class="text-blue-400/80 text-[9px] font-bold uppercase tracking-widest flex-shrink-0 bg-blue-500/10 px-1.5 py-0.5 rounded-md">Ahora</span>
            </div>
            <p class="text-gray-300 text-xs leading-relaxed line-clamp-2">{{ notif.message }}</p>
          </div>

          <button (click)="close($event, notif._id)" 
                  class="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/20 hover:text-white transition-all duration-200 flex-shrink-0 -mt-1 -mr-1 relative z-10 backdrop-blur-md">
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      }
    </div>

    <style>
      @keyframes popOut {
        from {
          opacity: 0;
          transform: scale(0.6) translate3d(60px, -40px, 0) rotate(5deg);
        }
        to {
          opacity: 1;
          transform: scale(1) translate3d(0, 0, 0) rotate(0deg);
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

    // Haptic feedback (Vibración) para dispositivos móviles aunque el componente visual esté oculto
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
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
