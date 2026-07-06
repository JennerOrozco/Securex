// =============================================================================
// EJEMPLO REAL — Archivo de configuración de columnas y formulario
// Fuente: src/app/features/access-login/user/user.config.ts
//
// Características demostradas:
// - Columna tipo 'user' con paths anidados y avatar
// - Columna tipo 'badge' con filterOptions + filterMulti + render con diccionario
// - Columna tipo 'role'
// - Campo tipo 'select-grid' con columnas extra (email)
// - Campo con dataPath (para pre-llenar desde objeto anidado al editar)
// - Campo disabled (campo bloqueado en edición)
// - Filtrado de opciones desde catálogos (branches filtradas por company_id)
// =============================================================================

import { TableColumn } from '@shared/table-shared/shared/table.types';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';

// ─── Columnas de la tabla ─────────────────────────────────────────────────────

export const USER_ACCESS_COLS: TableColumn[] = [

  // Tipo 'user': muestra avatar + nombre + subField (email)
  // El 'field' y 'subField' usan dot-notation → navegan el objeto automáticamente
  {
    field: 'user.full_name',
    header: 'Usuario',
    type: 'user',
    subField: 'user.email',                          // segunda línea debajo del nombre
    avatarField: 'user.profile_picture',             // URL del avatar
    sortable: true
  },

  // Tipo 'text' con render para fallback cuando el dato puede ser null
  { field: 'app.name',     header: 'Aplicación', type: 'text', sortable: true, render: (row) => row.app?.name     || 'N/A' },
  { field: 'company.name', header: 'Compañía',   type: 'text', sortable: true, render: (row) => row.company?.name || 'N/A' },
  { field: 'branch.name',  header: 'Sucursal',   type: 'text', sortable: true, render: (row) => row.branch?.name  || 'Todas (Global)' },

  // Tipo 'role': badge especial para roles
  { field: 'role.name', header: 'Rol', type: 'role', sortable: true },

  // Tipo 'badge' con:
  // - filterOptions: opciones del dropdown de filtro en el header de la columna
  // - filterMulti: permite seleccionar múltiples valores en el filtro
  // - render con diccionario: { key: label } — más legible que un switch/if
  {
    field: 'status',
    header: 'Estado',
    type: 'badge',
    sortable: true,
    filterOptions: [
      { label: 'Aprobado',  value: 'APPROVED'  },
      { label: 'Pendiente', value: 'PENDING'   },
      { label: 'Rechazado', value: 'REJECTED'  }
    ],
    filterOptionLabel: 'label',
    filterMulti: true,
    render: (row) => (
      { 'APPROVED': 'Aprobado', 'PENDING': 'Pendiente', 'REJECTED': 'Rechazado' }[row.status as string]
      || row.status
    )
  },

  // Siempre al final: columna de acciones (botones Editar / Eliminar)
  { field: 'acciones', header: 'Acciones', type: 'actions' }
];

// ─── Campos del formulario ────────────────────────────────────────────────────
// Función (no constante) cuando los campos dependen de catálogos dinámicos

export const createUserAccessForm = (catalogs: any, matchedCompany: any): FormField[] => {
  const companiesList  = catalogs['companies'] || [];
  const rawBranches    = catalogs['branches']  || [];
  const roles          = catalogs['roles']     || [];

  // Filtrar catálogos dependientes: branches de la empresa activa solamente
  const filteredBranches = matchedCompany
    ? rawBranches.filter((b: any) => b.company_id === matchedCompany.id)
    : rawBranches;

  return [
    // Tipo 'select-grid': dropdown con tabla de búsqueda interna.
    // Ideal para listas largas donde el usuario busca por texto.
    // 'columns' define columnas extra que se muestran en la tabla del dropdown.
    // 'dataPath' = ruta dot-notation para pre-llenar al editar ('user.uuid' → item.user.uuid)
    {
      name: 'user_uuid',
      label: 'Usuario',
      type: 'select-grid',
      required: true,
      icon: 'pi pi-user',
      placeholder: '- Seleccionar Usuario por nombre o correo -',
      dataPath: 'user.uuid',                         // pre-fill al modo 'edit'
      options: (catalogs['users'] || []).map((u: any) => ({
        label: u.full_name,
        value: u.uuid,
        email: u.email                               // campo extra para las columnas del grid
      })),
      columns: [                                     // columnas adicionales en el dropdown
        { field: 'email', header: 'Correo', width: '220px', icon: 'pi pi-envelope' }
      ]
    },

    // Campo disabled: visible pero no editable (la empresa se pre-llena automáticamente)
    {
      name: 'app_uuid',
      label: 'Aplicación',
      type: 'select',
      required: true,
      disabled: true,                                // bloqueado en el form
      icon: 'pi pi-th-large',
      dataPath: 'app.uuid',
      options: (catalogs['apps'] || []).map((a: any) => ({ label: a.name, value: a.uuid }))
    },

    {
      name: 'company_uuid',
      label: 'Compañía',
      type: 'select',
      required: true,
      disabled: true,
      icon: 'pi pi-building',
      dataPath: 'company.uuid',
      options: companiesList.map((c: any) => ({ label: c.name, value: c.uuid }))
    },

    // Campo opcional con opción nula al inicio de la lista
    {
      name: 'branch_uuid',
      label: 'Sucursal',
      type: 'select',
      required: false,
      icon: 'pi pi-map-marker',
      dataPath: 'branch.uuid',
      placeholder: '- Seleccionar Sucursal -',
      options: [
        { label: 'Todas (Sin Sucursal)', value: null },  // opción nula válida
        ...filteredBranches.map((b: any) => ({ label: b.name, value: b.uuid }))
      ]
    },

    {
      name: 'role_uuid',
      label: 'Rol',
      type: 'select',
      required: true,
      icon: 'pi pi-id-card',
      dataPath: 'role.uuid',
      placeholder: '- Seleccionar Rol -',
      options: roles.map((r: any) => ({ label: r.name, value: r.uuid }))
    },

    {
      name: 'status',
      label: 'Estado',
      type: 'select',
      required: true,
      icon: 'pi pi-check-circle',
      placeholder: '- Seleccionar Estado -',
      options: [
        { label: 'Pendiente', value: 'PENDING'  },
        { label: 'Aprobado',  value: 'APPROVED' },
        { label: 'Rechazado', value: 'REJECTED' }
      ]
    }
  ];
};
