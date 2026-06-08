import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormFieldComponent } from '../form-field/form-field.component';
import { BaseFormControl } from '../base-form-control';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoCompleteModule, FormFieldComponent],
  templateUrl: './autocomplete.component.html',
})
export class AutocompleteComponent extends BaseFormControl {
  protected prefix = 'ac-';

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Buscar...';
  @Input() suggestions: any[] = [];
  @Input() optionLabel: string = 'nombre';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() override control!: any;

  @Output() completeMethod = new EventEmitter<any>();
}
