import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoCompleteModule],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css']
})
export class AutocompleteComponent {
  @Input() id: string = 'ac-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = 'Buscar...';
  @Input() suggestions: any[] = [];
  @Input() optionLabel: string = 'nombre';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: any;

  @Output() completeMethod = new EventEmitter<any>();
}
