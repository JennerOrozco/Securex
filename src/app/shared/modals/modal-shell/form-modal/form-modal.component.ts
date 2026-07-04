import { Component, OnInit, inject, effect, computed, untracked, ChangeDetectorRef } from '@angular/core';
import { input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

// Imports de PrimeNG
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

// Imports de Componentes y Utilidades Propios
import { FormField, ModalMode } from '../modal-shell.types';
import { DynamicFormComponent } from '../../../components';
import { getFileIcon, getFileIconClass, formatFileSize } from '../modal-shell.utils';
import { buildFormGroup } from '@shared/utils/form-utils';

@Component({
  selector: 'app-form-modal',
  standalone: true,
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
    SelectModule,
    DynamicFormComponent
  ],
  templateUrl: './form-modal.component.html',
  styleUrls: ['./form-modal.component.css']
})
export class FormModalComponent implements OnInit {
  // Inputs definidos como Signals (visible es bidireccional)
  visible = model(false);
  mode = input<ModalMode>('add');
  title = input('Nuevo Registro');
  fields = input<FormField[]>([]);
  data = input<any>(null);
  initialData = input<any>({});
  loading = input(false);
  customFormValid = input<boolean | null>(null);
  noPadding = input(false);
  showFooter = input(true);
  width = input<string | null>(null);
  draggable = input(true);
  resizable = input(true);
  /** Clase CSS para el grid interno del formulario */
  gridClass = input('flex flex-col gap-4');

  // Outputs definidos con la nueva API output()
  onConfirm = output<any>();
  onClose = output<void>();
  onSelectGridEmptyFilter = output<string>();
  onValueChange = output<any>();

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private formSubs = new Subscription(); // Contenedor para evitar memory leaks

  // Estados computados (reemplazan los getters reactivos tradicionales)
  dialogClass = computed(() => {
    const m = this.mode();
    return m === 'add' ? 'add' : m === 'edit' ? 'edit' : 'view';
  });

  iconClass = computed(() => {
    const m = this.mode();
    return m === 'add' ? 'gm-icon--add' : m === 'edit' ? 'gm-icon--edit' : 'gm-icon--view';
  });

  icon = computed(() => {
    const m = this.mode();
    return m === 'add' ? 'pi pi-plus-circle' : m === 'edit' ? 'pi pi-pencil' : 'pi pi-eye';
  });

  confirmLabel = computed(() => this.mode() === 'add' ? 'Guardar' : 'Actualizar');
  confirmIcon = computed(() => this.mode() === 'add' ? 'pi pi-check' : 'pi pi-save');
  confirmSeverity = computed(() => this.mode() === 'add' ? 'success' : 'info');

  constructor() {
    // Reemplazo de ngOnChanges por un efecto reactivo controlado
    effect(() => {
      const isVisible = this.visible();
      const currentFields = this.fields();
      const currentData = this.data();

      untracked(() => {
        if (isVisible || currentFields.length > 0 || currentData) {
          this.initForm();
          this.cdr.detectChanges();
        }
      });
    });
  }

  ngOnInit() {
    if (!this.form) this.initForm();
  }

  /**
   * Lee un valor de un objeto usando notación de puntos (dot-notation).
   * e.g. getNestedValue({ user: { uuid: '123' } }, 'user.uuid') → '123'
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
  }

  /**
   * Asigna un valor dentro de un objeto reconstruyendo la estructura anidada o arrays correspondientes.
   * e.g. 'access.0.role.uuid' creará { access: [ { role: { uuid: valor } } ] }
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        // Detecta si la siguiente llave es un índice numérico de array o una propiedad de objeto
        current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }

  initForm() {
    this.formSubs.unsubscribe();
    this.formSubs = new Subscription();

    const mode = this.mode();
    const source = mode === 'add' ? this.initialData() : (this.data() || {});

    this.form = buildFormGroup(this.fb, this.fields(), source);

    this.fields().forEach(field => {
      const control = this.form.get(field.name);
      if (control) {
        this.formSubs.add(
          control.valueChanges.subscribe(val => {
            this.onValueChange.emit({ field: field.name, value: val, form: this.form });
          })
        );
      }
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

      this.fields().forEach(f => {
        let finalValue = raw[f.name];

        // Mapeo adaptativo según el tipo de campo
        if (f.type === 'file') {
          finalValue = (finalValue instanceof File || (typeof finalValue === 'string' && finalValue))
            ? finalValue
            : null;
        } else if (f.type === 'select') {
          finalValue = (finalValue && typeof finalValue === 'object' && 'value' in finalValue)
            ? finalValue.value
            : finalValue;
        }

        // Construcción estructurada del payload (Soporta objetos anidados reales)
        payload[f.name] = finalValue;
        if (f.dataPath) {
          this.setNestedValue(payload, f.dataPath, finalValue);
        }
      });

      this.onConfirm.emit(payload);
    } else {
      this.form.markAllAsTouched();
    }
  }

  // Mapeo de métodos estáticos útiles para el template
  getFileIcon = getFileIcon;
  getFileIconClass = getFileIconClass;
  formatFileSize = formatFileSize;
}