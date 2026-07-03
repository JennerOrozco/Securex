import { Injectable } from '@angular/core';

/**
 * Define los tipos de transformación estándar soportados.
 */
type CastType =
  | 'number'
  | 'boolean-to-int'
  | 'int-to-boolean'
  | 'json-stringify'
  | 'json-parse';

export interface MappingConfig {
  mode: 'add' | 'edit';
  identityKey?: string;
  identityValue?: any;
  extraAddFields?: Record<string, any>;
  defaults?: Record<string, any>;
  casts?: Record<string, CastType | ((val: any) => any)>;
  alias?: Record<string, string>;
  /** Permite extraer valores de rutas profundas anidadas en el payload final plano */
  extractPaths?: Record<string, string[]>;
  /** Si se define, solo se incluirán las llaves crudas presentes en este arreglo. */
  pick?: string[];
  /** Si se define, se excluirán las llaves crudas presentes en este arreglo. */
  omit?: string[];
}

@Injectable({ providedIn: 'root' })
export class FormMapperService {

  /**
   * Diccionario de transformaciones estándar reutilizables.
   */
  private readonly transformations: Record<string, (v: any) => any> = {
    'number': (v) => (v !== null && v !== '' ? (Number(v) || 0) : 0),
    'boolean-to-int': (v) => (v ? 1 : 0),
    'int-to-boolean': (v) => Number(v) === 1,
    'json-stringify': (v) => (v ? (typeof v === 'string' ? v : JSON.stringify(v)) : null),
    'json-parse': (v) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; } }
  };

  /**
   * Mapea, limpia y transforma datos del formulario.
   */
  mapPayload(rawFormValue: Record<string, any>, config: MappingConfig): Record<string, any> {
    const {
      mode,
      identityKey = 'uuid',
      identityValue,
      extraAddFields = {},
      defaults = {},
      casts = {},
      alias = {},
      extractPaths = {},
      pick,
      omit
    } = config;

    // 1. Inicialización: Define el objeto base según el modo (add/edit)
    const initialPayload: Record<string, any> = mode === 'edit' && identityValue != null
      ? { [identityKey]: identityValue }
      : { ...extraAddFields };

    // 2. Extracción profunda de campos configurados en extractPaths
    const resolvedPayload = { ...initialPayload };
    for (const targetKey of Object.keys(extractPaths)) {
      const paths = extractPaths[targetKey];
      const extracted = this.extractValue(rawFormValue, paths);
      if (extracted !== null) {
        resolvedPayload[targetKey] = extracted;
      }
    }

    // 3. Procesamiento funcional: Itera sobre los campos del formulario plano
    const keysToMap = Object.keys(rawFormValue || {}).filter(key => {
      if (pick && !pick.includes(key)) return false;
      if (omit && omit.includes(key)) return false;
      return true;
    });

    return keysToMap.reduce((acc, key) => {
      let val = rawFormValue[key];

      // Sanitización: Limpieza básica de strings
      if (typeof val === 'string') val = val.trim();

      // Defaults: Aplica valores predeterminados si el campo es "falsy"
      if (val === '' || val === null || val === undefined) {
        val = defaults[key] !== undefined ? defaults[key] : null;
      }

      // Casteos: Aplica transformaciones si están definidas
      if (casts[key]) {
        const transform = typeof casts[key] === 'function'
          ? casts[key]
          : this.transformations[casts[key] as CastType];

        if (transform) val = transform(val);
      }

      // Alias: Determina el nombre del campo final (si tiene alias, lo usa)
      const finalKey = alias[key] || key;

      // Asignación final si no fue procesado por un extractPath
      if (!acc.hasOwnProperty(finalKey)) {
        acc[finalKey] = val;
      }
      return acc;
    }, resolvedPayload);
  }

  /**
   * Extrae el primer valor no nulo ni vacío evaluando múltiples rutas o llaves.
   * Soporta notación de corchetes access[0].role y puntos access.0.role.
   */
  extractValue(source: any, paths: string[]): any {
    if (!source) return null;
    for (const path of paths) {
      // Normaliza 'access[0].role' a 'access.0.role'
      const normalized = path.replace(/\[(\d+)\]/g, '.$1');
      const val = normalized.split('.').reduce((acc, part) => {
        if (acc == null) return undefined;
        if (Array.isArray(acc) && !isNaN(Number(part))) {
          return acc[Number(part)];
        }
        return acc[part];
      }, source);

      if (val !== undefined && val !== null && val !== '') return val;
    }
    return null;
  }

  /**
   * Valida la existencia de un valor. Si no existe, notifica al usuario.
   * @returns boolean indicando si la validación fue exitosa.
   */
  validateOrNotify(value: any, errorMessage: string, notificationService: any): boolean {
    if (!value) {
      notificationService?.notify?.('warn', errorMessage);
      return false;
    }
    return true;
  }
}