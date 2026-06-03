import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  @Input() id!: string;
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control?: any; // Accept AbstractControl or any FormControl
  @Input() errorMsg: string = '';
}
