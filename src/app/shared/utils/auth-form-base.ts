import { Directive, input, output } from '@angular/core';

/**
 * @class AuthFormBase
 * @description Directiva abstracta que centraliza la lógica común y el estado compartido para formularios de autenticación (Login y Registro).
 * Facilita la reutilización de código, el manejo de errores y la gestión de estados de carga entre componentes hijos.
 */
@Directive()
export abstract class AuthFormBase {
  /** Estado que indica si el formulario se encuentra en estado de carga (ej. procesando envío). */
  loading = input(false);
  /** Emite el valor del formulario cuando se intenta enviar. */
  onSubmit = output<any>();
  onToggleMode = output<string>();

  toggleMode(mode: string): void {
    this.onToggleMode.emit(mode);
  }
}
