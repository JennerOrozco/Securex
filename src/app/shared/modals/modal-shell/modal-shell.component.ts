import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-modal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogModule, ButtonModule, RippleModule],
  templateUrl: './modal-shell.component.html'
})
export class ModalShellComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() title = '';
  @Input() width = '480px';
  @Input() styleClass = '';
  @Input() draggable = false;
  @Input() noPadding = false;
  @Input() breakpoints = { '960px': '80vw', '768px': '92vw', '480px': '96vw' };

  // Header configs
  @Input() icon = '';
  @Input() iconType: 'delete' | 'send' | 'view' | 'edit' | 'add' | 'info' = 'info';

  // Footer configs
  @Input() showFooter = true;
  @Input() loading = false;
  @Input() confirmLabel = 'Confirmar';
  @Input() confirmIcon = 'pi pi-check';
  @Input() confirmSeverity: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined = 'info';
  @Input() cancelLabel = 'Cancelar';
  @Input() cancelIcon = 'pi pi-times';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  @ContentChild('customFooter') customFooterTemplate?: TemplateRef<any>;
}
