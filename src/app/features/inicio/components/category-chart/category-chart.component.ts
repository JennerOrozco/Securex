import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './category-chart.component.html',
  styleUrls: ['./category-chart.component.scss']
})
export class CategoryChartComponent {
  @Input() data: any;
  @Input() options: any;
}
