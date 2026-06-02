import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionMenuBase } from '../action-menu-base';
import { ActionItem } from '../action-menu.types';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css']
})
export class ContextMenuComponent extends ActionMenuBase {
  @Input() override visible = false;
  @Input() override title = 'Acciones';
  @Input() override items: ActionItem[] = [];
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };

  @Output() override onAction = new EventEmitter<string>();
  @Output() override onClose = new EventEmitter<void>();

  @HostBinding('style.top.px') get top() { return this.position.y; }
  @HostBinding('style.left.px') get left() { return this.position.x; }
}
