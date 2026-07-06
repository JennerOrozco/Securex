import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, FormFieldComponent],
  templateUrl: './select.component.html',
})
export class SelectComponent extends BaseFormControl {
  protected prefix = 'select-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'nombre';
  @Input() optionValue: string = 'id';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: any;
  @Input() showClear: boolean = false;
  @Input() panelStyleClass: string = '';

  @Output() onChange = new EventEmitter<any>();
}
