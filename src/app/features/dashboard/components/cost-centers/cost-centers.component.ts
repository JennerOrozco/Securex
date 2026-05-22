import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '../../../../shared/table-component/table-component.component';

@Component({
  selector: 'app-cost-centers-card',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './cost-centers.component.html',
  styleUrls: ['./cost-centers.component.scss']
})
export class CostCentersCardComponent {
  @Input() data: any[] = [];
  @Input() currentLevel: number = 1;
  @Output() levelChange = new EventEmitter<number>();

  columns: TableColumn[] = [
    { field: 'centro_costo', header: 'Centro de Costo', type: 'text' },
    { field: 'total', header: 'Total', type: 'currency' }
  ];

  levels = [
    { label: 'Nivel 1 (Principales)', value: 1 },
    { label: 'Nivel 2 (Subcentros)', value: 2 },
    { label: 'Nivel 3 (Detalle)', value: 3 }
  ];

  changeLevel(level: number) {
    this.levelChange.emit(level);
  }
}
