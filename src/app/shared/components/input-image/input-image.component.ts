import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-input-image',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, FormFieldComponent],
  templateUrl: './input-image.component.html',

})
export class InputImageComponent extends BaseFormControl {
  protected prefix = 'img-input-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: FormControl;
  @Input() fallbackIcon: string = 'pi pi-building';
  @Input() altText: string = 'Vista previa de la imagen';
}
