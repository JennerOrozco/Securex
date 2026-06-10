export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface User {
  uuid: string;
  id: string | number;
  full_name: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  profile_picture?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  is_super_admin?: boolean;
  role_id?: number;
  role_name?: string;
}

export interface Company {
  uuid: string;
  name: string;
  branch_name?: string;
}

export interface Branch {
  uuid: string;
  name: string;
}

export interface MenuItem {
  name: string;
  icon?: string;
  route?: string;
  slug?: string;
  children?: MenuItem[];
}

export interface WebAuthnRegisterOptions {
  challenge: string;
  rp?: { id: string; name: string };
  user?: { id: string; name: string; displayName: string };
  pubKeyCredParams?: any[];
  timeout?: number;
  attestation?: string;
  excludeCredentials?: any[];
}

export interface WebAuthnLoginOptions {
  challenge: string;
  allowCredentials?: any[];
  timeout?: number;
  userVerification?: string;
}

export interface DeviceCredential {
  id: string;
  device_name?: string;
  created_at?: string;
}
