import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule],
  templateUrl: './select.component.html',

})
export class SelectComponent {
  @Input() id: string = 'select-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() options: any[] = [];
  @Input() optionLabel: string = 'nombre';
  @Input() optionValue: string = 'id';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: any;
  @Input() showClear: boolean = false;

  @Output() onChange = new EventEmitter<any>();
}
