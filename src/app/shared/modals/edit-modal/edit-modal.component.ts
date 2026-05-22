import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
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
import { SelectComponent } from '../../components/select/select.component';

@Component({
  selector: 'app-edit-modal',
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
    SelectComponent
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [breakpoints]="{ '960px': '80vw', '768px': '92vw', '480px': '96vw' }"
      [style]="{ width: '700px' }"
      (onHide)="onClose.emit()"
      [draggable]="false"
      [resizable]="false"
      styleClass="gm-dialog gm-dialog--edit"
      class="gm-dialog gm-dialog--edit">

      <ng-template pTemplate="header">
        <div class="gm-header">
          <div class="gm-header-icon gm-icon--edit">
            <i class="pi pi-pencil"></i>
          </div>
          <div class="gm-header-text">
            <h2 class="gm-title">{{ title }}</h2>
          </div>
        </div>
      </ng-template>

      <div class="gm-body" [class.gm-body--no-padding]="noPadding">
        <form *ngIf="fields && fields.length > 0" [formGroup]="form" class="gm-form" autocomplete="off" novalidate>
          <div *ngFor="let field of fields; let i = index" class="gm-field" [style.animation-delay]="i * 40 + 'ms'">
            <label [for]="field.name" class="gm-label">
              {{ field.label }}
              <span *ngIf="field.required" class="gm-required">*</span>
              <i *ngIf="field.hint" class="pi pi-info-circle gm-hint-icon" [pTooltip]="field.hint" tooltipPosition="top"></i>
            </label>

            <div class="gm-control-wrap" [ngClass]="{ 'has-error': showError(field.name), 'gm-has-icon': !!field.icon && field.type !== 'select' && field.type !== 'file' }">
              <span *ngIf="field.icon && field.type !== 'select' && field.type !== 'file'" class="gm-field-icon"><i [class]="field.icon"></i></span>
              
              <ng-container [ngSwitch]="field.type">
                <div *ngSwitchCase="'text'" class="w-full">
                  <input pInputText [formControlName]="field.name" [placeholder]="field.placeholder || ''" [class]="'gm-input' + (field.icon ? ' gm-input--icon' : '')" style="width: 100%;" />
                  @if (field.name === 'logo_url' && form.get(field.name)?.value) {
                    <div class="logo-preview-modal-container">
                      <img [src]="form.get(field.name)?.value" alt="Vista previa del logo" class="logo-preview-modal-img" (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling.style.display='flex'" />
                      <div class="logo-preview-modal-fallback" style="display: none;">
                        <i class="pi pi-building"></i>
                      </div>
                    </div>
                  }
                </div>
                <input *ngSwitchCase="'email'" pInputText [formControlName]="field.name" type="email" [placeholder]="field.placeholder || 'correo@ejemplo.com'" [class]="'gm-input' + (field.icon ? ' gm-input--icon' : '')" />
                <p-inputNumber *ngSwitchCase="'number'" [formControlName]="field.name" styleClass="gm-inputnumber" class="w-full"></p-inputNumber>
                
                <app-select
                  *ngSwitchCase="'select'"
                  [id]="field.name"
                  [options]="field.options || []"
                  [optionLabel]="'label'"
                  [optionValue]="'value'"
                  [placeholder]="field.placeholder || 'Seleccione'"
                  [control]="form.get(field.name)"
                  [icon]="field.icon || ''"
                ></app-select>
                
                <p-datepicker *ngSwitchCase="'date'" [formControlName]="field.name" [showIcon]="true" appendTo="body" class="w-full" styleClass="gm-datepicker"></p-datepicker>
                <textarea *ngSwitchCase="'textarea'" pTextarea [formControlName]="field.name" rows="3" class="gm-textarea" [autoResize]="true"></textarea>

                <div *ngSwitchCase="'file'" class="gm-file-wrap">
                  <div class="file-drop-zone"
                       [class.has-file]="filePayloads[field.name] || form.get(field.name)?.value"
                       [class.drag-over]="dragOverFields.has(field.name)"
                       (click)="fileInput.click()"
                       (dragover)="onDragOver($event, field.name)"
                       (dragleave)="onDragLeave($event, field.name)"
                       (drop)="onDrop($event, field.name)">
                    
                    @if (!filePayloads[field.name] && !form.get(field.name)?.value) {
                      <div class="file-drop-content">
                        <i class="pi pi-cloud-upload file-drop-icon"></i>
                        <span class="file-drop-text">Arrastre un archivo o haga clic para seleccionar</span>
                        <span class="file-drop-hint">
                          {{ field.accept?.replace(/,/g, ', ') || 'Todos los archivos' }}
                        </span>
                      </div>
                    } @else {
                      <div class="file-preview-row">
                        @if (filePayloads[field.name]) {
                          @if (localPreviews[field.name]) {
                            <div class="file-image-preview-container">
                              <img [src]="localPreviews[field.name]" alt="Preview" class="file-image-preview-img" />
                            </div>
                          } @else {
                            <div class="file-icon" [class]="getFileIconClass(filePayloads[field.name])">
                              <i [class]="getFileIcon(filePayloads[field.name])"></i>
                            </div>
                          }
                          <div class="file-details">
                            <span class="file-name">{{ filePayloads[field.name].name }}</span>
                            <span class="file-size">{{ formatFileSize(filePayloads[field.name].size) }}</span>
                          </div>
                        } @else {
                          <div class="file-image-preview-container">
                            <img [src]="form.get(field.name)?.value" alt="Preview" class="file-image-preview-img" (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling.style.display='flex'" />
                            <div class="logo-preview-modal-fallback" style="display: none; width: 48px; height: 48px; border-radius: 8px; justify-content: center; align-items: center; background-color: rgba(0,0,0,0.05); color: #64748b;">
                              <i class="pi pi-building" style="font-size: 1.5rem;"></i>
                            </div>
                          </div>
                          <div class="file-details">
                            <span class="file-name">Logo actual</span>
                            <span class="file-size">Existente</span>
                          </div>
                        }
                        <button type="button" class="remove-btn" (click)="removeFile(field.name, $event)">
                          <i class="pi pi-times"></i>
                        </button>
                      </div>
                    }
                  </div>
                  
                  <input
                    #fileInput
                    type="file"
                    [accept]="field.accept || '*'"
                    (change)="onFileChange($event, field.name)"
                    style="display: none"
                  />
                </div>
              </ng-container>

              <span *ngIf="!isFieldPristine(field.name) && field.type !== 'select' && field.type !== 'file'" class="gm-status-icon">
                <i [class]="isFieldValid(field.name) ? 'pi pi-check gm-valid' : 'pi pi-times gm-invalid'"></i>
              </span>
            </div>
            <p *ngIf="showError(field.name)" class="gm-error-msg"><i class="pi pi-exclamation-circle"></i> {{ getErrorMessage(field) }}</p>
          </div>
        </form>
        <ng-content></ng-content>
      </div>

      <ng-template pTemplate="footer">
        <div class="gm-footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" styleClass="gm-btn gm-btn--cancel" (onClick)="onClose.emit()"></p-button>
          <p-button [label]="confirmButtonLabel" icon="pi pi-save" severity="info" [disabled]="customFormValid !== null ? !customFormValid : (form.invalid || form.pristine)" [loading]="loading" styleClass="gm-btn gm-btn--confirm" (onClick)="handleConfirm()"></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styleUrls: ['../modals.css']
})
export class EditModalComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() title = 'Editar Registro';
  @Input() fields: FormField[] = [];
  @Input() data: any = null;
  @Input() loading = false;
  @Input() customFormValid: boolean | null = null;
  @Input() noPadding = false;

  @Output() onConfirm = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  get confirmButtonLabel(): string {
    if (typeof window !== 'undefined' && window.innerWidth <= 480) {
      return 'Aceptar';
    }
    return 'Actualizar';
  }

  form!: FormGroup;
  filteredOptions: Record<string, any[]> = {};
  filePayloads: Record<string, File> = {};
  localPreviews: Record<string, string> = {};
  dragOverFields: Set<string> = new Set();

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.initForm(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true || changes['data'] || changes['fields']) {
      this.filePayloads = {};
      this.localPreviews = {};
      this.dragOverFields.clear();
      this.initForm();
      this.cdr.markForCheck();
    }
  }

  initForm() {
    const group: any = {};
    this.fields.forEach(field => {
      let value = this.data ? this.data[field.name] : '';
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.type === 'email') validators.push(Validators.email);

      group[field.name] = [{ value, disabled: field.disabled }, validators];
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
        reader.onload = () => {
          this.localPreviews[fieldName] = reader.result as string;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        delete this.localPreviews[fieldName];
      }
      this.form.get(fieldName)?.setValue(file);
      this.form.get(fieldName)?.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  onDragOver(event: DragEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFields.add(fieldName);
    this.cdr.markForCheck();
  }

  onDragLeave(event: DragEvent, fieldName: string) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverFields.delete(fieldName);
    this.cdr.markForCheck();
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
        reader.onload = () => {
          this.localPreviews[fieldName] = reader.result as string;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        delete this.localPreviews[fieldName];
      }
      this.form.get(fieldName)?.setValue(file);
      this.form.get(fieldName)?.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  removeFile(fieldName: string, event: Event) {
    event.stopPropagation();
    delete this.filePayloads[fieldName];
    delete this.localPreviews[fieldName];
    this.form.get(fieldName)?.setValue('');
    this.form.get(fieldName)?.markAsDirty();
    this.cdr.markForCheck();
  }

  filterOptions(event: any, field: FormField) {
    const query = event.query.toLowerCase();
    this.filteredOptions[field.name] = (field.options || []).filter(o => o.label.toLowerCase().includes(query));
  }

  getControlState(name: string) { return { 'has-error': this.showError(name) }; }
  isFieldPristine(name: string) { return this.form.get(name)?.pristine; }
  isFieldValid(name: string) { return this.form.get(name)?.valid && this.form.get(name)?.touched; }
  showError(name: string) { return this.form.get(name)?.invalid && this.form.get(name)?.touched; }
  
  getErrorMessage(field: FormField) {
    const ctrl = this.form.get(field.name);
    if (ctrl?.errors?.['required']) return `${field.label} es requerido.`;
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
          } else if (this.form.get(f.name)?.value) {
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

  getFileIcon(file: File): string {
    if (!file) return 'pi pi-file';
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'pi pi-file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'pi pi-image';
      case 'doc':
      case 'docx': return 'pi pi-file-word';
      case 'xls':
      case 'xlsx': return 'pi pi-file-excel';
      default: return 'pi pi-file';
    }
  }

  getFileIconClass(file: File): string {
    if (!file) return 'default';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (['xls', 'xlsx'].includes(ext || '')) return 'excel';
    return 'default';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
