import { Component, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

interface RichNotification extends AppNotification {
  _id: string;
}

@Component({
  selector: 'app-rich-notification',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ transform: 'translateX(-100%)', opacity: 0, height: 0 }),
          stagger(50, [
            animate('300ms cubic-bezier(0.2, 1, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1, height: '*' }))
          ])
        ], { optional: true }),
        query(':leave', [
          stagger(50, [
            animate('250ms cubic-bezier(0.2, 1, 0.2, 1)', style({ transform: 'translateX(-100%)', opacity: 0, height: 0, margin: 0, padding: 0 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="fixed bottom-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full md:w-[360px]" [@listAnimation]="activeNotifications().length">
      @for (notif of activeNotifications(); track notif._id) {
        <div class="pointer-events-auto bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-3 items-start cursor-pointer transition-all hover:bg-[#252525]/95 hover:border-white/20 hover:scale-[1.02]"
             (click)="onClick(notif)">
          
          <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 overflow-hidden border border-blue-500/30">
            @if (notif.icon_url) {
              <img [src]="notif.icon_url" class="w-full h-full object-cover" />
            } @else {
              <i class="pi pi-bell text-lg"></i>
            }
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
      _id: Math.random().toString(36).substr(2, 9)
    };
    
    // Add to the list
    this.activeNotifications.update(list => [...list, enriched]);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      this.removeNotification(enriched._id);
    }, 6000);
  }

  removeNotification(id: string) {
    this.activeNotifications.update(list => list.filter(n => n._id !== id));
  }

  close(event: Event, id: string) {
    event.stopPropagation();
    this.removeNotification(id);
  }

  onClick(notif: RichNotification) {
    if (notif.route_url) {
      this.router.navigateByUrl(notif.route_url);
    }
    this.removeNotification(notif._id);
  }
}
