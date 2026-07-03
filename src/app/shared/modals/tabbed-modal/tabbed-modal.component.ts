import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, Directive, TemplateRef, AfterContentInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ModalShellComponent } from '../modal-shell/modal-shell.component';
import { ModalMode } from '../modal-shell/modal-shell.types';

@Directive({ selector: '[tabPanel]', standalone: true })
export class TabPanelDirective {
  @Input() tabPanel!: string;
  constructor(public template: TemplateRef<any>) {}
}

export interface ModalTab {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-tabbed-modal',
  standalone: true,
  imports: [CommonModule, TabsModule, ModalShellComponent],
  templateUrl: './tabbed-modal.component.html'
})
export class TabbedModalComponent implements AfterContentInit {
  private cdr = inject(ChangeDetectorRef);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() title = '';
  @Input() mode: ModalMode = 'add';
  @Input() width = '750px';
  @Input() tabs: ModalTab[] = [];
  @Input() loading = false;
  @Input() formValid = true;
  @Input() cancelLabel = 'Cancelar';

  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @ContentChildren(TabPanelDirective) tabPanels?: QueryList<TabPanelDirective>;

  activeTab = '';

  get headerIcon(): string {
    if (this.mode === 'view') return 'pi pi-eye';
    return this.mode === 'add' ? 'pi pi-plus-circle' : 'pi pi-pencil';
  }

  get confirmLabelText(): string {
    return this.mode === 'add' ? 'Guardar' : 'Actualizar';
  }

  get confirmIconText(): string {
    return this.mode === 'add' ? 'pi pi-check' : 'pi pi-save';
  }

  onTabChange(value: string | number | undefined) {
    this.activeTab = String(value ?? '');
  }

  ngAfterContentInit() {
    if (this.tabs.length > 0 && !this.activeTab) {
      this.activeTab = this.tabs[0].value;
    }
    this.cdr.detectChanges();
  }

  getPanelTemplate(value: string): TemplateRef<any> | undefined {
    return this.tabPanels?.find(p => p.tabPanel === value)?.template;
  }
}
