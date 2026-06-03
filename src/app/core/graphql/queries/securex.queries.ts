export const SECUREX_QUERIES = {
  USERS: `
    query Users {
      users {
        uuid full_name email status is_super_admin auth_provider
        access { uuid status role { uuid name slug permissions { uuid name slug } } }
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
    query Roles {
      roles {
        id uuid name slug description is_active company_uuid
        company {
          name
        }
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
          children { id uuid parent_id name slug route type icon sort_order is_visible }
        }
      }
    }
  `,
  COMPANIES: `
    query Companies {
      companies {
        id uuid app_id tax_id name logo_url is_active
        branches { id uuid name address phone is_active }
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
    query Branches {
      branches {
        id uuid company_id name address phone is_active
      }
    }
  `,
  APPS: `
    query Apps {
      apps {
        id uuid name slug api_key api_secret google_client_id google_client_secret is_active
        companies { id uuid name is_active branches { id uuid name } }
      }
    }
  `,
  USER_ACCESSES: `
    query UserAccesses {
      userAccesses {
        uuid user_id app_id company_id branch_id role_id status
        role { uuid name slug }
      }
    }
  `,
  SECURITY_AUDIT_LOGS: `
    query SecurityAuditLogs {
      securityAuditLogs {
        user_uuid user_name event_type description ip_address
      }
    }
  `,
  LOGIN_ATTEMPTS: `
    query LoginAttempts {
      loginAttempts {
        email app_uuid ip_address user_agent successful created_at
      }
    }
  `,
  USER_WEBAUTHN_CREDENTIALS: `
    query UserWebauthnCredentials {
      userWebauthnCredentials {
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
    }
  `,
  PASSWORD_RESETS: `
    query PasswordResets {
      passwordResets {
        id email token created_at
      }
    }
  `,
  REFRESH_TOKENS: `
    query RefreshTokens {
      refreshTokens {
        id user_uuid token expires_at revoked created_at updated_at
      }
    }
  `,
};

export const SECUREX_MUTATIONS = {
  CREATE_USER: `
    mutation CreateUser($full_name: String!, $email: String!, $status: String, $is_super_admin: Boolean, $auth_provider: String) {
      createUser(full_name: $full_name, email: $email, status: $status, is_super_admin: $is_super_admin, auth_provider: $auth_provider) {
        uuid full_name email status
      }
    }
  `,
  UPDATE_USER: `
    mutation UpdateUser($uuid: String!, $full_name: String, $email: String, $status: String, $is_super_admin: Boolean) {
      updateUser(uuid: $uuid, full_name: $full_name, email: $email, status: $status, is_super_admin: $is_super_admin) {
        uuid full_name email status
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
    mutation CreateCompany($name: String!, $tax_id: String, $logo_url: String, $is_active: Boolean) {
      createCompany(name: $name, tax_id: $tax_id, logo_url: $logo_url, is_active: $is_active) {
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
};
