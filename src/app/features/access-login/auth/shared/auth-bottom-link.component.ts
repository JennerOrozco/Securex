import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-bottom-link',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="bottom-link">
      @if (prefix) {
        <span>{{ prefix }} </span>
      }
      <a (click)="onToggle.emit(mode)">{{ linkText }}</a>
    </p>
  `
})
export class AuthBottomLinkComponent {
  @Input() prefix = '';
  @Input() linkText = '';
  @Input() mode = 'login';
  @Output() onToggle = new EventEmitter<string>();
}
