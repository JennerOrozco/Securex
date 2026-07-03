import { Component, inject, OnInit, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-update-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showUpdate"
      class="fixed bottom-4 left-3 right-3 md:left-auto md:right-6 md:w-[380px] z-[100]"
      style="animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);">
      <div class="bg-[#1e1e1e]/95 backdrop-blur-2xl border border-orange-500/20 rounded-2xl shadow-2xl shadow-orange-500/10 p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-white font-semibold text-sm mb-1">Actualización disponible</h4>
            <p class="text-white/50 text-xs leading-relaxed">
              Hay una nueva versión de SECUREX. Actualiza para obtener las últimas mejoras y correcciones.
            </p>
          </div>
          <button (click)="dismiss()"
            class="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors flex-shrink-0">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="flex gap-2 mt-3">
          <button (click)="updateNow()"
            class="flex-1 bg-padel-orange hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg shadow-orange-500/20">
            Actualizar ahora
          </button>
          <button (click)="dismiss()"
            class="px-4 py-2 text-white/40 hover:text-white font-medium transition-colors text-sm">
            Después
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideUp {
      from { transform: translateY(120%) scale(0.9); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `]
})
export class UpdatePromptComponent implements OnInit {
  showUpdate = false;

  private destroyRef = inject(DestroyRef);
  private swUpdate = inject(SwUpdate);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(evt => {
      if (evt.type === 'VERSION_READY') {
        this.showUpdate = true;
        this.cdr.detectChanges();
      }
    });
  }

  async updateNow() {
    this.showUpdate = false;
    await this.swUpdate.activateUpdate();
    window.location.reload();
  }

  dismiss() {
    this.showUpdate = false;
  }
}
