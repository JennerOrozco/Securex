import { Directive, input, output, HostListener, inject } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({ selector: '[appDebounce]', standalone: true })
export class DebounceDirective {
  readonly appDebounce = output<string>();
  readonly debounceMs = input(300, { alias: 'debounceMs' });

  private ngModel = inject(NgModel, { optional: true });
  private timeoutId: any;

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.appDebounce.emit(value);
    }, this.debounceMs());
  }
}
