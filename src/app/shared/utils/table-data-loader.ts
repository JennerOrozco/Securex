import { signal } from '@angular/core';
import { Observable } from 'rxjs';
import { parseLazyLoadEvent } from './pagination-utils';
import { NotificationService } from '@core/services/notification.service';

export class TableDataLoader<T = any> {
  data = signal<T[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);

  constructor(
    private fetchFn: (page: number, limit: number, filter: any, sort: any) => Observable<any>,
    private notificationService: NotificationService,
    private errorMsg: string = 'Error al cargar datos'
  ) {}

  /**
   * Carga los datos de la tabla basándose en el evento LazyLoad de PrimeNG.
   */
  load(event?: any) {
    this.loading.set(true);
    const { page, limit, filter, sort } = parseLazyLoadEvent(event);
    
    this.fetchFn(page, limit, filter, sort).subscribe({
      next: (res: any) => {
        this.data.set(res?.data || []);
        this.total.set(res?.total || 0);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.notificationService.error(this.errorMsg);
      }
    });
  }
}
