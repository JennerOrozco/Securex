import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() showAdd: boolean = true;
  @Input() addLabel: string = 'Nuevo';
  @Input() showSearch: boolean = true;

  @Output() onSearch = new EventEmitter<string>();
  @Output() onAdd = new EventEmitter<void>();

  searchExpanded = false;

  onSearchFocus() {
    if (window.innerWidth <= 768) {
      this.searchExpanded = true;
    }
  }

  search(event: Event) {
    this.onSearch.emit((event.target as HTMLInputElement).value);
  }
}
