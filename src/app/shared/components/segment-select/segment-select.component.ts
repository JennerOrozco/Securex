import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-segment-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './segment-select.component.html',
  styleUrl: './segment-select.component.css'
})
export class SegmentSelectComponent {
  @Input() options: { label: string; value: string }[] = [];
  @Input() selectedValue: string = '';
  @Output() onSelect = new EventEmitter<string>();

  selectOption(val: string): void {
    this.selectedValue = val;
    this.onSelect.emit(val);
  }

  badgeClass(val: string): string {
    switch (val) {
      case 'repuesto': return 'seg-repuesto';
      case 'servicio': return 'seg-servicio';
      case 'gasto': return 'seg-gasto';
      default: return 'seg-default';
    }
  }
}
