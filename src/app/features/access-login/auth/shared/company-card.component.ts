import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultPipe } from '@shared/pipes/default.pipe';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [CommonModule, DefaultPipe],
  template: `
    <div class="company-card-item"
      [class.selected]="selected"
      (click)="onSelect.emit(company)">
      <div class="company-info-text">
        <span class="company-name-text">{{ company.name }}</span>
        <span class="company-role-text">{{ company.branch_name | default:'Usuario Aprobado' }}</span>
      </div>
      @if (selected) {
        <div class="company-check-icon">
          <i class="fas fa-check-circle"></i>
        </div>
      }
    </div>
  `
})
export class CompanyCardComponent {
  @Input() company: any = null;
  @Input() selected = false;
  @Output() onSelect = new EventEmitter<any>();
}
