import { Component, inject, HostListener, OnInit, signal, computed, ViewEncapsulation, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { LayoutService } from '@core/services/layout.service';
import { AuthService } from '@core/services/auth.service';
import { StorageService } from '@core/services/storage.service';
import { NotificationPanelService } from '@shared/services/notification-panel.service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

interface MenuItem {
  icon: string;
  label: string;
  path?: string;
  module?: string;
  children?: MenuItem[];
}

const ICON_MAP: Record<string, string> = {
  dashboard: 'pi pi-th-large',
  home: 'pi pi-home',
  user: 'fas fa-user',
  profile: 'fas fa-user',
  settings: 'pi pi-cog',
  config: 'pi pi-cog',
  report: 'pi pi-chart-bar',
  list: 'pi pi-list',
  calendar: 'pi pi-calendar',
};

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationPanelComponent],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MobileNavComponent implements OnInit {
  private layoutService = inject(LayoutService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private storage = inject(StorageService);
  notifPanel = inject(NotificationPanelService);
  private destroyRef = inject(DestroyRef);

  branch = signal<any>(null);
  sidebarOpen = this.layoutService.sidebarOpen;
  mobileComponents = signal<any[]>([]);
  currentUrl = signal<string>(this.router.url);

  visibleMenuItems = computed(() => {
    const components = this.mobileComponents();
    const items = components.map(item => {
      const rawIcon = item.icon || '';
      let icon = rawIcon;
      if (!rawIcon.startsWith('pi ') && !rawIcon.includes(' ')) {
        icon = ICON_MAP[rawIcon.toLowerCase()] || 'pi pi-circle';
      }
      const rawPath = item.route || '';
      const cleanedPath = rawPath.trim().replace(/^\/+/, '');
      const path = cleanedPath ? '/' + cleanedPath : undefined;
      return { label: item.name, icon, path, module: item.slug };
    });
    return items;
  });

  activeIndex = computed(() => {
    const url = this.currentUrl();
    const items = this.visibleMenuItems();
    return items.findIndex(item => {
      if (!item.path) return false;
      return url === item.path || (item.path !== '/' && url.startsWith(item.path + '/'));
    });
  });

  indicatorLeft = computed(() => {
    const idx = this.activeIndex();
    const total = this.visibleMenuItems().length;
    if (total === 0) return 50;
    if (idx < 0) return -100;
    return (idx / total) * 100 + (50 / total);
  });

  ngOnInit() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(e => this.currentUrl.set(e.urlAfterRedirects));

    const branch = this.storage.getBranch();
    if (branch) {
      this.branch.set(branch);
    }

    this.authService.getMobileComponents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data || res;
          let components = Array.isArray(data) ? data : [];
          
          if (components.length === 0) {
            components = this.getFallbackMenu();
          }
          this.mobileComponents.set(components);
        },
        error: () => {
          this.mobileComponents.set(this.getFallbackMenu());
        }
      });

    if (this.authService.userMenu().length === 0) {
      this.authService.refreshPermissions()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }

    this.notifPanel.loadNotifications();
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  closeSidebar(): void {
    this.layoutService.closeSidebar();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSidebar();
  }

  private getFallbackMenu(): any[] {
    const menu = this.authService.userMenu();
    return menu.slice(0, 5).map(m => ({
       icon: m.icon || 'pi-circle',
       name: m.name,
       route: m.route || (m.children && m.children.length > 0 ? m.children[0].route : undefined),
       slug: m.slug
    })).filter(c => !!c.route);
  }
}
