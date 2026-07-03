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
