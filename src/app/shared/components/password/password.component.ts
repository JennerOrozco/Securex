import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, FormFieldComponent],
  templateUrl: './password.component.html',
})
export class PasswordComponent extends BaseFormControl {
  protected prefix = 'password-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: FormControl;
  @Input() feedback: boolean = false;
  @Input() toggleMask: boolean = true;

  @Output() onInput = new EventEmitter<any>();
}
