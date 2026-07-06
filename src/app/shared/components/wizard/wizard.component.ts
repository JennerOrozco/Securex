import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../toolbar/toolbar.component';

export interface WizardStep {
  label: string;
  icon: string;
  optional?: boolean;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, ToolbarComponent],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardComponent {
  steps = input<WizardStep[]>([]);
  currentStep = input<number>(1);
  title = input<string>('');
  subtitle = input<string>('');

  get progressPercent(): number {
    const total = this.steps().length;
    if (total <= 1) return 0;
    return ((this.currentStep() - 1) / (total - 1)) * 100;
  }
}
