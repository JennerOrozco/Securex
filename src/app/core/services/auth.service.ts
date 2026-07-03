import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, map, catchError, finalize, ReplaySubject, take, timeout, firstValueFrom } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { ConfigService } from './config.service';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';
import { GraphqlService } from '../graphql/graphql.service';
import { SECUREX_QUERIES } from '../graphql/queries/securex.queries';
import { User, Company, Branch } from '@shared/types';


@Injectable({ providedIn: 'root' })
export class AuthService {
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

  private refreshInProgress = false;
  private refreshResult = new ReplaySubject<string | null>(1);

  /** Exposed for sibling services (ProfileService, WebAuthnService) */
  setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
  }

  setUserPermissions(permissions: string[]): void {
    this.userPermissionsSignal.set(permissions);
  }

    private http = inject(HttpClient);
    private router = inject(Router);
    private swPush = inject(SwPush);
    private configService = inject(ConfigService);
    private notificationService = inject(NotificationService);
    private storage = inject(StorageService);
    private gql = inject(GraphqlService);

    constructor() {
        const user = this.storage.getUser();
        this.currentUserSignal.set(user as User | null);

        const company = this.storage.getCompany();
        if (company) this.currentCompanySignal.set(company);

        const companies = this.storage.getUserCompanies();
        if (companies.length > 0) this.userCompaniesSignal.set(companies);

        const branches = this.storage.getUserBranches();
        if (branches.length > 0) this.userBranchesSignal.set(branches);

        const branch = this.storage.getBranch();
        if (branch) this.currentBranchSignal.set(branch);

        const menu = this.storage.getUserMenu();
        if (menu.length > 0) this.userMenuSignal.set(menu);

        const permissions = this.storage.getUserPermissions();
        if (permissions.length > 0) this.userPermissionsSignal.set(permissions);
    }

    public get currentUserValue(): User | null {
        return this.currentUserSignal();
    }

    public get isAdmin(): boolean {
        return !!this.currentUserSignal()?.is_super_admin;
    }

    login(credentials: any): Observable<any> {
        const payload: any = {
            email: credentials.email,
            password: credentials.password,
            app_uuid: this.configService.appUuid
        };
        if (credentials.company_uuid) payload.company_uuid = credentials.company_uuid;
        if (credentials.branch_uuid) payload.branch_uuid = credentials.branch_uuid;

        return this.http.post<any>(`${this.configService.apiUrl}/auth/login`, payload).pipe(
            this.handleLoginResponse()
        );
    }

    loginWithGoogle(idToken: string, companyUuid?: string, branchUuid?: string): Observable<any> {
        const payload: any = { id_token: idToken, app_uuid: this.configService.appUuid };
        if (companyUuid) payload.company_uuid = companyUuid;
        if (branchUuid) payload.branch_uuid = branchUuid;

        return this.http.post<any>(`${this.configService.apiUrl}/auth/google-login`, payload).pipe(
            this.handleLoginResponse()
        );
    }

    /** Shared login response processing for login() and loginWithGoogle() */
    private handleLoginResponse() {
        return (source: Observable<any>) => source.pipe(
            tap(response => {
                const data = response.data ?? response;
                if (data?.access_token) this.persistSession(data);
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

    private persistSession(data: any): void {
        this.storage.setAccessToken(data.access_token);
        if (data.refresh_token) this.storage.setRefreshToken(data.refresh_token);

        if (data.user) {
            const user: User = {
                ...data.user,
                id: data.user.uuid,
                name: data.user.full_name,
                role: data.user.is_super_admin ? 'admin' : 'user',
                profile_picture: data.user.profile_picture
            };
            this.storage.setUser(user);
            this.currentUserSignal.set(user);
        }

        if (data.company) {
            this.storage.setCompany(data.company);
            this.currentCompanySignal.set(data.company);
        }

        if (data.branch) {
            this.storage.setBranch(data.branch);
            this.currentBranchSignal.set(data.branch);
        }

        if (data.companies) this.setUserCompanies(data.companies);
        if (data.branches) this.setUserBranches(data.branches);

        this.notificationService.registerForPush();
    }

    setUserCompanies(companies: Company[]): void {
        this.userCompaniesSignal.set(companies);
        this.storage.setUserCompanies(companies);
    }

    setUserBranches(branches: Branch[]): void {
        this.userBranchesSignal.set(branches);
        this.storage.setUserBranches(branches);
    }

    switchCompany(companyUuid: string): Observable<any> {
        return this.switchContext('switch-company', 'company_uuid', companyUuid);
    }

    switchBranch(branchUuid: string): Observable<any> {
        return this.switchContext('switch-branch', 'branch_uuid', branchUuid);
    }

    private switchContext(endpoint: string, paramKey: string, uuid: string): Observable<any> {
        this.switchCompanyLoadingSignal.set(true);
        return this.http.post<any>(`${this.configService.apiUrl}/auth/${endpoint}`, {
            [paramKey]: uuid
        }).pipe(
            tap(response => {
                const data = response.data ?? response;
                if (data?.access_token) {
                    this.persistSession({ ...data, companies: this.userCompaniesSignal() });
                    this.refreshPermissions().subscribe();
                    this.getUserProfile().subscribe();
                }
            }),
            finalize(() => this.switchCompanyLoadingSignal.set(false))
        );
    }

    register(data: any): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/register`, { ...data, app_uuid: this.configService.appUuid })
            .pipe(tap(res => res.success = true));
    }

    refreshToken(): Observable<string | null> {
        const refreshToken = this.storage.getRefreshToken();
        if (!refreshToken) return of(null);

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
                            this.storage.removeRefreshToken();
                            this.refreshResult.next(null);
                        }
                    },
                    error: () => {
                        this.storage.removeRefreshToken();
                        this.refreshResult.next(null);
                    }
                });
        }

        return this.refreshResult.pipe(take(1), timeout(15000), catchError(() => of(null)));
    }

    requestPasswordReset(email: string): Observable<any> {
        return this.http.post<any>(`${this.configService.apiUrl}/auth/forgot-password`, {
            email, app_uuid: this.configService.appUuid
        }).pipe(
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
            email: data.email, app_uuid: this.configService.appUuid,
            code: data.code, password: data.newPassword
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

    getUserProfile(): Observable<any> {
        return this.http.get<any>(`${this.configService.apiUrl}/auth/me`).pipe(
            tap(response => {
                const data = response.data || response;
                if (data && data.uuid) {
                    const existing = this.currentUserValue;
                    const updatedUser: User = {
                        ...existing!,
                        full_name: data.full_name,
                        name: data.full_name,
                        role_name: data.role_name || 'Residente',
                        profile_picture: data.profile_picture
                    };
                    this.storage.setUser(updatedUser);
                    this.currentUserSignal.set(updatedUser);

                    if (data.permissions) {
                        this.userPermissionsSignal.set(data.permissions);
                        this.storage.setUserPermissions(data.permissions);
                    }
                }
            })
        );
    }

    refreshPermissions(): Observable<any> {
        const token = this.storage.getAccessToken();
        if (!token) return of(null);

        return this.http.get<any>(`${this.configService.apiUrl}/auth/menu`).pipe(
            tap(response => {
                const data = response.data || response;
                if (data) {
                    if (!Array.isArray(data) && data.menu) {
                        this.userMenuSignal.set(data.menu);
                        this.storage.setUserMenu(data.menu);
                        if (data.permissions) {
                            this.userPermissionsSignal.set(data.permissions);
                            this.storage.setUserPermissions(data.permissions);
                        }
                    } else if (Array.isArray(data)) {
                        this.userMenuSignal.set(data);
                        this.storage.setUserMenu(data);
                        const slugs = this.extractSlugs(data);
                        this.userPermissionsSignal.set(slugs);
                        this.storage.setUserPermissions(slugs);
                    }
                }
            })
        );
    }

    getMobileComponents(): Observable<any> {
        return this.gql.query<{ components: any[] }>('security', SECUREX_QUERIES.COMPONENTS).pipe(
            map(d => d.components)
        );
    }

    /** Delegates to requestPasswordReset — same endpoint, kept for semantic clarity */
    adminResetUserPassword(email: string): Observable<any> {
        return this.requestPasswordReset(email);
    }

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

    checkPermission(slug: string): boolean {
        if (this.isAdmin) return true;
        return this.userPermissionsSignal().includes(slug);
    }

    hasRouteAccess(route: string): boolean {
        if (this.isAdmin) return true;
        if (route === '/home' || route === 'home' || route === '') return true;

        const findRoute = (items: any[]): boolean => {
            for (const item of items) {
                const itemRoute = item.route?.startsWith('/') ? item.route : `/${item.route}`;
                const targetRoute = route.startsWith('/') ? route : `/${route}`;
                if (itemRoute === targetRoute || (targetRoute.startsWith(itemRoute) && targetRoute[itemRoute.length] === '/')) return true;
                if (item.children && findRoute(item.children)) return true;
            }
            return false;
        };

        return findRoute(this.userMenuSignal());
    }

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

    public sessionExpiredToastShown = false;

    async logout() {
        this.sessionExpiredToastShown = false;
        const refreshToken = this.storage.getRefreshToken();
        const accessToken = this.storage.getAccessToken();

        if (this.swPush.isEnabled) {
            firstValueFrom(this.swPush.subscription)
                .then(sub => {
                    if (sub) {
                            firstValueFrom(
                                this.http.delete(`${this.configService.notificationApiUrl}/notifications/devices`, {
                                    body: { device_token: JSON.stringify(sub) }
                                })
                            ).catch(() => {});
                        }
                    })
                    .catch(() => {});
        }

        if (refreshToken && accessToken) {
            this.http.post(`${this.configService.apiUrl}/auth/logout`, { refresh_token: refreshToken })
                .subscribe({ error: () => {} });
        }

        this.storage.clearSession();
        this.currentUserSignal.set(null);
        this.userMenuSignal.set([]);
        this.userPermissionsSignal.set([]);
        this.userCompaniesSignal.set([]);
        this.userBranchesSignal.set([]);
        this.router.navigate(['/login']);
    }
}
