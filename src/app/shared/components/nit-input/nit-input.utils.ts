import { AbstractControl, ValidationErrors } from '@angular/forms';

export function nitValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').trim().toUpperCase();
  if (!value) return null;
  if (value === 'C/F' || value === 'CF') return null;

  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length > 4) return null;

  return { invalidNit: true };
}

export function sanitizeNitInput(raw: string): string {
  let cleaned = raw;

  // Strip leading invalid characters
  while (cleaned.length > 0) {
    const first = cleaned.charAt(0);
    if (/\d/.test(first) || first.toUpperCase() === 'C') break;
    cleaned = cleaned.substring(1);
  }

  // If numbers exist, only allow digits, hyphens, K
  // If no numbers, allow C, F, K, slash, hyphen
  const hasDigits = /\d/.test(cleaned);
  if (hasDigits) {
    return cleaned.replace(/[^0-9k\-]/gi, '').toUpperCase();
  }
  return cleaned.replace(/[^cfk\/\-]/gi, '').toUpperCase();
}
