import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TableColumn } from '@shared/table-shared/shared/table.types';

export interface SystemPermission {
  uuid: string;
  name: string;
  slug: string;
  type: string;
  route?: string;
  icon?: string;
  sort_order?: number;
  is_visible?: boolean;
  parent_id?: number;
}

export const PERMISSION_FORM_FIELDS: FormField[] = [
  { name: 'name', label: 'Nombre Visible del Permiso', type: 'text', required: true, icon: 'pi pi-eye', placeholder: 'Ej. Usuarios, Crear Factura' },
  { name: 'slug', label: 'Slug / Identificador', type: 'text', required: true, icon: 'pi pi-code', placeholder: 'modulo.action.nombre' },
  {
    name: 'type',
    label: 'Categoría',
    type: 'select',
    required: true,
    options: [
      { label: 'MENÚ (Acceso Sidebar)', value: 'MENU' },
      { label: 'SUBMENÚ (Interior)', value: 'SUBMENU' },
      { label: 'ACCIÓN (Operativo)', value: 'ACTION' },
      { label: 'COMPONENTE (Visual)', value: 'COMPONENT' }
    ]
  },
  { name: 'route', label: 'Ruta de Aplicación', type: 'text', icon: 'pi pi-link', placeholder: '/app/modulo/ruta' },
  { name: 'icon', label: 'Clase del Icono', type: 'text', icon: 'pi pi-image', placeholder: 'pi pi-tag o fas fa-user' },
  { name: 'sort_order', label: 'Orden de Visualización', type: 'number', icon: 'pi pi-sort-numeric-down', placeholder: '0' },
  {
    name: 'is_visible',
    label: 'Estado de Visibilidad',
    type: 'select',
    options: [
      { label: 'Público en Menú', value: 1 },
      { label: 'Oculto / Privado', value: 0 }
    ]
  }
];

export const PERMISSION_TABLE_COLUMNS: TableColumn[] = [
  { field: 'name', header: 'Nombre', type: 'tree', sortable: true, style: { width: '35%' } },
  { field: 'type', header: 'Tipo', type: 'badge', sortable: true, style: { width: '10%' } },
  { field: 'icon', header: 'Ícono', type: 'text', style: { width: '10%' } },
  { field: 'route', header: 'Ruta', type: 'text', style: { width: '15%' } },
  { field: 'sort_order', header: 'Orden', type: 'badge', sortable: true, style: { width: '8%' } },
  { field: 'is_visible', header: 'Visible', type: 'boolean', style: { width: '10%' } },
  { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
];
