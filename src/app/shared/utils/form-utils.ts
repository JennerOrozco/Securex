import { AbstractControl } from '@angular/forms';

/**
 * @function isFieldPristine
 * @description Determina si un control de formulario específico no ha sido modificado por el usuario.
 * Es útil para aplicar estilos condicionales que solo se activan tras la interacción del usuario.
 * @param {AbstractControl} form - El formulario padre que contiene el control.
 * @param {string} name - El nombre del control a verificar.
 * @returns {boolean | undefined} `true` si el control no ha sido tocado, `undefined` si no existe.
 */
export function isFieldPristine(form: AbstractControl, name: string): boolean | undefined {
  return form.get(name)?.pristine;
}

/**
 * @function isFieldValid
 * @description Determina si un control de formulario es válido y ha sido interactuado por el usuario (touched).
 * Esta combinación asegura que el usuario haya intentado usar el campo y que su valor cumpla con las validaciones.
 * @param {AbstractControl} form - El formulario padre que contiene el control.
 * @param {string} name - El nombre del control a verificar.
 * @returns {boolean | undefined} `true` si el control es válido y está tocado, `false` si no, `undefined` si no existe.
 */
export function isFieldValid(form: AbstractControl, name: string): boolean | undefined {
  return form.get(name)?.valid && form.get(name)?.touched;
}

/**
 * @function showError
 * @description Determina si un control de formulario debe mostrar un mensaje de error.
 * Se considera que debe mostrar error si el control es inválido y ha sido tocado por el usuario.
 * @param {AbstractControl} form - El formulario padre que contiene el control.
 * @param {string} name - El nombre del control a verificar.
 * @returns {boolean | undefined} `true` si el control es inválido y está tocado, `false` si no, `undefined` si no existe.
 */
export function showError(form: AbstractControl, name: string): boolean | undefined {
  return form.get(name)?.invalid && form.get(name)?.touched;
}

/**
 * @function normalizeBoolean
 * @description Convierte valores ambiguos (cadenas, números) a un booleano estándar `true`.
 * Útil para procesar datos de entrada que pueden venir en distintos formatos pero que representan un estado activo o afirmativo.
 * @param {any} val - El valor a normalizar.
 * @returns {boolean} `true` si el valor es 1, '1', 'true' o `true`; de lo contrario, `false`.
 */
export function normalizeBoolean(val: any): boolean {
  return val === 1 || val === true || val === '1' || val === 'true';
}

/**
 * @function denormalizeBoolean
 * @description Convierte un valor booleano o similar a un valor binario (0 o 1).
 * Esencial para enviar datos a APIs que esperan enteros (`integer`) en lugar de booleanos (`boolean`).
 * @param {any} val - El valor a convertir.
 * @returns {0 | 1} `1` si el valor es verdadero, `0` si es falso o equivalente.
 */
export function denormalizeBoolean(val: any): 0 | 1 {
  return val === true || val === 'true' || val === 1 || val === '1' ? 1 : 0;
}

/**
 * @function objectToFormData
 * @description Convierte un objeto genérico en un FormData automáticamente. Ideal para formularios que incluyen archivos (Files).
 * @param {any} data Objeto con datos del formulario
 * @param {string | string[]} fileKey Llave (propiedad) que contiene el archivo.
 * @returns {FormData | any} FormData si contiene archivos, de lo contrario devuelve una copia del objeto original.
 */
export function objectToFormData(data: any, fileKey?: string | string[]): FormData | any {
  let hasFile = false;
  
  if (fileKey) {
    const keys = Array.isArray(fileKey) ? fileKey : [fileKey];
    hasFile = keys.some(key => data[key] instanceof File);
  }

  if (!hasFile) {
    return { ...data };
  }

  const payload = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    if (value instanceof File) {
      payload.append(key, value, value.name);
    } else {
      payload.append(key, String(value));
    }
  });

  return payload;
}

// ----- Form Builder Utility (shared with FormModalComponent) -----

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import type { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export function buildFormGroup(fb: FormBuilder, fields: FormField[], source: Record<string, any> = {}): FormGroup {
  const group: Record<string, any> = {};

  fields.forEach(field => {
    const value = source[field.name] ?? '';
    const validators: any[] = [];
    if (field.required) validators.push(Validators.required);
    if (field.type === 'email') validators.push(Validators.email);
    group[field.name] = [{ value, disabled: !!field.disabled }, validators];
  });

  return fb.group(group);
}
