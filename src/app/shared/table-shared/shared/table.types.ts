export interface TableActionsConfig {
  addChild?: boolean;
  create?: boolean;
  createLabel?: string;
  createIcon?: string;
  select?: boolean;
  view?: boolean;
  edit?: boolean;
  pdf?: boolean;
  send?: boolean;
  duplicate?: boolean;
  permissions?: boolean;
  activate?: boolean;
  delete?: boolean;
  reset?: boolean;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'user' | 'role' | 'status' | 'badge' | 'boolean' | 'date' | 'currency' | 'actions' | 'toggle' | 'filesize' | 'validation' | 'image' | 'tree' | 'link' | 'icon';
  subField?: string;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  toggleTrueLabel?: string;
  toggleFalseLabel?: string;
  toggleEmitType?: string;
  style?: any;
  filterOptions?: any[];
  filterOptionLabel?: string;
  filterOptionValue?: string;
  filterMulti?: boolean;
  fallbackIcon?: string;
  hideAvatar?: boolean;
  render?: string | ((rowData: any) => any);
  subFieldRender?: string | ((rowData: any) => any);
  avatarField?: string;
  avatarRender?: string | ((rowData: any) => any);
  cellStyle?: (rowData: any) => Record<string, string> | undefined;
  copyable?: boolean;
  frozen?: boolean;
}
