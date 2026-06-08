import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule, FormFieldComponent],
  templateUrl: './datepicker.component.html',
})
export class DatepickerComponent extends BaseFormControl {
  protected prefix = 'dp-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'YYYY-MM-DD';
  @Input() icon: string = 'pi pi-calendar';
  @Input() required: boolean = false;
  @Input() override control!: any;
  @Input() dateFormat: string = 'yy-mm-dd';
}
