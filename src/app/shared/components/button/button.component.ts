import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterModule, TooltipModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() type: string = 'button';
  @Input() class: string = 'p-button-primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() routerLink: any;
  @Input() tooltip: string = '';
  @Input() tooltipPosition: string = 'top';
  @Input() severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast' | undefined;
  @Input() outlined: boolean = false;

  @Output() onClick = new EventEmitter<void>();
}
