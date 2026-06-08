import { Directive, input, output, HostListener, OnDestroy } from '@angular/core';

@Directive({ selector: '[appDebounce]', standalone: true })
export class DebounceDirective implements OnDestroy {
  readonly appDebounce = output<string>();
  readonly debounceMs = input(300, { alias: 'debounceMs' });

  private timeoutId: any;

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.clearPendingTimeout();
    this.timeoutId = setTimeout(() => {
      this.appDebounce.emit(value);
    }, this.debounceMs());
  }

  ngOnDestroy() {
    this.clearPendingTimeout();
  }

  private clearPendingTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
