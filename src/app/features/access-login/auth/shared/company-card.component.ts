import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultPipe } from '@shared/pipes/default.pipe';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [CommonModule, DefaultPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (company) {
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
    }
  `
})
export class CompanyCardComponent {
  @Input() company: { uuid: string; name: string; branch_name?: string } | null = null;
  @Input() selected = false;
  @Output() onSelect = new EventEmitter<{ uuid: string; name: string }>();
}
