import type { TableColumn } from '../table-shared/shared/table.types';
import type { FormField } from '../modals/modal-shell/modal-shell.types';

export interface CrudConfigFromAPI {
  route_path: string;
  resource_name: string;
  title: string;
  subtitle: string;
  add_label: string;
  permission: string;
  primary_key: string;
  default_sort: string;
  lazy_load: number;
  is_tree: number;
  show_add: number;
  show_edit: number;
  show_delete: number;
  delete_msg: string;
  graphql_domain: string;
  query_name: string;
  query_field: string;
  delete_q_name: string;
  delete_field: string;
  create_q_name: string;
  create_field: string;
  update_q_name: string;
  update_field: string;
  catalogs_json?: string;
  columns?: CrudColumnFromAPI[];
  form_fields?: CrudFormFieldFromAPI[];
}

export interface CrudColumnFromAPI {
  id: number;
  config_id: number;
  field: string;
  header: string;
  type: string;
  sub_field: string | null;
  avatar_fld: string | null;
  sortable: number;
  filterable: number;
  visible: number;
  width: string;
  text_align: string;
  render_func: string | null;
  sort_order: number;
}

export interface CrudFormFieldFromAPI {
  id: number;
  config_id: number;
  name: string;
  label: string;
  type: string;
  required: number;
  icon: string | null;
  placeholder: string | null;
  options: string | null;
  catalog_key: string | null;
  accept: string | null;
  sort_order: number;
}

export function mapToFormFields(apiFields: CrudFormFieldFromAPI[], catalogs?: Record<string, any[]>): FormField[] {
  return apiFields
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(f => ({
      name: f.name,
      label: f.label,
      type: f.type as FormField['type'],
      required: !!f.required,
      ...(f.icon ? { icon: f.icon } : {}),
      ...(f.placeholder ? { placeholder: f.placeholder } : {}),
      ...(f.catalog_key && Array.isArray(catalogs?.[f.catalog_key])
          ? { options: (catalogs![f.catalog_key] as any[]).map((item: any) => ({ label: item.name, value: item.uuid || item.id })) }
          : f.options ? { options: JSON.parse(f.options) } : {}),
      ...(f.accept ? { accept: f.accept } : {}),
    }));
}

export function mapToTableColumns(apiColumns: CrudColumnFromAPI[]): TableColumn[] {
  return apiColumns
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(col => {
      const renderFn = parseRenderFunc(col.render_func, col.field);
      const hasSubField = !!col.sub_field;
      const subFieldRenderFn = hasSubField 
        ? (row: any) => getNestedValue(row, col.sub_field!) ?? 'Sin correo' 
        : undefined;

      return {
        field: col.field,
        header: col.header,
        type: col.type as TableColumn['type'],
        sortable: !!col.sortable,
        filterable: !!col.filterable,
        visible: !!col.visible,
        style: { width: col.width ?? 'auto', textAlign: col.text_align ?? 'left' },
        ...(renderFn ? { render: renderFn } : {}),
        ...(col.sub_field ? { subField: col.sub_field } : {}),
        ...(col.avatar_fld ? { avatarField: col.avatar_fld } : {}),
        ...(subFieldRenderFn && col.type === 'user' ? { subFieldRender: subFieldRenderFn } : {}),
      };
    });
}

function parseRenderFunc(json: string | null, field: string): ((row: any) => any) | undefined {
  if (!json) return undefined;
  try {
    const cfg = JSON.parse(json);
    if (cfg.type === 'nested') {
      const path = cfg.path || field;
      const fallback = cfg.fallback ?? 'N/A';
      return (row: any) => getNestedValue(row, path) ?? fallback;
    }
    if (cfg.type === 'badge') {
      const path = cfg.path || field;
      const trueVal = cfg.trueValue || 'Activo';
      const falseVal = cfg.falseValue || 'Inactivo';
      const trueSev = cfg.trueSeverity || 'success';
      const falseSev = cfg.falseSeverity || 'danger';
      return (row: any) => {
        const val = getNestedValue(row, path);
        return val ? { value: trueVal, severity: trueSev } : { value: falseVal, severity: falseSev };
      };
    }
    if (cfg.type === 'truncate') {
      const path = cfg.path || field;
      const len = cfg.length || 12;
      const suffix = cfg.suffix || '...';
      const prefix = cfg.prefix || false;
      return (row: any) => {
        const val = getNestedValue(row, path);
        if (!val) return '—';
        const str = String(val);
        return prefix ? str.slice(0, len) + suffix : (str.length > len ? str.slice(-len) + suffix : str);
      };
    }
    if (cfg.type === 'count') {
      const path = cfg.path || field;
      const label = cfg.label || 'item';
      return (row: any) => {
        const val = getNestedValue(row, path);
        const count = Array.isArray(val) ? val.length : 0;
        return { value: `${count} ${label}${count !== 1 ? 's' : ''}`, severity: count > 0 ? 'info' : 'secondary' };
      };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}
