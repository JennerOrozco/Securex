import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { FormFieldComponent } from '../form-field/form-field.component';
import { SelectGridColumn } from './select-grid.types';

@Component({
  selector: 'app-select-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, ButtonModule, FormFieldComponent],
  templateUrl: './select-grid.component.html',

})
export class SelectGridComponent {
  @Input() id: string = 'sg-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione...';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: AbstractControl;
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() columns: SelectGridColumn[] = [];
  @Input() filterBy: string = '';
  @Input() showClear: boolean = true;
  @Input() emptyFilterLabel: string = 'Nuevo';
  @Input() emptyFilterIcon: string = 'pi pi-plus';

  @Output() onEmptyFilterAction = new EventEmitter<void>();
  @Output() onChange = new EventEmitter<any>();
}
