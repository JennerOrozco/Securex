import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { FormField } from '../modal.types';

@Component({
  selector: 'app-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
    DatePickerModule,
    TextareaModule,
    TooltipModule,
    RippleModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [breakpoints]="{ '960px': '80vw', '768px': '92vw', '480px': '96vw' }"
      [style]="{ width: '520px' }"
      (onHide)="onClose.emit()"
      [draggable]="false"
      [resizable]="false"
      styleClass="gm-dialog gm-dialog--view"
      class="gm-dialog gm-dialog--view">

      <ng-template pTemplate="header">
        <div class="gm-header">
          <div class="gm-header-icon gm-icon--view">
            <i class="pi pi-eye"></i>
          </div>
          <div class="gm-header-text">
            <h2 class="gm-title">{{ title }}</h2>
          </div>
        </div>
      </ng-template>

      <div class="gm-body">
        <form [formGroup]="form" class="gm-form">
          <div *ngFor="let field of fields; let i = index" class="gm-field" [style.animation-delay]="i * 40 + 'ms'">
            <label [for]="field.name" class="gm-label">{{ field.label }}</label>
            <div class="gm-control-wrap">
              <span *ngIf="field.icon" class="gm-field-icon"><i [class]="field.icon"></i></span>
              <ng-container [ngSwitch]="field.type">
                <input *ngSwitchCase="'text'" pInputText [formControlName]="field.name" class="gm-input" [class.gm-input--icon]="field.icon" />
                <input *ngSwitchCase="'email'" pInputText [formControlName]="field.name" class="gm-input" [class.gm-input--icon]="field.icon" />
                <p-inputNumber *ngSwitchCase="'number'" [formControlName]="field.name" styleClass="gm-inputnumber" class="w-full"></p-inputNumber>
                <p-autoComplete *ngSwitchCase="'select'" [formControlName]="field.name" field="label" [dropdown]="true" class="w-full" styleClass="gm-autocomplete"></p-autoComplete>
                <p-datepicker *ngSwitchCase="'date'" [formControlName]="field.name" [showIcon]="true" class="w-full" styleClass="gm-datepicker"></p-datepicker>
                <textarea *ngSwitchCase="'textarea'" pTextarea [formControlName]="field.name" rows="3" class="gm-textarea"></textarea>
              </ng-container>
            </div>
          </div>
        </form>
      </div>

      <ng-template pTemplate="footer">
        <div class="gm-footer">
          <p-button label="Cerrar" icon="pi pi-times" severity="secondary" styleClass="gm-btn gm-btn--confirm" (onClick)="onClose.emit()"></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styleUrls: ['../modals.css']
})
export class ViewModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() title = 'Detalles del Registro';
  @Input() fields: FormField[] = [];
  @Input() data: any = null;

  @Output() onClose = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() { this.initForm(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true || changes['data']) {
      this.initForm();
    }
  }

  initForm() {
    const group: any = {};
    this.fields.forEach(field => {
      let value = this.data ? this.data[field.name] : '';
      if (field.type === 'select' && value !== null && value !== '') {
        const match = field.options?.find(o => o.value === value);
        value = match ?? '';
      }
      group[field.name] = [{ value, disabled: true }];
    });
    this.form = this.fb.group(group);
  }
}
