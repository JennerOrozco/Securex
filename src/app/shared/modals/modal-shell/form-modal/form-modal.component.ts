import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
import { getFileIcon, getFileIconClass, formatFileSize } from '../modal-shell.utils';

@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DialogModule, ButtonModule,
    InputTextModule, InputNumberModule, AutoCompleteModule, DatePickerModule,
    TextareaModule, TooltipModule, RippleModule, SelectModule, SelectComponent, PasswordModule, InputComponent
  ],
  templateUrl: './form-modal.component.html',
  styleUrls: ['../../modals.css', './form-modal.component.css']
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

  form!: FormGroup;
  filePayloads: Record<string, File> = {};
  localPreviews: Record<string, string> = {};
  dragOverFields: Set<string> = new Set();

  constructor(private fb: FormBuilder) {}

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
      this.filePayloads = {};
      this.localPreviews = {};
      this.dragOverFields.clear();
      this.initForm();
    }
  }

  initForm() {
    const group: any = {};
    this.fields.forEach(field => {
      if (field.type === 'file') return;
      let value = this.mode === 'add' ? (this.initialData?.[field.name] ?? '') : (this.data?.[field.name] ?? '');
      const validators: any[] = [];
      if (field.required && this.mode !== 'view') validators.push(Validators.required);
      if (field.type === 'email' && this.mode !== 'view') validators.push(Validators.email);
      const isDisabled = this.mode === 'view' || field.disabled;
      group[field.name] = [{ value, disabled: isDisabled }, validators];
    });
    this.form = this.fb.group(group);
  }

  onFileChange(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.filePayloads[fieldName] = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => { this.localPreviews[fieldName] = reader.result as string; };
        reader.readAsDataURL(file);
      } else {
        delete this.localPreviews[fieldName];
      }
      this.form.get(fieldName)?.setValue(file);
      this.form.get(fieldName)?.markAsDirty();
    }
  }

  onDragOver(event: DragEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFields.add(fieldName);
  }

  onDragLeave(event: DragEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFields.delete(fieldName);
  }

  onDrop(event: DragEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFields.delete(fieldName);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.filePayloads[fieldName] = file;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => { this.localPreviews[fieldName] = reader.result as string; };
        reader.readAsDataURL(file);
      } else {
        delete this.localPreviews[fieldName];
      }
      this.form.get(fieldName)?.setValue(file);
      this.form.get(fieldName)?.markAsDirty();
    }
  }

  removeFile(fieldName: string, event: Event) {
    event.stopPropagation();
    delete this.filePayloads[fieldName];
    delete this.localPreviews[fieldName];
    this.form.get(fieldName)?.setValue('');
    this.form.get(fieldName)?.markAsDirty();
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
        if (f.type === 'file') {
          if (this.filePayloads[f.name]) {
            payload[f.name] = this.filePayloads[f.name];
          } else if (this.form.get(f.name)?.value && typeof this.form.get(f.name)?.value === 'string') {
            payload[f.name] = this.form.get(f.name)?.value;
          } else {
            payload[f.name] = null;
          }
          return;
        }
        const val = raw[f.name];
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
