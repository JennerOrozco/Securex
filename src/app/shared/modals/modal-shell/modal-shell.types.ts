export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'select-grid' | 'date' | 'textarea' | 'email' | 'file' | 'password' | 'phone' | 'nit' | 'addresses';
  options?: { label: string; value: any }[];
  columns?: { field: string; header: string; width?: string; icon?: string }[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  icon?: string;
  accept?: string;
  fallbackIcon?: string;
  /**
   * Optional dot-notation path to read/write the value from a nested object
   * (e.g. `'user.uuid'` reads from `data.user.uuid`).
   * The `name` property remains the flat FormControl key.
   */
  dataPath?: string;
}

export type ModalMode = 'add' | 'edit' | 'delete' | 'view';
