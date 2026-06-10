import { Component, inject, HostListener, OnInit, signal, computed, ViewEncapsulation, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { LayoutService } from '@core/services/layout.service';
import { AuthService } from '@core/services/auth.service';
import { StorageService } from '@core/services/storage.service';
import { NotificationPanelService } from '@shared/services/notification-panel.service';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  imports: [CommonModule, RouterLink, TimeAgoPipe],
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

  // Touch properties for swipe to delete
  activeSwipeId = signal<number | null>(null);
  currentDeltaX = signal<number>(0);
  private touchStartX = 0;
  private hasVibrated = false;

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
    return items.findIndex(item => item.path && url.startsWith(item.path));
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
          this.mobileComponents.set(Array.isArray(data) ? data : []);
        },
        error: () => {}
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

  onTouchStart(event: TouchEvent, id: number) {
    this.touchStartX = event.touches[0].clientX;
    this.activeSwipeId.set(id);
    this.currentDeltaX.set(0);
    this.hasVibrated = false;
  }

  onTouchMove(event: TouchEvent, id: number) {
    if (this.activeSwipeId() !== id) return;
    const currentX = event.touches[0].clientX;
    const delta = currentX - this.touchStartX;
    if (delta > 0) {
      this.currentDeltaX.set(delta);
      
      if (delta > 120 && !this.hasVibrated) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        this.hasVibrated = true;
      } else if (delta <= 120) {
        this.hasVibrated = false;
      }
    }
  }

  onTouchEnd(event: TouchEvent, id: number) {
    if (this.activeSwipeId() !== id) return;
    
    if (this.currentDeltaX() > 120) {
      this.notifPanel.deleteNotification(id);
    }
    
    this.activeSwipeId.set(null);
    this.currentDeltaX.set(0);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSidebar();
  }
}





