import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FormFieldComponent],
  templateUrl: './input.component.html',
})
export class InputComponent extends BaseFormControl {
  protected prefix = 'input-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() step: string | null = null;
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: FormControl;

  @Output() onInput = new EventEmitter<any>();
}
