import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent {
  @Input() data: any;
  @Input() options: any;
  @Input() currentFrequency: string = 'month';
  @Output() frequencyChange = new EventEmitter<string>();

  frequencies = [
    { label: 'Por Día', value: 'day' },
    { label: 'Por Semana', value: 'week' },
    { label: 'Por Mes', value: 'month' },
    { label: 'Por Año', value: 'year' }
  ];

  changeFrequency(freq: string) {
    this.frequencyChange.emit(freq);
  }
}
