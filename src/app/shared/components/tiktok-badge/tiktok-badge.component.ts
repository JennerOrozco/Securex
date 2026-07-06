import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-tiktok-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showBadge()) {
      <div class="absolute top-full right-0 mt-2 z-[99999] pointer-events-none"
           style="animation: tiktokPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, floatTooltip 3s ease-in-out infinite;">
        
        <!-- Flecha hacia arriba -->
        <div class="absolute -top-1.5 right-3 w-3 h-3 bg-[#ff2a5f] rotate-45 transform origin-center rounded-sm"></div>
        
        <!-- Contenido del Tooltip Estilo TikTok -->
        <div class="bg-[#ff2a5f] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1.5 relative">
          <i class="pi pi-bell text-[10px]"></i>
          <span class="tracking-wide">Nueva alerta</span>
        </div>
      </div>
    }

    <style>
      @keyframes tiktokPop {
        0% { opacity: 0; transform: scale(0.5) translateY(-10px); }
        70% { transform: scale(1.1) translateY(2px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes floatTooltip {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(3px); }
      }
    </style>
  `
})
export class TiktokBadgeComponent {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  
  showBadge = signal(false);
  private timeoutId: any;

  constructor() {
    this.notificationService.realTimeNotification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.triggerBadge();
      });
  }

  triggerBadge() {
    // Si ya hay un timeout corriendo, lo limpiamos para alargar el tiempo
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.showBadge.set(false);
    
    // Forzamos un pequeño delay para que Angular renderice la entrada de nuevo
    setTimeout(() => {
      this.showBadge.set(true);
      
      this.timeoutId = setTimeout(() => {
        this.showBadge.set(false);
      }, 4000); // 4 segundos visible
    }, 50);
  }
}
