import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { TableColumn } from '@shared/table-shared/shared/table.types';

export const ADMIN_ACCESS_COLS: TableColumn[] = [
  { field: 'name',   header: 'Acceso',    type: 'tree',    sortable: true, style: { width: '45%' } },
  { field: 'role',   header: 'Rol',       type: 'text',    sortable: true, style: { width: '25%' } },
  { field: 'status', header: 'Estado',    type: 'badge',   sortable: true, style: { width: '15%' } },
  { field: 'acciones', header: 'Acciones', type: 'actions', style: { width: '15%', textAlign: 'center' } }
];

export const createAdminAccessForm = (catalogs: any, currentCompanyId?: number): FormField[] => {
  const apps = catalogs.apps || [];
  const companies = catalogs.companies || [];
  const allBranches = catalogs.branches || [];
  const users = catalogs.users || [];
  const roles = catalogs.roles || [];

  const companyBranches = allBranches.filter((b: any) => b.company_id === currentCompanyId);

  return [
    { 
      name: 'user_id',    
      label: 'Usuario',     
      type: 'select-grid', 
      required: true,  
      options: users.map((u: any) => ({ label: u.full_name, value: u.id, email: u.email })), 
      columns: [{ field: 'email', header: 'Correo', width: '220px' }],
      icon: 'pi pi-user', 
      placeholder: 'Buscar usuario por nombre o correo...' 
    },
    { 
      name: 'app_id',     
      label: 'Aplicación',  
      type: 'select', 
      required: true,  
      options: apps.map((a: any) => ({ label: a.name, value: a.id })), 
      disabled: true 
    },
    { 
      name: 'company_id', 
      label: 'Compañía',    
      type: 'select', 
      required: true,  
      options: companies.map((c: any) => ({ label: c.name, value: c.id })), 
      disabled: true 
    },
    { 
      name: 'branch_id',  
      label: 'Sucursal',    
      type: 'select', 
      options: [
        { label: 'Todas las sucursales', value: null },
        ...companyBranches.map((b: any) => ({ label: b.name, value: b.id }))
      ], 
      disabled: false 
    },
    { 
      name: 'role_id',    
      label: 'Rol',         
      type: 'select', 
      required: true,  
      options: roles.map((r: any) => ({ label: r.name, value: r.id })) 
    },
    { 
      name: 'status',     
      label: 'Estado',      
      type: 'select', 
      required: true,
      options: [
        { label: 'Pendiente',  value: 'PENDING' },
        { label: 'Aprobado',   value: 'APPROVED' },
        { label: 'Rechazado',  value: 'REJECTED' }
      ]
    }
  ];
};
