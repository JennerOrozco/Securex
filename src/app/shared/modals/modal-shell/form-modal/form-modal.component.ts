import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { FormField } from '../modal-shell.types';
import { SelectComponent } from '../../../components/select/select.component';
import { InputComponent } from '../../../components/input/input.component';
import { PhoneInputComponent } from '../../../components/phone-input/phone-input.component';
import { NitInputComponent } from '../../../components/nit-input/nit-input.component';
import { FileInputComponent } from '../../../components/file-input/file-input.component';
import { InputImageComponent } from '../../../components/input-image/input-image.component';
import { PasswordComponent } from '../../../components/password/password.component';
import { InputNumberComponent } from '../../../components/input-number/input-number.component';
import { DatepickerComponent } from '../../../components/datepicker/datepicker.component';
import { TextareaComponent } from '../../../components/textarea/textarea.component';
import { getFileIcon, getFileIconClass, formatFileSize } from '../modal-shell.utils';
import { SelectGridComponent } from '../../../components/select-grid/select-grid.component';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DialogModule, ButtonModule,
    InputTextModule, InputNumberModule, AutoCompleteModule, DatePickerModule,
    TextareaModule, TooltipModule, RippleModule, SelectModule, SelectComponent, PasswordModule,
    InputComponent, PhoneInputComponent, NitInputComponent, FileInputComponent,
    InputImageComponent, PasswordComponent, InputNumberComponent, DatepickerComponent, TextareaComponent,
    SelectGridComponent
  ],
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() title = 'Nuevo Registro';
  @Input() fields: FormField[] = [];
  @Input() data: any = null;
  @Input() initialData: any = {};
  @Input() loading = false;
  @Input() customFormValid: boolean | null = null;
  @Input() noPadding = false;

  @Output() onConfirm = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onSelectGridEmptyFilter = new EventEmitter<string>();
  @Output() onValueChange = new EventEmitter<any>();

  form!: FormGroup;

  private fb = inject(FormBuilder);

  get dialogClass(): string {
    return this.mode === 'add' ? 'add' : this.mode === 'edit' ? 'edit' : 'view';
  }

  get iconClass(): string {
    return this.mode === 'add' ? 'gm-icon--add' : this.mode === 'edit' ? 'gm-icon--edit' : 'gm-icon--view';
  }

  get icon(): string {
    return this.mode === 'add' ? 'pi pi-plus-circle' : this.mode === 'edit' ? 'pi pi-pencil' : 'pi pi-eye';
  }

  get confirmLabel(): string {
    if (this.mode === 'add') return 'Guardar';
    return 'Actualizar';
  }

  get confirmIcon(): string {
    return this.mode === 'add' ? 'pi pi-check' : 'pi pi-save';
  }

  get confirmSeverity(): 'success' | 'info' {
    return this.mode === 'add' ? 'success' : 'info';
  }

  ngOnInit() { this.initForm(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true || changes['fields'] || changes['data']) {
      this.initForm();
    }
  }

  initForm() {
    const group: any = {};
    this.fields.forEach(field => {
      let value = this.mode === 'add' ? (this.initialData?.[field.name] ?? '') : (this.data?.[field.name] ?? '');
      const validators: any[] = [];
      if (field.required && this.mode !== 'view') validators.push(Validators.required);
      if (field.type === 'email' && this.mode !== 'view') validators.push(Validators.email);
      const isDisabled = this.mode === 'view' || field.disabled;
      group[field.name] = [{ value, disabled: isDisabled }, validators];
    });
    this.form = this.fb.group(group);

    // Watch for value changes and emit them
    this.fields.forEach(field => {
      this.form.get(field.name)?.valueChanges.subscribe(val => {
        this.onValueChange.emit({ field: field.name, value: val, form: this.form });
      });
    });
  }

  isFieldPristine(name: string) { return this.form.get(name)?.pristine; }
  isFieldValid(name: string) { return this.form.get(name)?.valid && this.form.get(name)?.touched; }
  showError(name: string) { return this.form.get(name)?.invalid && this.form.get(name)?.touched; }

  getErrorMessage(field: FormField) {
    const ctrl = this.form.get(field.name);
    if (ctrl?.errors?.['required']) return `${field.label} es requerido.`;
    if (ctrl?.errors?.['email']) return 'Correo inválido.';
    return 'Valor inválido.';
  }

  handleConfirm() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      const payload: any = {};
      this.fields.forEach(f => {
        const val = raw[f.name];
        if (f.type === 'file') {
          if (val instanceof File) {
            payload[f.name] = val;
          } else if (typeof val === 'string' && val) {
            payload[f.name] = val;
          } else {
            payload[f.name] = null;
          }
          return;
        }
        if (f.type === 'select') {
          payload[f.name] = (val && typeof val === 'object' && 'value' in val) ? val.value : val;
        } else {
          payload[f.name] = val;
        }
      });
      this.onConfirm.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }

  getFileIcon = getFileIcon;
  getFileIconClass = getFileIconClass;
  formatFileSize = formatFileSize;
}
