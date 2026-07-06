export interface CatalogConfig {
  key: string;
  labelKey?: string;
  valueKey?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'select' | 'select-grid' | 'date' | 'textarea' | 'email' | 'file' | 'password' | 'phone' | 'nit' | 'addresses' | 'color' | 'avatar';
  currencyCode?: string;
  locale?: string;
  options?: any[];
  columns?: { field: string; header: string; width?: string; icon?: string }[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  icon?: string;
  accept?: string;
  allowAdd?: boolean;
  fallbackIcon?: string;
  /**
   * Optional dot-notation path to read/write the value from a nested object
   * (e.g. `'user.uuid'` reads from `data.user.uuid`).
   * The `name` property remains the flat FormControl key.
   */
  dataPath?: string;
  /**
   * Optional Tailwind classes to control the column span of the field in a grid layout.
   */
  colSpan?: string;
  /**
   * Optional valor por defecto para el campo al inicializar el formulario.
   * Usado por initFormFromFields() en la clase base. Si no se define, se usa ''.
   */
  defaultValue?: any;
  /**
   * Vinculación declarativa automática con catálogos en BaseCatalogComponent.
   */
  catalogConfig?: CatalogConfig;
  panelStyleClass?: string;
}

export type ModalMode = 'add' | 'edit' | 'delete' | 'view';
