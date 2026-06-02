import { Directive, Input, Output, EventEmitter } from '@angular/core';
import { ActionItem } from './action-menu.types';

@Directive()
export abstract class ActionMenuBase {
  @Input() visible = false;
  @Input() title = 'Acciones';
  @Input() items: ActionItem[] = [];

  @Output() onAction = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  get visibleItems(): ActionItem[] {
    return this.items.filter(i => i.visible !== false);
  }
}
