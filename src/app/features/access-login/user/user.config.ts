import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export const USER_ACCESS_COLS: TableColumn[] = [
  { field: 'user.full_name', header: 'Usuario', type: 'user', subField: 'user.email', avatarField: 'user.profile_picture', sortable: true },
  { field: 'app.name', header: 'Aplicación', type: 'text', sortable: true, render: (row) => row.app?.name || 'N/A' },
  { field: 'company.name', header: 'Compañía', type: 'text', sortable: true, render: (row) => row.company?.name || 'N/A' },
  { field: 'branch.name', header: 'Sucursal', type: 'text', sortable: true, render: (row) => row.branch?.name || 'Todas (Global)' },
  { field: 'role.name', header: 'Rol', type: 'role', sortable: true },
  {
    field: 'status', header: 'Estado', type: 'badge', sortable: true,
    filterOptions: [
      { label: 'Aprobado', value: 'APPROVED' }, { label: 'Pendiente', value: 'PENDING' }, { label: 'Rechazado', value: 'REJECTED' }
    ], filterOptionLabel: 'label',
    render: (row) => row.status === 'APPROVED' ? 'Aprobado' : row.status === 'PENDING' ? 'Pendiente' : row.status === 'REJECTED' ? 'Rechazado' : row.status
  },
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

export const createUserAccessForm = (catalogs: any, matchedCompany: any): FormField[] => {
  const companiesList = catalogs['companies'] || [];
  const rawBranches = catalogs['branches'] || [];
  const filteredBranches = matchedCompany
    ? rawBranches.filter((b: any) => b.company_id === matchedCompany.id)
    : rawBranches;

  const roles = catalogs['roles'] || [];

  return [
    {
      name: 'user_uuid', label: 'Usuario', type: 'select-grid', required: true, 
      options: (catalogs['users'] || []).map((u: any) => ({ label: u.full_name, value: u.uuid, email: u.email })), 
      dataPath: 'user.uuid', icon: 'pi pi-user', placeholder: '- Seleccionar Usuario por nombre o correo -',
      columns: [{ field: 'email', header: 'Correo', width: '220px', icon: 'pi pi-envelope' }]
    },
    { name: 'app_uuid', label: 'Aplicación', type: 'select', required: true, options: (catalogs['apps'] || []).map((a: any) => ({ label: a.name, value: a.uuid })), disabled: true, icon: 'pi pi-th-large', dataPath: 'app.uuid' },
    { name: 'company_uuid', label: 'Compañía', type: 'select', required: true, options: companiesList.map((c: any) => ({ label: c.name, value: c.uuid })), disabled: true, icon: 'pi pi-building', dataPath: 'company.uuid' },
    { name: 'branch_uuid', label: 'Sucursal', type: 'select', required: false, options: [{ label: 'Todas (Sin Sucursal)', value: null }, ...filteredBranches.map((b: any) => ({ label: b.name, value: b.uuid }))], icon: 'pi pi-map-marker', dataPath: 'branch.uuid', placeholder: '- Seleccionar Sucursal -' },
    { name: 'role_uuid', label: 'Rol', type: 'select', required: true, options: roles.map((r: any) => ({ label: r.name, value: r.uuid })), icon: 'pi pi-id-card', dataPath: 'role.uuid', placeholder: '- Seleccionar Rol -' },
    {
      name: 'status', label: 'Estado', type: 'select', required: true, options: [
        { label: 'Pendiente', value: 'PENDING' }, { label: 'Aprobado', value: 'APPROVED' }, { label: 'Rechazado', value: 'REJECTED' }
      ], icon: 'pi pi-check-circle', placeholder: '- Seleccionar Estado -'
    }
  ];
};
