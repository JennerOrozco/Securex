export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'user' | 'role' | 'status' | 'badge' | 'boolean' | 'date' | 'currency' | 'actions' | 'toggle' | 'filesize' | 'validation' | 'image';
  subField?: string;
  sortable?: boolean;
  toggleTrueLabel?: string;
  toggleFalseLabel?: string;
  toggleEmitType?: string;
  style?: any;
  filterOptions?: any[];
  filterOptionLabel?: string;
  filterOptionValue?: string;
  filterMulti?: boolean;
}