import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FormField, ModalMode } from '../../modals/modal-shell/modal-shell.types';
import { SelectComponent } from '../select/select.component';
import { InputComponent } from '../input/input.component';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { NitInputComponent } from '../nit-input/nit-input.component';
import { FileInputComponent } from '../file-input/file-input.component';
import { InputImageComponent } from '../input-image/input-image.component';
import { PasswordComponent } from '../password/password.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { DatepickerComponent } from '../datepicker/datepicker.component';
import { TextareaComponent } from '../textarea/textarea.component';
import { SelectGridComponent } from '../select-grid/select-grid.component';
import { InputColorComponent } from '../input-color/input-color.component';
import { InputAvatarComponent } from '../input-avatar/input-avatar.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SelectComponent,
    InputComponent,
    PhoneInputComponent,
    NitInputComponent,
    FileInputComponent,
    InputImageComponent,
    PasswordComponent,
    InputNumberComponent,
    DatepickerComponent,
    TextareaComponent,
    SelectGridComponent,
    InputColorComponent,
    InputAvatarComponent
  ],
  templateUrl: './dynamic-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent {
  fields = input.required<FormField[]>();
  parentForm = input.required<FormGroup>();
  mode = input<ModalMode>('add');
  gridClass = input<string>('flex flex-col gap-4');

  onSelectGridEmptyFilter = output<string>();

  get form(): FormGroup {
    return this.parentForm();
  }
}
