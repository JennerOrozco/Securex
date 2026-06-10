import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.css']
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() type: 'bar' | 'line' | 'doughnut' | 'pie' | 'radar' | 'polarArea' = 'bar';
  @Input() data: any = null;
  @Input() options: any = null;
  @Input() loading: boolean = false;
  @Input() periods: string[] = [];
  @Input() activePeriod: string = '';

  @Output() onPeriodChange = new EventEmitter<string>();

  selectPeriod(period: string) {
    if (this.activePeriod !== period) {
      this.activePeriod = period;
      this.onPeriodChange.emit(period);
    }
  }
}
