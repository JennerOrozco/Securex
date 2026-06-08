import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldComponent } from '../form-field/form-field.component';
import { nitValidator, sanitizeNitInput } from './nit-input.utils';
import { BaseFormControl } from '../base-form-control';

export { nitValidator } from './nit-input.utils';

@Component({
  selector: 'app-nit-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, FormFieldComponent],
  templateUrl: './nit-input.component.html',

})
export class NitInputComponent extends BaseFormControl {
  protected prefix = 'nit-';

  @Input() id: string = '';
  @Input() label: string = 'NIT';
  @Input() placeholder: string = 'C/F o número de NIT';
  @Input() icon: string = 'pi pi-id-card';
  @Input() required: boolean = false;
  @Input() override control!: any;
  @Input() disabled: boolean = false;

  override onControlInit() {
    if (this.control) {
      const currentValidators = this.control.validator;
      this.control.setValidators(
        currentValidators ? [currentValidators, nitValidator] : [nitValidator]
      );
      this.control.updateValueAndValidity({ emitEvent: false });

      if (this.control.value) {
        this.formatValue(this.control.value);
      }
    }
  }

  override onControlChange(val: any) {
    this.formatValue(val);
  }

  onNitInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let raw = inputElement.value;
    const prevValue = this.control?.value || '';

    while (raw.length > 0) {
      const first = raw.charAt(0);
      if (/\d/.test(first) || first.toUpperCase() === 'C') break;
      raw = raw.substring(1);
    }

    const isAddingToCF = prevValue === 'C/F' && raw.length > prevValue.length;
    if (isAddingToCF) {
      raw = 'C/F';
      inputElement.value = 'C/F';
    }

    const isDeleting = prevValue.length > raw.length;
    if (!isDeleting) {
      const upperRaw = raw.toUpperCase().trim();
      if (upperRaw === 'C' || upperRaw === 'CF' || upperRaw === 'C/') {
        raw = 'C/F';
        inputElement.value = 'C/F';
      }
    }

    const clean = sanitizeNitInput(raw);
    if (inputElement.value !== clean) {
      inputElement.value = clean;
    }

    this.setControlValue(clean);
  }

  override onBlur() {
    if (this.control) {
      this.control.markAsTouched();
    }
  }

  private formatValue(val: string) {
    if (!val) return;
    const raw = String(val);
    const clean = sanitizeNitInput(raw);

    if (clean !== raw) {
      this.setControlValue(clean);
    }
  }
}
