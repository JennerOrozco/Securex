import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPrompt" class="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:w-[380px] bg-navy-900/40 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] shadow-2xl p-3 md:p-4 z-[110] animate-ios-slide-down">
      <div class="flex flex-col gap-2 md:gap-3">
        <!-- Header con Icono -->
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-white font-head font-bold text-sm md:text-base tracking-tight">Activar Notificaciones</h3>
            <p class="text-white/50 text-[8px] md:text-[10px] font-body">No te pierdas de nada importante</p>
          </div>
          <button (click)="dismissPrompt()" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-2">
          <p class="text-white/80 text-[10px] md:text-xs leading-relaxed font-body">
            Recibe avisos en tiempo real sobre tus reservas, pagos y comunicados de la administración.
          </p>
          <div class="flex gap-2 pt-1">
              <button (click)="requestPermission()" class="flex-1 bg-white text-navy-900 font-bold py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg text-[10px]">
                Permitir ahora
              </button>
              <button (click)="dismissPrompt()" class="px-3 py-1.5 text-white/50 hover:text-white font-semibold transition-colors text-[10px]">
                Más tarde
              </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-ios-slide-down {
      animation: iosSlideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes iosSlideDown {
      0% { transform: translateY(-100%) scale(0.9); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class NotificationPromptComponent implements OnInit {
  showPrompt = false;
  private notificationService = inject(NotificationService);

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.checkPermission();
  }

  async checkPermission() {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      // Mostrar el prompt después de un delay
      setTimeout(() => {
        this.showPrompt = true;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.notificationService.registerForPush();
    }
    this.dismissPrompt();
  }

  dismissPrompt() {
    this.showPrompt = false;
    this.cdr.detectChanges();
  }
}

