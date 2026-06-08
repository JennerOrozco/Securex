import { Input, Output, EventEmitter, Directive } from '@angular/core';

@Directive()
export abstract class AuthFormBase {
  @Input() loading = false;
  @Output() onToggleMode = new EventEmitter<string>();

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }
}
