import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule],
  templateUrl: './password.component.html',

})
export class PasswordComponent {
  @Input() id: string = 'password-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() feedback: boolean = false; // Mostrar indicador de fuerza
  @Input() toggleMask: boolean = true; // Mostrar/ocultar contraseña
  @Input() control!: any;

  @Output() onInput = new EventEmitter<any>();
}
