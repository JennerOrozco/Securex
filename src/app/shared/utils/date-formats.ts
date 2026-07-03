/**
 * @const DATETIME_FMT
 * @description Formato estándar de fecha y hora utilizado en la aplicación.
 * Se usa con el pipe `| date` de Angular.
 * @see https://angular.io/api/common/DatePipe
 * @example
 * {{ timestamp | date: DATETIME_FMT }}  →  '23/05/2024 14:30'
 */
export const DATETIME_FMT = 'dd/MM/yyyy HH:mm';

/**
 * @const DATE_FMT
 * @description Formato estándar de solo fecha (día, mes y año).
 * Es el formato preferido para listados tabulares y campos sin hora.
 * @see https://angular.io/api/common/DatePipe
 * @example
 * {{ timestamp | date: DATE_FMT }}  →  '23/05/2024'
 */
export const DATE_FMT = 'dd/MM/yyyy';

/**
 * @const DATE_LONG_FMT
 * @description Formato de fecha extenso y humanizado (español guatemalteco).
 * Incluye el día de la semana, el nombre del mes y el año.
 * @see https://angular.io/api/common/DatePipe
 * @example
 * {{ timestamp | date: DATE_LONG_FMT }}  →  'jueves, 23 de mayo de 2024'
 */
export const DATE_LONG_FMT = 'EEEE, dd \'de\' MMMM, yyyy';
