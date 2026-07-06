import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-input-number',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputNumberModule, FormFieldComponent],
  templateUrl: './input-number.component.html',
})
export class InputNumberComponent extends BaseFormControl {
  protected prefix = 'in-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: FormControl;
  @Input() minFractionDigits: number = 2;
  @Input() maxFractionDigits: number = 2;
  @Input() mode: 'decimal' | 'currency' = 'decimal';
  @Input() currency: string | undefined = undefined;
  @Input() locale: string | undefined = undefined;

  @Output() onInput = new EventEmitter<any>();
}
