import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionMenuBase } from '../action-menu-base';
import { ActionItem } from '../action-menu.types';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.css']
})
export class BottomSheetComponent extends ActionMenuBase {
  @Input() override visible = false;
  @Input() override title = 'Acciones de Fila';
  @Input() override items: ActionItem[] = [];
  @Input() subtitle = '';
  @Input() activeRow: any = null;

  @Output() override onAction = new EventEmitter<string>();
  @Output() override onClose = new EventEmitter<void>();
}
