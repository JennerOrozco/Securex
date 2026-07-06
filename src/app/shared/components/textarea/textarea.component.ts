import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextareaModule, FormFieldComponent],
  templateUrl: './textarea.component.html',

})
export class TextareaComponent extends BaseFormControl {
  protected prefix = 'textarea-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: FormControl;
  @Input() rows: number = 3;
  @Input() autoResize: boolean = true;

  @Output() onInput = new EventEmitter<any>();
}
