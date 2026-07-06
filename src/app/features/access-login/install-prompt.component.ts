import { Component, OnInit, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showPrompt) {
    <div class="fixed bottom-[4.8rem] md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:w-[380px] bg-navy-900/30 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] shadow-2xl p-3 md:p-4 z-[100] animate-ios-slide-up">
      <div class="flex flex-col gap-2 md:gap-3">
        <!-- Header con Icono -->
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl overflow-hidden shadow-lg transform rotate-3 border border-white/10">
            <img src="/image.png" alt="Logo" class="w-full h-full object-cover">
          </div>
          <div class="flex-1">
            <h4 class="text-white font-head font-bold text-sm md:text-base tracking-tight">Instalar SECUREX APP</h4>
          </div>
          <button (click)="dismissPrompt()" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-2 md:space-y-3">
          <!-- Android / Desktop Content -->
          @if (!isIOS) {
            <p class="text-white/80 text-[10px] md:text-xs leading-relaxed font-body">
              Acceso rápido y notificaciones en tiempo real.
            </p>
            <div class="flex gap-2 pt-1">
                <button (click)="installPwa()" class="flex-1 bg-white text-navy-900 font-bold py-1.5 md:py-2 px-4 rounded-lg md:rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 text-[10px] md:text-sm">
                  Instalar ahora
                </button>
                <button (click)="dismissPrompt()" class="px-3 py-1.5 text-white/50 hover:text-white font-semibold transition-colors text-[10px] md:text-sm">
                  Más tarde
                </button>
            </div>
          }

          <!-- iOS Content (Wizard Style) -->
          @if (isIOS) {
            <div class="bg-white/5 rounded-lg md:rounded-xl p-2 md:p-3 border border-white/10 min-h-[80px] md:min-h-[100px] flex flex-col justify-center">

              <!-- Step 1: Intro -->
              @if (iosStep === 1) {
              <div class="animate-fade-in space-y-1 md:space-y-2">
                <p class="text-white/90 text-[10px] md:text-xs font-body leading-relaxed text-center">
                  Agrega <strong>SECUREX APP</strong> a tu pantalla de inicio para una mejor experiencia.
                </p>
                <div class="flex justify-center">
                   <div class="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center animate-bounce">
                      <svg class="w-4 h-4 md:w-5 md:h-5 text-brand-bright" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                   </div>
                </div>
              </div>
              }

              <!-- Step 2: Share Button -->
              @if (iosStep === 2) {
              <div class="animate-fade-in space-y-2 md:space-y-3">
                <div class="flex items-start gap-2">
                  <div class="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center bg-brand-bright text-navy-900 rounded-md text-[10px] font-bold">1</div>
                  <p class="text-white/90 text-[10px] md:text-xs font-body pt-0.5">
                    Toca <strong>Compartir</strong> en la barra de Safari.
                  </p>
                </div>
                <div class="flex justify-center">
                   <div class="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-md flex items-center justify-center shadow-lg border border-white/20">
                      <svg class="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                   </div>
                </div>
              </div>
              }

              <!-- Step 3: Add to Home -->
              @if (iosStep === 3) {
              <div class="animate-fade-in space-y-2 md:space-y-3">
                <div class="flex items-start gap-2">
                  <div class="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 flex items-center justify-center bg-brand-bright text-navy-900 rounded-md text-[10px] font-bold">2</div>
                  <p class="text-white/90 text-[10px] md:text-xs font-body pt-0.5">
                    Selecciona <strong>"Agregar a inicio"</strong>.
                  </p>
                </div>
                <div class="flex justify-center">
                   <div class="px-2 py-1 md:px-3 md:py-1.5 bg-white/10 rounded-md border border-white/20 flex items-center gap-1.5 md:gap-2">
                      <div class="w-4 h-4 md:w-5 md:h-5 bg-white/20 rounded flex items-center justify-center">
                        <svg class="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </div>
                      <span class="text-white text-[8px] md:text-[10px] font-bold uppercase tracking-wider">Agregar a inicio</span>
                   </div>
                </div>
              </div>
              }

            </div>

            <!-- Wizard Controls -->
            <div class="flex items-center justify-between mt-2 md:mt-3">
               <div class="flex gap-1">
                  <div [class]="'w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ' + (iosStep === 1 ? 'bg-brand-bright w-2.5 md:w-3' : 'bg-white/20')"></div>
                  <div [class]="'w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ' + (iosStep === 2 ? 'bg-brand-bright w-2.5 md:w-3' : 'bg-white/20')"></div>
                  <div [class]="'w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all ' + (iosStep === 3 ? 'bg-brand-bright w-2.5 md:w-3' : 'bg-white/20')"></div>
               </div>
               <button (click)="nextIosStep()" class="bg-brand-bright text-navy-900 py-1.5 md:py-2 px-4 md:px-5 rounded-md md:rounded-lg transition-all active:scale-95 text-[10px] md:text-xs">
                  {{ iosStep === 3 ? '¡Listo!' : 'Siguiente' }}
               </button>
            </div>
          }
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .animate-ios-slide-up {
      animation: iosSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes iosSlideUp {
      from { transform: translateY(120%) scale(0.9); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class InstallPromptComponent implements OnInit {
  deferredPrompt: any;
  showPrompt = false;
  isIOS = false;

  iosStep = 1;

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Check if app is already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (isStandalone) {
      this.showPrompt = false;
      return;
    }

    // Detect iOS (including modern iPads)
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (this.isIOS) {
      // Show prompt for iOS users after a short delay to ensure layout is ready
      setTimeout(() => {
        this.showPrompt = true;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      }, 3000);
    }
  }

  nextIosStep() {
    if (this.iosStep < 3) {
      this.iosStep++;
      this.cdr.detectChanges();
    } else {
      this.dismissPrompt();
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;

    // Only show if not iOS (iOS is handled in ngOnInit)
    if (!this.isIOS) {
      this.showPrompt = true;
      this.cdr.detectChanges(); // Forzar actualización de la vista
    }
  }

  async installPwa() {
    this.showPrompt = false;
    if (!this.deferredPrompt) {
      return;
    }
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
  }

  dismissPrompt() {
    this.showPrompt = false;
  }
}

