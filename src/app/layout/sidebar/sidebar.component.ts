import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LayoutService } from '@core/services/layout.service';
import { delay } from 'rxjs';


interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  children?: MenuItem[];
  module?: string;
}

interface ContextSection {
  label: string;
  items: ContextItem[];
}

interface ContextItem {
  label: string;
  companyUuid: string;
  branchUuid: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private layoutService = inject(LayoutService);

  sidebarOpen = this.layoutService.sidebarOpen;

  user = computed(() => this.authService.currentUser());
  company = computed(() => this.authService.currentCompany());
  branch = computed(() => this.authService.currentBranch());

  userCompanies = computed(() => this.authService.userCompanies());
  userBranches = computed(() => this.authService.userBranches());

  hasMultipleContexts = computed(() => {
    if (this.userCompanies().length > 1) return true;
    if (this.userBranches().length > 1) return true;
    return false;
  });

  contextSections = computed<ContextSection[]>(() => {
    const sections: ContextSection[] = [];
    const currentCompany = this.company();
    const currentBranch = this.branch();
    const companies = this.userCompanies();
    const branches = this.userBranches();

    // Section 1: Current company's branches (if multiple)
    if (branches.length > 1) {
      sections.push({
        label: currentCompany?.name || 'Sucursales',
        items: branches.map(br => ({
          label: br.name,
          companyUuid: currentCompany?.uuid || '',
          branchUuid: br.uuid,
          isActive: br.uuid === currentBranch?.uuid
        }))
      });
    }

    // Section 2: Other companies (show with their default branch)
    const otherCompanies = companies.filter(c => c.uuid !== currentCompany?.uuid);
    if (otherCompanies.length > 0) {
      sections.push({
        label: 'Otras compañías',
        items: otherCompanies.map(c => ({
          label: c.branch_name ? `${c.name} — ${c.branch_name}` : c.name,
          companyUuid: c.uuid,
          branchUuid: null,
          isActive: false
        }))
      });
    }

    // If only one company with one branch, no sections (no switcher needed)
    return sections;
  });

  showContextSwitcher = signal(false);
  switchingCompany = signal(false);

  expandedMenus = signal<Set<string>>(new Set());

  // El menú viene ahora dinámicamente del servicio
  visibleMenuItems = computed(() => {
    const menu = this.authService.userMenu();
    console.log('Sidebar: Recalculating visible items', menu);
    return this.mapMenuToItems(menu);
  });

  private mapMenuToItems(items: any[]): MenuItem[] {
    console.log('Sidebar: Mapping items', items.length);
    return items.map(item => ({
      label: item.name,
      icon: item.icon || 'pi pi-circle',
      path: item.route,
      module: item.slug,
      children: item.children ? this.mapMenuToItems(item.children) : undefined
    }));
  }

  toggleSubmenu(label: string) {
    const current = new Set(this.expandedMenus());
    if (current.has(label)) {
      current.delete(label);
    } else {
      current.add(label);
    }
    this.expandedMenus.set(current);
  }

  collapseAll() {
    this.expandedMenus.set(new Set());
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().has(label);
  }

  ngOnInit() {
    // Refresh permissions on init if needed (though Guard usually does it)
    if (this.authService.userMenu().length === 0) {
      this.authService.refreshPermissions().subscribe();
    }
  }

  closeSidebar() {
    this.layoutService.closeSidebar();
  }

  toggleContextSwitcher() {
    if (this.hasMultipleContexts()) {
      this.showContextSwitcher.update(v => !v);
    }
  }

  selectContext(item: ContextItem) {
    this.showContextSwitcher.set(false);

    // Same company, different branch
    if (item.companyUuid === this.company()?.uuid && item.branchUuid && item.branchUuid !== this.branch()?.uuid) {
      this.switchingCompany.set(true);
      this.authService.switchBranch(item.branchUuid).pipe(delay(1000)).subscribe({
        next: () => window.location.reload(),
        error: () => this.switchingCompany.set(false)
      });
      return;
    }

    // Different company
    if (item.companyUuid !== this.company()?.uuid) {
      this.switchingCompany.set(true);
      this.authService.switchCompany(item.companyUuid).pipe(delay(1000)).subscribe({
        next: () => window.location.reload(),
        error: () => this.switchingCompany.set(false)
      });
      return;
    }
  }

  logout() {
    this.authService.logout();
  }
}




