import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const ADMIN_USERS_FORM_FIELDS: FormField[] = [
  { name: 'full_name', label: 'Nombre completo', type: 'text', required: true, icon: 'pi pi-user' },
  { name: 'email', label: 'Correo electrónico', type: 'email', required: true, icon: 'pi pi-envelope' },
  { name: 'is_super_admin', label: '¿Es Super Admin?', type: 'select', required: true, icon: 'pi pi-shield',
    options: [{ label: 'No', value: false }, { label: 'Sí', value: true }] },
  { name: 'auth_provider', label: 'Proveedor de Autenticación', type: 'select', required: true, icon: 'pi pi-key',
    options: [
      { label: 'Local', value: 'Local' }, { label: 'Google', value: 'Google' },
      { label: 'Microsoft', value: 'Microsoft' }, { label: 'GitHub', value: 'GitHub' }
    ] }
];

export const ADMIN_USERS_COLS: TableColumn[] = [
  { field: 'full_name', header: 'Nombre', type: 'user', subField: 'email', avatarField: 'profile_picture', sortable: true },
  { field: 'is_super_admin', header: 'Super Admin', type: 'boolean', sortable: true, style: { textAlign: 'center' } },
  { field: 'auth_provider', header: 'Auth Provider', type: 'badge', sortable: true, style: { textAlign: 'center' } },
  { field: 'created_at', header: 'Creado', type: 'date', sortable: true },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];
