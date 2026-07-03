import { Injectable } from '@angular/core';
import { User, Company, Branch } from '@shared/types';

/** @deprecated Use `User` from '@shared/types' */
export type StoredUser = User;
/** @deprecated Use `Company` from '@shared/types' */
export type StoredCompany = Company;
/** @deprecated Use `Branch` from '@shared/types' */
export type StoredBranch = Branch;


@Injectable({ providedIn: 'root' })
export class StorageService {
  private safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try { return JSON.parse(raw) as T; }
    catch { return null; }
  }

  // ── Access Token ──────────────────────────────────────────
  getAccessToken(): string | null { return sessionStorage.getItem('accessToken'); }
  setAccessToken(token: string): void { sessionStorage.setItem('accessToken', token); }
  removeAccessToken(): void { sessionStorage.removeItem('accessToken'); }

  // ── Refresh Token ─────────────────────────────────────────
  getRefreshToken(): string | null { return sessionStorage.getItem('refreshToken'); }
  setRefreshToken(token: string): void { sessionStorage.setItem('refreshToken', token); }
  removeRefreshToken(): void { sessionStorage.removeItem('refreshToken'); }

  // ── Current User ──────────────────────────────────────────
  getUser(): StoredUser | null { return this.safeParse<StoredUser>(localStorage.getItem('currentUser')); }
  setUser(user: StoredUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  removeUser(): void { localStorage.removeItem('currentUser'); }

  // ── Current Company ───────────────────────────────────────
  getCompany(): StoredCompany | null { return this.safeParse<StoredCompany>(localStorage.getItem('currentCompany')); }
  setCompany(company: StoredCompany): void {
    localStorage.setItem('currentCompany', JSON.stringify(company));
  }
  removeCompany(): void { localStorage.removeItem('currentCompany'); }

  // ── Current Branch ────────────────────────────────────────
  getBranch(): StoredBranch | null { return this.safeParse<StoredBranch>(localStorage.getItem('currentBranch')); }
  setBranch(branch: StoredBranch): void {
    localStorage.setItem('currentBranch', JSON.stringify(branch));
  }
  removeBranch(): void { localStorage.removeItem('currentBranch'); }

  // ── User Companies List ───────────────────────────────────
  getUserCompanies(): StoredCompany[] { return this.safeParse<StoredCompany[]>(localStorage.getItem('userCompanies')) ?? []; }
  setUserCompanies(companies: StoredCompany[]): void {
    localStorage.setItem('userCompanies', JSON.stringify(companies));
  }
  removeUserCompanies(): void { localStorage.removeItem('userCompanies'); }

  // ── User Branches List ────────────────────────────────────
  getUserBranches(): StoredBranch[] { return this.safeParse<StoredBranch[]>(localStorage.getItem('userBranches')) ?? []; }
  setUserBranches(branches: StoredBranch[]): void {
    localStorage.setItem('userBranches', JSON.stringify(branches));
  }
  removeUserBranches(): void { localStorage.removeItem('userBranches'); }

  // ── User Menu ─────────────────────────────────────────────
  getUserMenu(): any[] { return this.safeParse<any[]>(localStorage.getItem('userMenu')) ?? []; }
  setUserMenu(menu: any[]): void { localStorage.setItem('userMenu', JSON.stringify(menu)); }
  removeUserMenu(): void { localStorage.removeItem('userMenu'); }

  // ── User Permissions ──────────────────────────────────────
  getUserPermissions(): string[] { return this.safeParse<string[]>(localStorage.getItem('userPermissions')) ?? []; }
  setUserPermissions(permissions: string[]): void {
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
  }
  removeUserPermissions(): void { localStorage.removeItem('userPermissions'); }

  // ── Bulk ──────────────────────────────────────────────────
  clearSession(): void {
    this.removeAccessToken();
    localStorage.removeItem('accessToken'); // Limpiar token legacy por si acaso
    this.removeRefreshToken();
    this.removeUser();
    this.removeCompany();
    this.removeBranch();
    this.removeUserCompanies();
    this.removeUserBranches();
    this.removeUserMenu();
    this.removeUserPermissions();
  }
}
