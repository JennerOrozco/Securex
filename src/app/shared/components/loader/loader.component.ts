import { Component, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `<div class="loader-bar"></div>`,
  styleUrl: './loader.component.css',
  host: { '[class.loading]': 'loadingService.isLoading()' }
})
export class LoaderComponent {
  protected readonly loadingService = inject(LoadingService);
}
