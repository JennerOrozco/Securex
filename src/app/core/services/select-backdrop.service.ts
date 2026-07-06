import { Injectable, OnDestroy } from '@angular/core';

/**
 * SelectBackdropService
 * Watches for ANY PrimeNG select/multiselect overlay element being added to
 * document.body and, on mobile viewports, injects a real dark backdrop that:
 *   1. Darkens the rest of the screen with a proper overlay.
 *   2. Blocks pointer events so the user cannot tap elements behind it.
 *   3. Closes the active dropdown when the user taps outside the card.
 */
@Injectable({ providedIn: 'root' })
export class SelectBackdropService implements OnDestroy {
  private observer: MutationObserver | null = null;
  private backdrop: HTMLElement | null = null;

  private readonly OVERLAY_SELECTOR =
    '.p-select-overlay, .p-select-panel, .p-multiselect-panel';

  private get isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  /** Start watching the DOM — call once from AppComponent */
  init(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement && this.isOverlay(node)) {
            this.onOverlayAdded(node);
          }
        }
        for (const node of Array.from(mutation.removedNodes)) {
          if (node instanceof HTMLElement && this.isOverlay(node)) {
            this.onOverlayRemoved();
          }
        }
      }
    });

    this.observer.observe(document.body, { childList: true });
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  teardown(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.removeBackdrop(true);
  }

  private isOverlay(el: HTMLElement): boolean {
    return (
      el.classList.contains('p-select-overlay') ||
      el.classList.contains('p-select-panel') ||
      el.classList.contains('p-multiselect-panel')
    );
  }

  private onOverlayAdded(overlay: HTMLElement): void {
    if (!this.isMobile) return;

    document.body.style.overflow = 'hidden';

    if (!this.backdrop) {
      const bd = document.createElement('div');
      bd.className = 'gm-select-backdrop';

      bd.addEventListener('click', (evt) => {
        evt.stopPropagation();
        evt.preventDefault();
        // Simulate Escape to close the active PrimeNG overlay
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
        );
      });

      // Insert BEFORE the overlay so the overlay renders above the backdrop
      document.body.insertBefore(bd, overlay);
      this.backdrop = bd;

      // Animate in on next paint
      requestAnimationFrame(() => {
        bd.classList.add('gm-select-backdrop--visible');
      });
    }
  }

  private onOverlayRemoved(): void {
    const stillOpen = document.body.querySelector(this.OVERLAY_SELECTOR);
    if (stillOpen) return;

    document.body.style.overflow = '';
    this.removeBackdrop(false);
  }

  private removeBackdrop(immediate: boolean): void {
    if (!this.backdrop) return;
    const bd = this.backdrop;
    this.backdrop = null;

    if (immediate) {
      bd.remove();
      return;
    }

    bd.classList.remove('gm-select-backdrop--visible');
    bd.addEventListener('transitionend', () => bd.remove(), { once: true });
  }
}
