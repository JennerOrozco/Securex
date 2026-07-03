import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-card.html'
})
export class InfoCardComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() subtitleIcon?: string; // e.g. 'pi-map-marker'

  @Input() avatarIcon?: string; // e.g. 'pi-building'
  @Input() avatarText?: string; // e.g. 'C'
  @Input() avatarColor: 'violet' | 'emerald' | 'blue' | 'gray' | 'indigo' | 'red' | 'amber' = 'violet';

  @Input() metadata: { icon: string, text: string }[] = [];
  
  @Input() statusBadge?: { text: string, severity: 'success' | 'danger' | 'warning' | 'info' };

  @Input() opacityClass: string = ''; // For fade effects if disabled/editing

  get colorClasses() {
    switch(this.avatarColor) {
      case 'emerald': return 'bg-emerald-50 text-emerald-600';
      case 'indigo': return 'bg-indigo-50 text-indigo-600';
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'red': return 'bg-red-50 text-red-600';
      case 'amber': return 'bg-amber-50 text-amber-600';
      case 'gray': return 'bg-slate-100 text-slate-600';
      case 'violet': 
      default:
        return 'bg-violet-50 text-violet-600';
    }
  }

  get statusClasses() {
    if(!this.statusBadge) return '';
    switch(this.statusBadge.severity) {
      case 'success': return 'bg-emerald-50 text-emerald-700';
      case 'danger': return 'bg-red-50 text-red-700';
      case 'warning': return 'bg-amber-50 text-amber-700';
      case 'info': return 'bg-blue-50 text-blue-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  }

  get statusIcon() {
    if(!this.statusBadge) return '';
    switch(this.statusBadge.severity) {
      case 'success': return 'pi-check-circle';
      case 'danger': return 'pi-exclamation-circle';
      case 'warning': return 'pi-exclamation-triangle';
      case 'info': return 'pi-info-circle';
      default: return 'pi-circle';
    }
  }
}
