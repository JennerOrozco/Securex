import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormArray, FormGroup } from '@angular/forms';
import { SelectComponent } from '@shared/components/select/select.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputComponent } from '@shared/components/input/input.component';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { TableComponent } from '../table-component/table-component.component';

export interface TableEditColumn {
  field: string;
  header: string;
  type: 'select' | 'number' | 'currency' | 'text' | 'readonly' | 'decimal-input';
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  width?: string;
  placeholder?: string;
  format?: 'currency' | 'number';
}

@Component({
  selector: 'app-table-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TooltipModule,
    SelectComponent,
    InputNumberComponent,
    InputComponent,
    ToolbarComponent,
    TableComponent
  ],
  styleUrls: ['./table-edit.component.css'],
  templateUrl: './table-edit.component.html'
})
export class TableEditComponent {
  @Input() title: string = 'Detalle';
  @Input() subtitle: string = 'Gestiona las líneas de detalle';
  @Input() formArray!: FormArray;
  @Input() columns: TableEditColumn[] = [];
  @Input() expansionColumns: any[] = [];
  @Input() loading: boolean = false;
  @Input() showExpansionAdd: boolean = false;
  @Input() expansionAddLabel: string = 'Agregar Gasto';

  @Output() onAdd = new EventEmitter<void>();
  @Output() onRemove = new EventEmitter<number>();
  @Output() onChange = new EventEmitter<{ index: number, field: string }>();
  @Output() onExpansionAdd = new EventEmitter<any>();

  editingIndex: number | null = null;

  getFormGroup(index: number): FormGroup {
    return this.formArray.at(index) as FormGroup;
  }

  toggleEditing(index: number) {
    this.editingIndex = (this.editingIndex === index) ? null : index;
  }

  handleValueChange(index: number, field: string) {
    this.onChange.emit({ index, field });
  }

  onRowExpand(event: any) {
    console.log('TableEdit: Row expanded:', event);
    console.log('TableEdit: Row data (FormGroup) value:', event.data?.value);
    console.log('TableEdit: Gastos in row:', event.data?.get('gastos')?.value);
  }

  getLabelFromOptions(val: any, options: any[], valKey = 'value', lblKey = 'label'): string {
    if (!options || !Array.isArray(options)) return val;
    const found = options.find(o => o[valKey] == val);
    return found ? found[lblKey] : val;
  }
}
