import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { AsYouType, CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

interface Country {
  name: string;
  cca2: string;
  prefix: string;
  flag: string;
}

const COUNTRIES_LIST: Country[] = [
  { name: 'Guatemala', cca2: 'GT', prefix: '+502', flag: 'https://flagsapi.com/GT/flat/64.png' },
  { name: 'El Salvador', cca2: 'SV', prefix: '+503', flag: 'https://flagsapi.com/SV/flat/64.png' },
  { name: 'Honduras', cca2: 'HN', prefix: '+504', flag: 'https://flagsapi.com/HN/flat/64.png' },
  { name: 'Nicaragua', cca2: 'NI', prefix: '+505', flag: 'https://flagsapi.com/NI/flat/64.png' },
  { name: 'Costa Rica', cca2: 'CR', prefix: '+506', flag: 'https://flagsapi.com/CR/flat/64.png' },
  { name: 'Panamá', cca2: 'PA', prefix: '+507', flag: 'https://flagsapi.com/PA/flat/64.png' },
  { name: 'México', cca2: 'MX', prefix: '+52', flag: 'https://flagsapi.com/MX/flat/64.png' },
  { name: 'Estados Unidos', cca2: 'US', prefix: '+1', flag: 'https://flagsapi.com/US/flat/64.png' },
  { name: 'España', cca2: 'ES', prefix: '+34', flag: 'https://flagsapi.com/ES/flat/64.png' },
  { name: 'Colombia', cca2: 'CO', prefix: '+57', flag: 'https://flagsapi.com/CO/flat/64.png' },
  { name: 'Venezuela', cca2: 'VE', prefix: '+58', flag: 'https://flagsapi.com/VE/flat/64.png' },
  { name: 'Ecuador', cca2: 'EC', prefix: '+593', flag: 'https://flagsapi.com/EC/flat/64.png' },
  { name: 'Perú', cca2: 'PE', prefix: '+51', flag: 'https://flagsapi.com/PE/flat/64.png' },
  { name: 'Bolivia', cca2: 'BO', prefix: '+591', flag: 'https://flagsapi.com/BO/flat/64.png' },
  { name: 'Chile', cca2: 'CL', prefix: '+56', flag: 'https://flagsapi.com/CL/flat/64.png' },
  { name: 'Argentina', cca2: 'AR', prefix: '+54', flag: 'https://flagsapi.com/AR/flat/64.png' },
  { name: 'Uruguay', cca2: 'UY', prefix: '+598', flag: 'https://flagsapi.com/UY/flat/64.png' },
  { name: 'Paraguay', cca2: 'PY', prefix: '+595', flag: 'https://flagsapi.com/PY/flat/64.png' },
  { name: 'Brasil', cca2: 'BR', prefix: '+55', flag: 'https://flagsapi.com/BR/flat/64.png' },
  { name: 'República Dominicana', cca2: 'DO', prefix: '+1', flag: 'https://flagsapi.com/DO/flat/64.png' },
  { name: 'Puerto Rico', cca2: 'PR', prefix: '+1', flag: 'https://flagsapi.com/PR/flat/64.png' }
];

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, InputTextModule],
  templateUrl: './phone-input.component.html',

})
export class PhoneInputComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id: string = 'phone-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string = 'Teléfono';
  @Input() placeholder: string = '1234 5678';
  @Input() icon: string = '';
  @Input() required: boolean = false;
  @Input() control!: any;
  @Input() disabled: boolean = false;

  countries: Country[] = COUNTRIES_LIST;
  selectedCountryCode = 'GT';
  localNumber = '';
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
      this.parseValue(this.control.value);
      this.validateNumber();
      this.sub = this.control.valueChanges.subscribe((val: any) => {
        if (!this.updatingSelf) {
          this.parseValue(val);
          this.validateNumber();
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

  getCountryByCode(code: string): Country {
    return this.countries.find(c => c.cca2 === code) || this.countries[0];
  }

  sanitizePhoneInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const raw = inputElement.value ?? '';
    const digits = raw.replace(/\D/g, '');

    const prevDigits = this.localNumber.replace(/\D/g, '');
    const prevPhoneNumber = parsePhoneNumberFromString(prevDigits, this.selectedCountryCode as CountryCode);
    const wasValid = prevPhoneNumber ? prevPhoneNumber.isValid() : false;

    const isAddingDigits = digits.length > prevDigits.length;
    if (wasValid && isAddingDigits) {
      inputElement.value = this.localNumber;
      return;
    }

    const asYouType = new AsYouType(this.selectedCountryCode as CountryCode);
    const formatted = asYouType.input(digits);

    this.localNumber = formatted;
    inputElement.value = formatted;

    this.emitValue();
  }

  emitValue() {
    if (!this.control) return;

    const cleanDigits = this.localNumber.replace(/\D/g, '');
    const country = this.getCountryByCode(this.selectedCountryCode);
    const fullValue = cleanDigits ? `${country.prefix} ${cleanDigits}` : '';

    this.setControlValue(fullValue);
    this.validateNumber();
  }

  onCountryChange() {
    const digits = this.localNumber.replace(/\D/g, '');
    const asYouType = new AsYouType(this.selectedCountryCode as CountryCode);
    this.localNumber = asYouType.input(digits);
    this.emitValue();
  }

  onBlur() {
    if (this.control) {
      this.control.markAsTouched();
      this.validateNumber();
    }
  }

  parseValue(value: any) {
    if (!value) {
      this.selectedCountryCode = 'GT';
      this.localNumber = '';
      return;
    }

    try {
      const str = String(value).trim();
      let detectedCountry = this.countries[0];
      let localDigits = str;

      const sortedCountries = [...this.countries].sort((a, b) => b.prefix.length - a.prefix.length);
      for (const c of sortedCountries) {
        if (str.startsWith(c.prefix)) {
          detectedCountry = c;
          localDigits = str.substring(c.prefix.length).trim();
          break;
        }
      }

      this.selectedCountryCode = detectedCountry.cca2;
      const digits = localDigits.replace(/\D/g, '');
      if (!digits) {
        this.localNumber = localDigits;
        return;
      }
      const asYouType = new AsYouType(detectedCountry.cca2 as CountryCode);
      this.localNumber = asYouType.input(digits);
    } catch {
      this.localNumber = String(value).trim();
      this.selectedCountryCode = 'GT';
    }
  }

  validateNumber() {
    if (!this.control) return;

    const rawVal = this.localNumber.replace(/\D/g, '');
    if (!rawVal) {
      if (this.required) {
        this.control.setErrors({ required: true });
      } else {
        this.clearErrors(['required', 'invalidPhone']);
      }
      return;
    }

    try {
      const country = this.getCountryByCode(this.selectedCountryCode);
      const cleanDigits = this.localNumber.replace(/\D/g, '');
      const phoneNumber = parsePhoneNumberFromString(cleanDigits, country.cca2 as CountryCode);
      const isValid = phoneNumber ? phoneNumber.isValid() : false;

      if (!isValid) {
        this.control.setErrors({ ...this.control.errors, invalidPhone: true });
      } else {
        this.clearErrors(['invalidPhone', 'required']);
      }
    } catch {
      this.control.setErrors({ ...this.control.errors, invalidPhone: true });
    }
  }

  private clearErrors(keys: string[]) {
    const currentErrors = this.control.errors;
    if (currentErrors) {
      const copy = { ...currentErrors };
      keys.forEach(k => delete copy[k]);
      const remaining = Object.keys(copy).length > 0 ? copy : null;
      this.control.setErrors(remaining);
    } else {
      this.control.setErrors(null);
    }
  }
}
