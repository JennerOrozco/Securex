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
          uuid full_name email status is_super_admin auth_provider created_at
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
          user { uuid full_name email }
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
          user { uuid full_name }
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
          user { uuid full_name email }
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
};
