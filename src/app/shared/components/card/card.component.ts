import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() headerBg: string = '';
  @Input() collapsible: boolean = true;
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle() {
    if (this.collapsible) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }
}
