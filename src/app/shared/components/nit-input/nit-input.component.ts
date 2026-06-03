import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { nitValidator, sanitizeNitInput } from './nit-input.utils';

export { nitValidator } from './nit-input.utils';

@Component({
  selector: 'app-nit-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './nit-input.component.html',
  styleUrls: ['./nit-input.component.css']
})
export class NitInputComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id: string = 'nit-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = 'NIT';
  @Input() placeholder: string = 'C/F o número de NIT';
  @Input() icon: string = 'pi pi-id-card';
  @Input() required: boolean = false;
  @Input() control!: any;
  @Input() disabled: boolean = false;

  private updatingSelf = false;
  private sub?: Subscription;

  ngOnInit() {
    this.initControl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['control'] && !changes['control'].firstChange) {
      this.sub?.unsubscribe();
      this.initControl();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private initControl() {
    if (this.control) {
      const currentValidators = this.control.validator;
      this.control.setValidators(
        currentValidators ? [currentValidators, nitValidator] : [nitValidator]
      );
      this.control.updateValueAndValidity({ emitEvent: false });

      if (this.control.value) {
        this.formatValue(this.control.value);
      }

      this.sub = this.control.valueChanges.subscribe((val: any) => {
        if (!this.updatingSelf) {
          this.formatValue(val);
        }
      });
    }
  }

  protected setControlValue(value: any) {
    this.updatingSelf = true;
    this.control.setValue(value);
    this.control.markAsDirty();
    this.control.markAsTouched();
    this.updatingSelf = false;
  }

  onNitInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let raw = inputElement.value;
    const prevValue = this.control?.value || '';

    while (raw.length > 0) {
      const first = raw.charAt(0);
      if (/\d/.test(first) || first.toUpperCase() === 'C') break;
      raw = raw.substring(1);
    }

    const isAddingToCF = prevValue === 'C/F' && raw.length > prevValue.length;
    if (isAddingToCF) {
      raw = 'C/F';
      inputElement.value = 'C/F';
    }

    const isDeleting = prevValue.length > raw.length;
    if (!isDeleting) {
      const upperRaw = raw.toUpperCase().trim();
      if (upperRaw === 'C' || upperRaw === 'CF' || upperRaw === 'C/') {
        raw = 'C/F';
        inputElement.value = 'C/F';
      }
    }

    const clean = sanitizeNitInput(raw);
    if (inputElement.value !== clean) {
      inputElement.value = clean;
    }

    this.setControlValue(clean);
  }

  onBlur() {
    if (this.control) {
      this.control.markAsTouched();
    }
  }

  private formatValue(val: string) {
    if (!val) return;
    const raw = String(val);
    const clean = sanitizeNitInput(raw);

    if (clean !== raw) {
      this.setControlValue(clean);
    }
  }
}
