import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, InputTextModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() showAdd: boolean = true;
  @Input() addLabel: string = 'Nuevo';

  @Output() onSearch = new EventEmitter<string>();
  @Output() onAdd = new EventEmitter<void>();

  search(event: Event) {
    this.onSearch.emit((event.target as HTMLInputElement).value);
  }
}
