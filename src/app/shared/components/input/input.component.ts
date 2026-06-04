import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './input.component.html',

})
export class InputComponent {
  @Input() id: string = 'input-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() step: string | null = null;
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: any; // Accept AbstractControl or FormControl

  @Output() onInput = new EventEmitter<any>();
}
