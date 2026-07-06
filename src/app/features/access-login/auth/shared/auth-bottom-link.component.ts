import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-bottom-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
