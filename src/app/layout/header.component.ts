import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '@core/services/auth.service';
import { NotificationService, AppNotification } from '@core/services/notification.service';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
    public authService = inject(AuthService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    private document = inject(DOCUMENT);
    isFullscreen = false;

    get currentUser(): User | null {
        return this.authService.currentUser();
    }

    get currentCompany(): any {
        return this.authService.currentCompany();
    }
    get currentBranch(): any {
        return this.authService.currentBranch();
    }
    isMenuOpen = false;
    showNotifications = false;

    notifications: AppNotification[] = [];

    get unreadCount(): number {
        return this.notifications.filter(n => !n.is_read).length;
    }

    ngOnInit(): void {
        this.loadNotifications();
    }

    loadNotifications(): void {
        this.notificationService.getNotifications().subscribe({
            next: (res) => {
                this.notifications = res ?? [];
                this.cdr.detectChanges();
            },
            error: () => {
                this.notifications = [];
                this.cdr.detectChanges();
            }
        });
    }

    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;
        if (this.showNotifications) {
            this.isMenuOpen = false;
            this.loadNotifications();
        }
    }

    markAsRead(id: number): void {
        const notif = this.notifications.find(n => n.id === id);
        if (!notif) return;
        if (!notif.is_read) {
            notif.is_read = true;
            this.notificationService.markAsRead(id).subscribe({
                error: () => {
                    notif.is_read = false;
                    this.cdr.detectChanges();
                }
            });
        }
        if (notif.route_url) {
            this.router.navigateByUrl(notif.route_url);
            this.showNotifications = false;
        }
    }

    deleteNotification(id: number, event: MouseEvent): void {
        event.stopPropagation(); // Evitar que se marque como leída o navegue
        this.notificationService.deleteNotification(id).subscribe({
            next: () => {
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.cdr.detectChanges();
            },
            error: () => {
                alert('Error al eliminar la notificación');
            }
        });
    }

    markAllAsRead(): void {
        this.notifications.forEach(n => {
            if (!n.is_read) {
                n.is_read = true;
                this.notificationService.markAsRead(n.id).subscribe({
                    error: () => {
                        n.is_read = false;
                        this.cdr.detectChanges();
                    }
                });
            }
        });
    }

    timeAgo(dateStr: string): string {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Ahora';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `Hace ${diffHour}h`;
        const diffDay = Math.floor(diffHour / 24);
        if (diffDay === 1) return 'Ayer';
        if (diffDay < 7) return `Hace ${diffDay} días`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    toggleFullscreen(): void {
        if (!this.isFullscreen) {
            const elem = this.document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
        } else {
            if (this.document.exitFullscreen) this.document.exitFullscreen();
        }
        this.isFullscreen = !this.isFullscreen;
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
        this.isMenuOpen = false;
        this.showNotifications = false;
    }

    testPush(): void {
        const user = this.authService.currentUserValue;
        const company = this.authService.currentCompany();
        if (user && company) {
            this.notificationService.sendTestNotification(user.uuid, company.uuid).subscribe({
                next: () => alert('Notificación de prueba enviada!'),
                error: (err: any) => alert('Error al enviar prueba: ' + err.message)
            });
        } else {
            alert('Debes estar logueado para probar las notificaciones.');
        }
    }
}
