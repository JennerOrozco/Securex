import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { NotificationPanelService } from '@shared/services/notification-panel.service';
import { LayoutService } from '@core/services/layout.service';
import { NotificationPanelComponent } from './notification-panel/notification-panel.component';
import { TiktokBadgeComponent } from '../shared/components/tiktok-badge/tiktok-badge.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, NotificationPanelComponent, TiktokBadgeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

    ngOnInit(): void {
        this.notifPanel.loadNotifications();
    }
    public authService = inject(AuthService);
    notifPanel = inject(NotificationPanelService);
    layoutService = inject(LayoutService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    private document = inject(DOCUMENT);
    isFullscreen = signal(false);

    currentUser = computed(() => this.authService.currentUser());
    currentCompany = computed(() => this.authService.currentCompany());
    currentBranch = computed(() => this.authService.currentBranch());
    isMenuOpen = signal(false);

    toggleFullscreen(): void {
        if (!this.isFullscreen()) {
            const elem = this.document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
        } else {
            if (this.document.exitFullscreen) this.document.exitFullscreen();
        }
        this.isFullscreen.update(v => !v);
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
        this.isMenuOpen.set(false);
        this.notifPanel.closePanel();
    }

    testPush(): void {
        const user = this.authService.currentUserValue;
        const company = this.authService.currentCompany();
        if (user && company) {
            this.notificationService.sendTestNotification(user.uuid, company.uuid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: () => this.notificationService.success('Notificación de prueba enviada!'),
                error: (err: any) => this.notificationService.error('Error al enviar prueba: ' + err.message)
            });
        } else {
            this.notificationService.error('Debes estar logueado para probar las notificaciones.');
        }
    }
}
