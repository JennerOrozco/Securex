export const SECUREX_QUERIES = {
  ME: `
    query Me {
        me {            
            uuid
            full_name
            email
            status
            auth_provider
            profile_picture
            created_at
            access {
                company {
                    name
                }
                branch {
                    name
                }
            }
            webauthnCredentials {
                id
                credential_id
                device_name
                created_at
            }
        }
    }
  `,
  USERS: `
    query Users($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput, $all: Boolean) {
      users(page: $page, limit: $limit, filter: $filter, sort: $sort, all: $all) {
        data {
          uuid full_name email status is_super_admin auth_provider created_at profile_picture
          access { uuid status branch_id branch { uuid name } role { id uuid name slug } }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  USER: `
    query User($uuid: String!) {
      user(uuid: $uuid) {
        uuid full_name email status is_super_admin auth_provider
        access { uuid status role { uuid name slug permissions { uuid name slug } } }
      }
    }
  `,
  ROLES: `
    query Roles($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput, $companyUuid: String) {
      roles(page: $page, limit: $limit, filter: $filter, sort: $sort, company_uuid: $companyUuid) {
        data {
          id uuid name slug description is_active company_uuid
          company {
            name
          }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  ROLE: `
    query Role($uuid: String!) {
      role(uuid: $uuid) {
        id uuid name slug description is_active
        permissions { id uuid name slug route type icon sort_order is_visible children { id uuid name slug } }
      }
    }
  `,
  ROLE_PERMISSIONS: `
    query RolePermissions($uuid: String!) {
      rolePermissions(uuid: $uuid) {
        id uuid name slug route type icon sort_order is_visible assigned
        children { id uuid name slug route type icon sort_order is_visible assigned
          children { id uuid name slug route type icon sort_order is_visible assigned
            children { id uuid name slug route type icon sort_order is_visible assigned }
          }
        }
      }
    }
  `,
  COMPONENTS: `
    query Components {
      components {
        id uuid name slug route type icon sort_order
      }
    }
  `,
  PERMISSIONS: `
    query Permissions {
      permissions {
        id uuid parent_id name slug route type icon sort_order is_visible
        children { id uuid parent_id name slug route type icon sort_order is_visible
          children { id uuid parent_id name slug route type icon sort_order is_visible 
           children { id uuid parent_id name slug route type icon sort_order is_visible }
          }
        }
      }
    }
  `,
  COMPANIES: `
    query Companies($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      companies(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid app_id tax_id name logo_url is_active
          branches { id uuid name address phone is_active }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  COMPANIES_PAGE: `
    query CompaniesPage($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      apps(page: 1, limit: 100) {
        data {
          id name
        }
      }
      companies(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid app_id tax_id name logo_url is_active
          branches { id uuid name address phone is_active }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  COMPANY: `
    query Company($uuid: String!) {
      company(uuid: $uuid) {
        id uuid tax_id name logo_url is_active
        branches { id uuid name address phone is_active }
      }
    }
  `,
  BRANCHES: `
    query Branches($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      branches(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid company_id name address phone is_active
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  BRANCHES_PAGE: `
    query BranchesPage($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      companies(page: 1, limit: 100) {
        data {
          id name
        }
      }
      branches(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid company_id name address phone is_active
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  APPS: `
    query Apps($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      apps(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id uuid name slug api_key api_secret google_client_id google_client_secret is_active
          companies { id uuid tax_id name is_active branches { id uuid name } }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  USER_ACCESSES: `
    query UserAccesses($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput, $all: Boolean) {
      userAccesses(page: $page, limit: $limit, filter: $filter, sort: $sort, all: $all) {
        data {
          uuid status user_id app_id company_id branch_id role_id
          user { uuid full_name email profile_picture }
          app { uuid name }
          company { uuid name }
          branch { uuid name }
          role { uuid name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  SECURITY_AUDIT_LOGS: `
    query SecurityAuditLogs($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      securityAuditLogs(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          uuid user_uuid user_name event_type description ip_address company_uuid
          user { uuid full_name email profile_picture }
          app { name }
          company { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  LOGIN_ATTEMPTS: `
    query LoginAttempts($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      loginAttempts(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id email app_uuid ip_address user_agent successful created_at
          app { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  USER_WEBAUTHN_CREDENTIALS: `
    query UserWebauthnCredentials($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      userWebauthnCredentials(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id
          user_uuid
          user_name
          email
          app_name
          credential_id
          device_name
          sign_count
          created_at
          updated_at
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  PASSWORD_RESETS: `
    query PasswordResets($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      passwordResets(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id email app_uuid token created_at
          app { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  REFRESH_TOKENS: `
    query RefreshTokens($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      refreshTokens(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data {
          id user_id app_id token_hash is_revoked issued_at revoked_at expires_at ip_address user_agent
          user { uuid full_name email profile_picture }
          app { name }
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  ADMIN_USERS: `
    query AdminUsers($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput, $company_uuid: String, $app_uuid: String) {
      adminUsers(page: $page, limit: $limit, filter: $filter, sort: $sort, company_uuid: $company_uuid, app_uuid: $app_uuid) {
        data {
          id uuid full_name email status is_super_admin auth_provider created_at
        }
        total
        currentPage
        perPage
        hasMorePages
      }
    }
  `,
  ROLES_BY_COMPANY: `
    query RolesByCompany($appId: Int!, $companyUuid: String) {
      rolesByCompany(app_id: $appId, company_uuid: $companyUuid) {
        id uuid name slug description is_active company_uuid
        company {
          name
        }
      }
    }
  `,
  ADMIN_PERMISSIONS: `
    query AdminPermissions {
      adminPermissions {
        id uuid parent_id name slug route type icon sort_order is_visible
        children { 
          id uuid parent_id name slug route type icon sort_order is_visible
          children { 
            id uuid parent_id name slug route type icon sort_order is_visible 
            children {
              id uuid parent_id name slug route type icon sort_order is_visible
              children {
                id uuid parent_id name slug route type icon sort_order is_visible
              }
            }            
          }
        }
      }
    }
  `,
  USER_ACCESS_PAGE: `
    query UserAccessPage($all: Boolean) {
      userAccesses(all: $all) {
        data {
          uuid status user_id 
          user { uuid full_name email profile_picture }
          app { uuid name }
          company { uuid name }
          branch { uuid name }
          role { id uuid name }
        }
      }
      users(page: 1, limit: 100) {
        data {
          id uuid full_name email
        }
      }
      apps(page: 1, limit: 100) {
        data {
          id uuid name
        }
      }
      companies(page: 1, limit: 100) {
        data {
          id uuid name app_id
        }
      }
      branches(page: 1, limit: 100) {
        data {
          id uuid name company_id
        }
      }
    }
  `,
  CRUD_CONFIG: `
    query CrudConfig($routePath: String!) {
      crudConfig(routePath: $routePath) {
        route_path resource_name title subtitle add_label permission
        primary_key default_sort lazy_load is_tree show_add show_edit show_delete
        delete_msg graphql_domain query_name query_field delete_q_name delete_field
        create_q_name create_field update_q_name update_field
        columns {
          id field header type sub_field avatar_fld sortable filterable
          visible width text_align render_func sort_order
        }
        form_fields {
          id name label type required icon placeholder options catalog_key accept sort_order
        }
        catalogs_json
      }
    }
  `,
  CRUD_CONFIGS_LIST: `
    query CrudConfigsList($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      crudConfigsList(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data { 
          id route_path resource_name title subtitle add_label permission primary_key default_sort 
          graphql_domain query_name query_field delete_q_name delete_field create_q_name create_field 
          update_q_name update_field lazy_load is_tree show_add show_edit show_delete is_active 
        }
        total currentPage perPage hasMorePages
      }
    }
  `,
  CRUD_COLUMNS_LIST: `
    query CrudColumnsList($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      crudColumnsList(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data { 
          id config_id field header type sub_field avatar_fld sortable filterable visible width text_align render_func sort_order 
          config { id title }
        }
        total currentPage perPage hasMorePages
      }
    }
  `,
  CRUD_FORM_FIELDS_LIST: `
    query CrudFormFieldsList($page: Int, $limit: Int, $filter: GenericFilterInput, $sort: SortInput) {
      crudFormFieldsList(page: $page, limit: $limit, filter: $filter, sort: $sort) {
        data { 
          id config_id name label type required icon placeholder options catalog_key accept sort_order 
          config { id title }
        }
        total currentPage perPage hasMorePages
      }
    }
  `,
};

export const SECUREX_MUTATIONS = {
  CREATE_USER: `
    mutation CreateUser($full_name: String!, $email: String!, $is_super_admin: Boolean, $auth_provider: String) {
      createUser(full_name: $full_name, email: $email, is_super_admin: $is_super_admin, auth_provider: $auth_provider) {
        uuid full_name email status
      }
    }
  `,
  UPDATE_USER: `
    mutation UpdateUser($uuid: String!, $full_name: String, $email: String, $is_super_admin: Boolean, $auth_provider: String) {
      updateUser(uuid: $uuid, full_name: $full_name, email: $email, is_super_admin: $is_super_admin, auth_provider: $auth_provider) {
        uuid full_name email status is_super_admin auth_provider
      }
    }
  `,
  DELETE_USER: `
    mutation DeleteUser($uuid: String!) {
      deleteUser(uuid: $uuid)
    }
  `,
  CREATE_ROLE: `
    mutation CreateRole($name: String!, $slug: String!, $description: String, $is_active: Boolean) {
      createRole(name: $name, slug: $slug, description: $description, is_active: $is_active) {
        uuid name slug
      }
    }
  `,
  UPDATE_ROLE: `
    mutation UpdateRole($uuid: String!, $name: String, $slug: String, $description: String, $is_active: Boolean) {
      updateRole(uuid: $uuid, name: $name, slug: $slug, description: $description, is_active: $is_active) {
        uuid name slug
      }
    }
  `,
  DELETE_ROLE: `
    mutation DeleteRole($uuid: String!) {
      deleteRole(uuid: $uuid)
    }
  `,
  SYNC_ROLE_PERMISSIONS: `
    mutation SyncRolePermissions($uuid: String!, $permissionIds: [Int]) {
      syncRolePermissions(uuid: $uuid, permissionIds: $permissionIds) {
        uuid name permissions { id uuid name }
      }
    }
  `,
  CREATE_COMPANY: `
    mutation CreateCompany($name: String!, $tax_id: String, $logo_url: String, $is_active: Boolean, $app_id: Int) {
      createCompany(name: $name, tax_id: $tax_id, logo_url: $logo_url, is_active: $is_active, app_id: $app_id) {
        uuid name tax_id
      }
    }
  `,
  UPDATE_COMPANY: `
    mutation UpdateCompany($uuid: String!, $name: String, $tax_id: String, $logo_url: String, $is_active: Boolean) {
      updateCompany(uuid: $uuid, name: $name, tax_id: $tax_id, logo_url: $logo_url, is_active: $is_active) {
        uuid name
      }
    }
  `,
  DELETE_COMPANY: `
    mutation DeleteCompany($uuid: String!) {
      deleteCompany(uuid: $uuid)
    }
  `,
  CREATE_BRANCH: `
    mutation CreateBranch($name: String!, $company_id: Int, $address: String, $phone: String, $is_active: Boolean) {
      createBranch(name: $name, company_id: $company_id, address: $address, phone: $phone, is_active: $is_active) {
        uuid name address
      }
    }
  `,
  UPDATE_BRANCH: `
    mutation UpdateBranch($uuid: String!, $name: String, $address: String, $phone: String, $is_active: Boolean) {
      updateBranch(uuid: $uuid, name: $name, address: $address, phone: $phone, is_active: $is_active) {
        uuid name
      }
    }
  `,
  DELETE_BRANCH: `
    mutation DeleteBranch($uuid: String!) {
      deleteBranch(uuid: $uuid)
    }
  `,
  DELETE_WEBAUTHN_CREDENTIAL: `
    mutation DeleteUserWebauthnCredential($id: Int!) {
      deleteUserWebauthnCredential(id: $id)
    }
  `,
  CREATE_PERMISSION: `
    mutation CreatePermission($name: String!, $slug: String!, $type: String, $icon: String, $route: String, $parent_id: Int, $sort_order: Int, $is_visible: Boolean) {
      createPermission(name: $name, slug: $slug, type: $type, icon: $icon, route: $route, parent_id: $parent_id, sort_order: $sort_order, is_visible: $is_visible) {
        id uuid name slug route type icon sort_order is_visible
      }
    }
  `,
  UPDATE_PERMISSION: `
    mutation UpdatePermission($uuid: String!, $name: String, $slug: String, $type: String, $icon: String, $route: String, $sort_order: Int, $is_visible: Boolean) {
      updatePermission(uuid: $uuid, name: $name, slug: $slug, type: $type, icon: $icon, route: $route, sort_order: $sort_order, is_visible: $is_visible) {
        id uuid name slug route type icon sort_order is_visible
      }
    }
  `,
  DELETE_PERMISSION: `
    mutation DeletePermission($uuid: String!) {
      deletePermission(uuid: $uuid)
    }
  `,
  CREATE_APP: `
    mutation CreateApp($name: String!, $slug: String!, $is_active: Boolean) {
      createApp(name: $name, slug: $slug, is_active: $is_active) {
        id uuid name slug is_active
      }
    }
  `,
  UPDATE_APP: `
    mutation UpdateApp($uuid: String!, $name: String, $slug: String, $is_active: Boolean) {
      updateApp(uuid: $uuid, name: $name, slug: $slug, is_active: $is_active) {
        id uuid name slug is_active
      }
    }
  `,
  DELETE_APP: `
    mutation DeleteApp($uuid: String!) {
      deleteApp(uuid: $uuid)
    }
  `,
  CREATE_USER_ACCESS: `
    mutation CreateUserAccess($user_uuid: String!, $app_uuid: String!, $company_uuid: String, $branch_uuid: String, $role_uuid: String, $status: String) {
      createUserAccess(user_uuid: $user_uuid, app_uuid: $app_uuid, company_uuid: $company_uuid, branch_uuid: $branch_uuid, role_uuid: $role_uuid, status: $status) {
        uuid status
      }
    }
  `,
  UPDATE_USER_ACCESS: `
    mutation UpdateUserAccess($uuid: String!, $user_uuid: String, $app_uuid: String, $company_uuid: String, $branch_uuid: String, $role_uuid: String, $status: String) {
      updateUserAccess(uuid: $uuid, user_uuid: $user_uuid, app_uuid: $app_uuid, company_uuid: $company_uuid, branch_uuid: $branch_uuid, role_uuid: $role_uuid, status: $status) {
        uuid status
      }
    }
  `,
  DELETE_USER_ACCESS: `
    mutation DeleteUserAccess($uuid: String!) {
      deleteUserAccess(uuid: $uuid)
    }
  `,
  SEND_USER_INVITATION: `
    mutation SendUserInvitation($email: String!, $full_name: String) {
      sendUserInvitation(email: $email, full_name: $full_name) {
        success message
      }
    }
  `,
  CREATE_CRUD_CONFIG: `
    mutation CreateCrudConfig($route_path: String!, $resource_name: String!, $title: String, $subtitle: String, $permission: String, $primary_key: String, $default_sort: String, $graphql_domain: String, $query_name: String, $query_field: String, $delete_q_name: String, $delete_field: String, $create_q_name: String, $create_field: String, $update_q_name: String, $update_field: String, $lazy_load: Int, $is_tree: Int, $show_add: Int, $show_edit: Int, $show_delete: Int, $is_active: Int) {
      createCrudConfig(route_path: $route_path, resource_name: $resource_name, title: $title, subtitle: $subtitle, permission: $permission, primary_key: $primary_key, default_sort: $default_sort, graphql_domain: $graphql_domain, query_name: $query_name, query_field: $query_field, delete_q_name: $delete_q_name, delete_field: $delete_field, create_q_name: $create_q_name, create_field: $create_field, update_q_name: $update_q_name, update_field: $update_field, lazy_load: $lazy_load, is_tree: $is_tree, show_add: $show_add, show_edit: $show_edit, show_delete: $show_delete, is_active: $is_active) {
        id route_path
      }
    }
  `,
  UPDATE_CRUD_CONFIG: `
    mutation UpdateCrudConfig($id: Int!, $route_path: String, $resource_name: String, $title: String, $subtitle: String, $permission: String, $primary_key: String, $default_sort: String, $graphql_domain: String, $query_name: String, $query_field: String, $delete_q_name: String, $delete_field: String, $create_q_name: String, $create_field: String, $update_q_name: String, $update_field: String, $lazy_load: Int, $is_tree: Int, $show_add: Int, $show_edit: Int, $show_delete: Int, $is_active: Int) {
      updateCrudConfig(id: $id, route_path: $route_path, resource_name: $resource_name, title: $title, subtitle: $subtitle, permission: $permission, primary_key: $primary_key, default_sort: $default_sort, graphql_domain: $graphql_domain, query_name: $query_name, query_field: $query_field, delete_q_name: $delete_q_name, delete_field: $delete_field, create_q_name: $create_q_name, create_field: $create_field, update_q_name: $update_q_name, update_field: $update_field, lazy_load: $lazy_load, is_tree: $is_tree, show_add: $show_add, show_edit: $show_edit, show_delete: $show_delete, is_active: $is_active) {
        id route_path
      }
    }
  `,
  DELETE_CRUD_CONFIG: `
    mutation DeleteCrudConfig($id: Int!) {
      deleteCrudConfig(id: $id)
    }
  `,
  CREATE_CRUD_COLUMN: `
    mutation CreateCrudColumn($config_id: Int!, $field: String!, $header: String!, $type: String, $sub_field: String, $avatar_fld: String, $sortable: Int, $filterable: Int, $visible: Int, $width: String, $text_align: String, $render_func: String, $sort_order: Int) {
      createCrudColumn(config_id: $config_id, field: $field, header: $header, type: $type, sub_field: $sub_field, avatar_fld: $avatar_fld, sortable: $sortable, filterable: $filterable, visible: $visible, width: $width, text_align: $text_align, render_func: $render_func, sort_order: $sort_order) {
        id field
      }
    }
  `,
  UPDATE_CRUD_COLUMN: `
    mutation UpdateCrudColumn($id: Int!, $config_id: Int, $field: String, $header: String, $type: String, $sub_field: String, $avatar_fld: String, $sortable: Int, $filterable: Int, $visible: Int, $width: String, $text_align: String, $render_func: String, $sort_order: Int) {
      updateCrudColumn(id: $id, config_id: $config_id, field: $field, header: $header, type: $type, sub_field: $sub_field, avatar_fld: $avatar_fld, sortable: $sortable, filterable: $filterable, visible: $visible, width: $width, text_align: $text_align, render_func: $render_func, sort_order: $sort_order) {
        id field
      }
    }
  `,
  DELETE_CRUD_COLUMN: `
    mutation DeleteCrudColumn($id: Int!) {
      deleteCrudColumn(id: $id)
    }
  `,
  CREATE_CRUD_FORM_FIELD: `
    mutation CreateCrudFormField($config_id: Int!, $name: String!, $label: String!, $type: String, $required: Int, $icon: String, $placeholder: String, $options: String, $catalog_key: String, $accept: String, $sort_order: Int) {
      createCrudFormField(config_id: $config_id, name: $name, label: $label, type: $type, required: $required, icon: $icon, placeholder: $placeholder, options: $options, catalog_key: $catalog_key, accept: $accept, sort_order: $sort_order) {
        id name
      }
    }
  `,
  UPDATE_CRUD_FORM_FIELD: `
    mutation UpdateCrudFormField($id: Int!, $config_id: Int, $name: String, $label: String, $type: String, $required: Int, $icon: String, $placeholder: String, $options: String, $catalog_key: String, $accept: String, $sort_order: Int) {
      updateCrudFormField(id: $id, config_id: $config_id, name: $name, label: $label, type: $type, required: $required, icon: $icon, placeholder: $placeholder, options: $options, catalog_key: $catalog_key, accept: $accept, sort_order: $sort_order) {
        id name
      }
    }
  `,
  DELETE_CRUD_FORM_FIELD: `
    mutation DeleteCrudFormField($id: Int!) {
      deleteCrudFormField(id: $id)
    }
  `
};
