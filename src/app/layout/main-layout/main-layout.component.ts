import { Component, OnInit, signal, DestroyRef, inject, input, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { HeaderComponent } from '../header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, MobileNavComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  layout = input<string | undefined>();
  isFullLayout = signal(false);

  constructor() {
    effect(() => {
      this.isFullLayout.set(this.layout() === 'full');
    });
  }

  ngOnInit(): void {
    if (this.authService.userMenu().length === 0) {
      this.authService.refreshPermissions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }
}
