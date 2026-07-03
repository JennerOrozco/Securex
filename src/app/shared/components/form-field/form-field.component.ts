import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  id = input.required<string>();
  label = input<string>('');
  icon = input<string>('');
  required = input<boolean>(false);
  control = input<any>(); // Accept AbstractControl or any FormControl
  errorMsg = input<string>('');
}

