export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'email' | 'file';
  options?: { label: string; value: any }[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
  icon?: string;
  accept?: string;
}

export type ModalMode = 'add' | 'edit' | 'delete' | 'view';
