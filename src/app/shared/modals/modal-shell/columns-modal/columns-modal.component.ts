import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableColumn } from '../../../table-component/table.types';
import { ModalShellComponent } from '../modal-shell.component';

@Component({
  selector: 'app-columns-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CheckboxModule, ModalShellComponent],
  templateUrl: './columns-modal.component.html',
  styleUrls: ['./columns-modal.component.css']
})
export class ColumnsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() columns: TableColumn[] = [];
  @Input() selected: TableColumn[] = [];

  @Output() onClose = new EventEmitter<void>();
  @Output() onApply = new EventEmitter<TableColumn[]>();

  private workingSelected: TableColumn[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected']) {
      this.workingSelected = [...(this.selected || [])];
    }
  }

  isSelected(col: TableColumn): boolean {
    return this.workingSelected.some(c => c.field === col.field);
  }

  toggle(col: TableColumn) {
    const idx = this.workingSelected.findIndex(c => c.field === col.field);
    if (idx >= 0) {
      this.workingSelected = this.workingSelected.filter(c => c.field !== col.field);
    } else {
      this.workingSelected = [...this.workingSelected, col];
    }
  }

  apply() {
    this.onApply.emit(this.workingSelected);
  }
}
