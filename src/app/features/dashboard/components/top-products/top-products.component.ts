import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '../../../../shared/table-component/table-component.component';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './top-products.component.html',
  styleUrls: ['./top-products.component.scss']
})
export class TopProductsComponent {
  @Input() data: any[] = [];

  columns: TableColumn[] = [
    { field: 'producto', header: 'Producto', type: 'text' },
    { field: 'cantidad', header: 'Cantidad', type: 'text' },
    { field: 'total', header: 'Total', type: 'currency' }
  ];
}
