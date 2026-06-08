import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, map, catchError, finalize, ReplaySubject, take, timeout, firstValueFrom } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { NotificationService } from './notification.service';

// Interfaces alineadas con el response del SecureApi
export interface User {
    uuid: string;
    id: string | number; // Alias para compatibilidad
    full_name: string;
    name: string;       // Alias para compatibilidad
    email: string;
    role: 'admin' | 'user'; // Alias para compatibilidad
    // Campos opcionales que podrían venir en otros endpoints
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

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // 1. Manejador de estado reactivo (usando Signals):
    private currentUserSignal = signal<User | null>(null);
    public currentUser = this.currentUserSignal.asReadonly();
    
    private userMenuSignal = signal<any[]>([]);
    public userMenu = this.userMenuSignal.asReadonly();

    private userPermissionsSignal = signal<string[]>([]);
    public userPermissions = this.userPermissionsSignal.asReadonly();

    private currentCompanySignal = signal<Company | null>(null);
    public currentCompany = this.currentCompanySignal.asReadonly();

    private currentBranchSignal = signal<Branch | null>(null);
    public currentBranch = this.currentBranchSignal.asReadonly();

    private userCompaniesSignal = signal<Company[]>([]);
    public userCompanies = this.userCompaniesSignal.asReadonly();

    private userBranchesSignal = signal<Branch[]>([]);
    public userBranches = this.userBranchesSignal.asReadonly();

    private switchCompanyLoadingSignal = signal<boolean>(false);
    public switchCompanyLoading = this.switchCompanyLoadingSignal.asReadonly();

    private isRefreshingSignal = signal<boolean>(false);
    public isRefreshing = this.isRefreshingSignal.asReadonly();

    // Singleton refresh: evita race conditions con requests concurrentes
    private refreshInProgress = false;
    private refreshResult = new ReplaySubject<string | null>(1);

    private http = inject(HttpClient);
    private router = inject(Router);
    private swPush = inject(SwPush);
    private configService = inject(ConfigService);
    private notificationService = inject(NotificationService);

    constructor() {
        // Intenta parsear el usuario del almacenamiento local al inicio
        const storedUser = localStorage.getItem('currentUser');
        let initialUser = null;
        try {
            initialUser = storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error('Error parsing stored user', e);
            localStorage.removeItem('currentUser');
        }
        this.currentUserSignal.set(initialUser);

        // Compañía
        const storedCompany = localStorage.getItem('currentCompany');
        if (storedCompany) {
            try {
                this.currentCompanySignal.set(JSON.parse(storedCompany));
            } catch (e) { console.error('Error parsing company', e); }
        }

        // Compañías del usuario
        const storedCompanies = localStorage.getItem('userCompanies');
        if (storedCompanies) {
            try {
                const parsed = JSON.parse(storedCompanies);
                if (Array.isArray(parsed)) {
                    this.userCompaniesSignal.set(parsed);
                }
            } catch (e) { console.error('Error parsing user companies', e); }
        }

        // Sucursales del usuario
        const storedBranches = localStorage.getItem('userBranches');
        if (storedBranches) {
            try {
                const parsed = JSON.parse(storedBranches);
                if (Array.isArray(parsed)) {
                    this.userBranchesSignal.set(parsed);
                }
            } catch (e) { console.error('Error parsing user branches', e); }
        }

        // Sucursal actual
        const storedBranch = localStorage.getItem('currentBranch');
        if (storedBranch) {
            try {
                this.currentBranchSignal.set(JSON.parse(storedBranch));
            } catch (e) { console.error('Error parsing branch', e); }
        }

        // Intentar recuperar el menú guardado
        const storedMenu = localStorage.getItem('userMenu');
        if (storedMenu) {
            try {
                const parsed = JSON.parse(storedMenu);
                if (Array.isArray(parsed)) {
                    this.userMenuSignal.set(parsed);
                } else {
                    localStorage.removeItem('userMenu');
                }
            } catch (e) {
                console.error('Error parsing stored menu', e);
                localStorage.removeItem('userMenu');
            }
        }

        // Intentar recuperar los permisos guardados
        const storedPermissions = localStorage.getItem('userPermissions');
        if (storedPermissions) {
            try {
                this.userPermissionsSignal.set(JSON.parse(storedPermissions));
            } catch (e) {
                console.error('Error parsing stored permissions', e);
            }
        }
    }

    // Obtiene el valor actual del usuario
    public get currentUserValue(): User | null {
        return this.currentUserSignal();
    }

    /**
     * Verifica si el usuario actual es superadmin.
     */
    public get isAdmin(): boolean {
        return !!this.currentUserSignal()?.is_super_admin;
    }

    /**
     * Llama a la API para iniciar sesión.
     * El response viene en: { status, data: { access_token, refresh_token, user, company } }
     */
    login(credentials: any): Observable<any> {
        const payload: any = {
            email: credentials.email,
            password: credentials.password,
            app_uuid: this.configService.appUuid
        };
        if (credentials.company_uuid) {
            payload.company_uuid = credentials.company_uuid;
        }
        if (credentials.branch_uuid) {
            payload.branch_uuid = credentials.branch_uuid;
        }

        return this.http.post<any>(`${this.configService.apiUrl}/auth/login`, payload)
            .pipe(
                tap(response => {
                    // El API retorna los datos dentro de response.data
                    const data = response.data ?? response;
                    if (data?.access_token) {
                        this.persistSession(data);
                    }
                }),
                tap(response => {
                    // Compatibilidad: indicar éxito y exponer user/company al componente
                    const data = response.data ?? response;
                    response.success = !!data?.access_token;
                    response.requires_company_select = !!data?.requires_company_select;
                    response.companies = data?.companies;
                    response.user = data?.user;
                    response.company = data?.company;
                })
            );
    }

    loginWithGoogle(idToken: string, companyUuid?: string, branchUuid?: string): Observable<any> {
        const payload: any = {
            id_token: idToken,
            app_uuid: this.configService.appUuid
        };
        if (companyUuid) {
            payload.company_uuid = companyUuid;
        }
        if (branchUuid) {
            payload.branch_uuid = branchUuid;
        }

        return this.http.post<any>(`${this.configService.apiUrl}/auth/google-login`, payload)
            .pipe(
                tap(response => {
                    const data = response.data ?? response;
                    if (data?.access_token) {
                        this.persistSession(data);
                    }
                }),
                tap(response => {
                    const data = response.data ?? response;
                    response.success = !!data?.access_token;
                    response.requires_company_select = !!data?.requires_company_select;
                    response.companies = data?.companies;
                    response.user = data?.user;
                    response.company = data?.company;
                })
            );
    }

    /**
     * Persiste tokens y datos de sesión en localStorage.
     */
    private persistSession(data: any): void {
        localStorage.setItem('accessToken', data.access_token);
        if (data.refresh_token) {
            sessionStorage.setItem('refreshToken', data.refresh_token);
        }
        if (data.user) {
            const user: User = {
                ...data.user,
                id: data.user.uuid, // Mapeo de id
                name: data.user.full_name, // Mapeo de name
                role: data.user.is_super_admin ? 'admin' : 'user' // Mapeo de role
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSignal.set(user);
        }
        if (data.company) {
            localStorage.setItem('currentCompany', JSON.stringify(data.company));
            this.currentCompanySignal.set(data.company);
        }
        if (data.branch) {
            localStorage.setItem('currentBranch', JSON.stringify(data.branch));
            this.currentBranchSignal.set(data.branch);
        }

        if (data.companies) {
            this.setUserCompanies(data.companies);
        }
        if (data.branches) {
            this.setUserBranches(data.branches);
        }

        // Registrar para notificaciones push automáticamente al iniciar sesión
        this.notificationService.registerForPush();
    }

    setUserCompanies(companies: Company[]): void {
        this.userCompaniesSignal.set(companies);
        localStorage.setItem('userCompanies', JSON.stringify(companies));
    }

    setUserBranches(branches: Branch[]): void {
        this.userBranchesSignal.set(branches);
        localStorage.setItem('userBranches', JSON.stringify(branches));
    }

    switchCompany(companyUuid: string): Observable<any> {
        this.switchCompanyLoadingSignal.set(true);
        return this.http.post<any>(`${this.configService.apiUrl}/auth/switch-company`, {
            company_uuid: companyUuid
        }).pipe(
            tap(response => {
                const data = response.data ?? response;
                if (data?.access_token) {
                    this.persistSession({
                        ...data,
                        companies: this.userCompaniesSignal()
                    });
                    this.refreshPermissions().subscribe();
                    this.getUserProfile().subscribe();
                }
            }),
            finalize(() => {
                this.switchCompanyLoadingSignal.set(false);
            })
        );
    }

    switchBranch(branchUuid: string): Observable<any> {
        this.switchCompanyLoadingSignal.set(true);
        return this.http.post<any>(`${this.configService.apiUrl}/auth/switch-branch`, {
            branch_uuid: branchUuid
        }).pipe(
            tap(response => {
                const data = response.data ?? response;
                if (data?.access_token) {
                    this.persistSession({
                        ...data,
                        companies: this.userCompaniesSignal()
                    });
                    this.refreshPermissions().subscribe();
                    this.getUserProfile().subscribe();
                }
            }),
            finalize(() => {
                this.switchCompanyLoadingSignal.set(false);
            })
        );
    }

    getUserCompanies(): Observable<any> {
        return this.http.get<any>(`${this.configService.apiUrl}/auth/companies`).pipe(
            tap(response => {
                const data = response.data ?? response;
                if (Array.isArray(data)) {
                    this.setUserCompanies(data);
                }
            })
        );
    }

    getUserBranches(): Observable<any> {
        return this.http.get<any>(`${this.configService.apiUrl}/auth/branches`).pipe(
            tap(response => {
                const data = response.data ?? response;
                if (Array.isArray(data)) {
                    this.setUserBranches(data);
                }
            })
        );
    }

    register(data: any): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/register`, { ...data, app_uuid: this.configService.appUuid })
            .pipe(tap(res => res.success = true)); // Simplified mapping
    }

    /**
     * Renueva el access token usando el refresh token almacenado.
     * Implementación singleton: requests concurrentes comparten la misma llamada HTTP.
     */
    refreshToken(): Observable<string | null> {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
            return of(null);
        }

        if (!this.refreshInProgress) {
            this.refreshInProgress = true;
            this.isRefreshingSignal.set(true);
            this.refreshResult = new ReplaySubject<string | null>(1);

            this.http.post<any>(`${this.configService.apiUrl}/auth/refresh`, { refresh_token: refreshToken })
                .pipe(finalize(() => {
                    this.refreshInProgress = false;
                    this.isRefreshingSignal.set(false);
                }))
                .subscribe({
                    next: (response) => {
                        const data = response.data ?? response;
                        if (data?.access_token) {
                            this.persistSession(data);
                            this.refreshResult.next(data.access_token);
                        } else {
                            sessionStorage.removeItem('refreshToken');
                            this.refreshResult.next(null);
                        }
                    },
                    error: () => {
                        sessionStorage.removeItem('refreshToken');
                        this.refreshResult.next(null);
                    }
                });
        }

        return this.refreshResult.pipe(
            take(1),
            timeout(15000),
            catchError(() => of(null))
        );
    }

    requestPasswordReset(email: string): Observable<any> {
        const url = `${this.configService.apiUrl}/auth/forgot-password`;
        return this.http.post<any>(url, { email, app_uuid: this.configService.appUuid })
            .pipe(
                map(res => ({
                    success: res.status === 'success',
                    message: res.message,
                    error: res.status !== 'success' ? (res.message || 'Error al solicitar recuperación.') : undefined
                })),
                catchError(err => {
                    const errorMsg = err.error?.message || err.error?.error || 'Error de conexión. Intenta de nuevo.';
                    return of({ success: false, error: errorMsg });
                })
            );
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/reset-password`, {
            email: data.email,
            app_uuid: this.configService.appUuid,
            code: data.code,
            password: data.newPassword
        }).pipe(
            map(res => ({
                success: res.status === 'success',
                message: res.message,
                error: res.status !== 'success' ? (res.message || 'Error al restablecer contraseña.') : undefined
            })),
            catchError(err => {
                const errorMsg = err.error?.message || err.error?.error || 'Error de conexión. Intenta de nuevo.';
                return of({ success: false, error: errorMsg });
            })
        );
    }

    /**
     * Obtiene el perfil del usuario actual desde /auth/me.
     */
    getUserProfile(): Observable<any> {
        return this.http.get<any>(`${this.configService.apiUrl}/auth/me`)
            .pipe(
                tap(response => {
                    const data = response.data || response;
                    if (data && data.uuid) {
                        // Enriquecer el usuario actual con los datos del perfil
                        const updatedUser: User = {
                            ...this.currentUserValue!,
                            full_name: data.full_name,
                            name: data.full_name,
                            role_name: data.role_name || 'Residente'
                        };
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        this.currentUserSignal.set(updatedUser);
                        
                        // Guardar permisos si vienen en /me
                        if (data.permissions) {
                            this.userPermissionsSignal.set(data.permissions);
                            localStorage.setItem('userPermissions', JSON.stringify(data.permissions));
                        }
                    }
                })
            );
    }

    /**
     * Obtiene el menú del usuario.
     */
    refreshPermissions(): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.get<any>(`${this.configService.apiUrl}/auth/menu`)
            .pipe(
                tap(response => {
                    const data = response.data || response;
                    console.log('AuthService: Menu data received', data);
                    if (data) {
                        // Caso 1: Estructura nueva con objeto { menu, permissions }
                        if (!Array.isArray(data) && data.menu) {
                            console.log('AuthService: Setting menu from object', data.menu);
                            this.userMenuSignal.set(data.menu);
                            localStorage.setItem('userMenu', JSON.stringify(data.menu));
                            
                            if (data.permissions) {
                                this.userPermissionsSignal.set(data.permissions);
                                localStorage.setItem('userPermissions', JSON.stringify(data.permissions));
                            }
                        } 
                        // Caso 2: Estructura anterior/alternativa donde data es el arreglo directamente
                        else if (Array.isArray(data)) {
                            console.log('AuthService: Setting menu from array', data);
                            this.userMenuSignal.set(data);
                            localStorage.setItem('userMenu', JSON.stringify(data));
                            
                            const slugs = this.extractSlugs(data);
                            this.userPermissionsSignal.set(slugs);
                            localStorage.setItem('userPermissions', JSON.stringify(slugs));
                        }
                    }
                })
            );
    }

    /**
     * Obtiene los componentes/permisos móviles del usuario.
     */
    getMobileComponents(): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.get<any>(`${this.configService.apiUrl}/auth/components`);
    }

    /**
     * Cambia la contraseña del usuario.
     */
    changePassword(data: any): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.post<any>(`${this.configService.apiUrl}/auth/change-password`, data);
    }

    /**
     * Administrador fuerza el reinicio de contraseña de un usuario (envía código a su email).
     */
    adminResetUserPassword(email: string): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/forgot-password`, {
            email,
            app_uuid: this.configService.appUuid
        }).pipe(
            map(res => ({
                success: res.status === 'success',
                message: res.message,
                error: res.status !== 'success' ? (res.message || 'Error al enviar el código.') : undefined
            })),
            catchError(err => {
                const errorMsg = err.error?.message || err.error?.error || 'Error de conexión. Intenta de nuevo.';
                return of({ success: false, error: errorMsg });
            })
        );
    }

    /**
     * Obtiene las opciones para registrar una huella.
     */
    getWebAuthnRegisterOptions(): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/register-options`, {});
    }

    /**
     * Registra la huella en el backend.
     */
    registerWebAuthn(data: any): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/register`, data);
    }

    /**
     * Obtiene las credenciales registradas del usuario.
     */
    getWebAuthnCredentials(): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.get<any>(`${this.configService.apiUrl}/auth/webauthn/credentials`);
    }

    /**
     * Elimina una credencial registrada del usuario.
     */
    deleteWebAuthnCredential(id: any): Observable<any> {
        const token = localStorage.getItem('accessToken');
        if (!token) return of(null);

        return this.http.delete<any>(`${this.configService.apiUrl}/auth/webauthn/credentials/${id}`);
    }

    /**
     * Obtiene las opciones para iniciar sesión con huella.
     */
    getWebAuthnLoginOptions(email?: string): Observable<any> {
        const payload: any = { app_uuid: this.configService.appUuid };
        if (email) payload.email = email;
        return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/login-options`, payload);
    }

    loginWithWebAuthn(data: any): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/webauthn/login`, {
            ...data,
            app_uuid: this.configService.appUuid
        }).pipe(
            tap(response => {
                const resData = response.data ?? response;
                if (resData?.access_token) {
                    this.persistSession(resData);
                }
            }),
            tap(response => {
                const resData = response.data ?? response;
                response.success = !!resData?.access_token;
                response.requires_company_select = !!resData?.requires_company_select;
                response.companies = resData?.companies;
                response.user = resData?.user;
                response.company = resData?.company;
            })
        );
    }

    /**
     * Helper para extraer slugs de una estructura jerárquica (fallback).
     */
    private extractSlugs(items: any[]): string[] {
        let slugs: string[] = [];
        for (const item of items) {
            if (item.slug) slugs.push(item.slug);
            if (item.children && item.children.length > 0) {
                slugs = [...slugs, ...this.extractSlugs(item.children)];
            }
        }
        return slugs;
    }

    /**
     * Verifica si el usuario tiene acceso a un módulo o acción.
     */
    checkPermission(slug: string): boolean {
        // Si es superadmin, tiene acceso a todo
        if (this.isAdmin) return true;
        
        // Buscar en la lista plana de permisos
        return this.userPermissionsSignal().includes(slug);
    }

    /**
     * Verifica si el usuario tiene acceso a una ruta específica.
     */
    hasRouteAccess(route: string): boolean {
        if (this.isAdmin) return true;
        if (route === '/home' || route === 'home' || route === '') return true;

        const findRoute = (items: any[]): boolean => {
            for (const item of items) {
                // Limpiar rutas para comparar (quitar slash inicial si existe)
                const itemRoute = item.route?.startsWith('/') ? item.route : `/${item.route}`;
                const targetRoute = route.startsWith('/') ? route : `/${route}`;

                // Match exact or startsWith for parameterized routes (e.g. /sales/orders-create/uuid)
                if (itemRoute === targetRoute || (targetRoute.startsWith(itemRoute) && targetRoute[itemRoute.length] === '/')) return true;
                
                if (item.children && findRoute(item.children)) return true;
            }
            return false;
        };

        return findRoute(this.userMenuSignal());
    }

    /**
     * Obtiene la primera ruta accesible para el usuario.
     */
    getFirstAccessibleRoute(): string | null {
        const menu = this.userMenuSignal();
        if (menu.length > 0) {
            const findFirst = (items: any[]): string | null => {
                for (const item of items) {
                    if (item.route) return item.route;
                    if (item.children) {
                        const firstChild = findFirst(item.children);
                        if (firstChild) return firstChild;
                    }
                }
                return null;
            };
            return findFirst(menu);
        }
        return null;
    }

    async logout() {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');

        // Revocar dispositivo push en el backend (sin bloquear el logout)
        if (this.swPush.isEnabled) {
            firstValueFrom(this.swPush.subscription)
                .then(sub => {
                    if (sub) {
                        const payload = {
                            device_token: JSON.stringify(sub)
                        };
                        firstValueFrom(
                            this.http.delete(`${this.configService.notificationApiUrl}/notifications/devices`, { body: payload })
                        ).then(() => {
                            console.log('Push device unsubscribed in backend successfully.');
                        }).catch(err => {
                            console.error('Failed to delete push device registration on logout:', err);
                        });
                    }
                })
                .catch(err => {
                    console.error('Failed to get push subscription on logout:', err);
                });
        }

        // Revocar en backend (fire & forget — no bloquear el logout)
        if (refreshToken && accessToken) {
            this.http.post(`${this.configService.apiUrl}/auth/logout`,
                { refresh_token: refreshToken }
            ).subscribe({ error: () => {} });
        }

        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentCompany');
        localStorage.removeItem('currentBranch');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userMenu');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userCompanies');
        localStorage.removeItem('userBranches');
        sessionStorage.removeItem('refreshToken');
        this.currentUserSignal.set(null);
        this.userMenuSignal.set([]);
        this.userPermissionsSignal.set([]);
        this.userCompaniesSignal.set([]);
        this.userBranchesSignal.set([]);
        this.router.navigate(['/login']);
    }
}
