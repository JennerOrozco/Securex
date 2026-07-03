import { Component, Input, OnChanges, SimpleChanges, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '@core/services/notification.service';
import { extractPaginatedData } from '@shared/utils/pagination-utils';
import { handleApiState } from '@shared/utils/rxjs-utils';

@Component({ template: '' })
export abstract class BaseCrudWidgetComponent<T = any> implements OnChanges {
  @Input() entity_type: string = '';
  @Input() entity_uuid: string = '';

  protected destroyRef = inject(DestroyRef);
  protected notificationService = inject(NotificationService);

  // 1. Firmas funcionales de tu propuesta (Estrictamente CRUD)
  protected fnFetch?: (entityType: string, entityUuid: string) => Observable<any>;
  protected fnCreate?: (data: any) => Observable<any>;
  protected fnUpdate?: (id: any, data: any) => Observable<any>;
  protected fnDelete?: (id: any) => Observable<any>;

  // 2. Parámetros de configuración simplificados
  protected primaryKey: string = 'uuid';
  protected resourceName: string = 'registro';

  // 3. Estados mínimos indispensables
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  items = signal<T[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['entity_uuid'] && this.entity_uuid) {
      this.fetch();
    }
  }

  // --- ACCIÓN: FETCH ---
  fetch(): void {
    if (!this.fnFetch || !this.entity_uuid) return;

    this.fnFetch(this.entity_type, this.entity_uuid)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((res: any) => extractPaginatedData<T>(res)),
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: undefined,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => this.loading.set(state),
          errorMessage: `Error al cargar ${this.resourceName}`
        })
      )
      .subscribe({
        next: (res: { data: T[] }) => this.items.set(res.data ?? [])
      });
  }

  // --- ACCIÓN: CREATE ---
  create(data: any): Observable<any> {
    if (!this.fnCreate) {
      throw new Error(`[Architecture]: 'fnCreate' no definida en ${this.constructor.name}`);
    }

    return this.fnCreate(data).pipe(
      takeUntilDestroyed(this.destroyRef),
      handleApiState({
        destroyRef: this.destroyRef,
        cdr: undefined,
        notificationService: this.notificationService,
        onStateChange: (state: boolean) => this.saving.set(state),
        errorMessage: `Error al crear ${this.resourceName}`
      })
    );
  }

  // --- ACCIÓN: UPDATE ---
  update(id: any, data: any): Observable<any> {
    if (!this.fnUpdate) {
      throw new Error(`[Architecture]: 'fnUpdate' no definida en ${this.constructor.name}`);
    }

    return this.fnUpdate(id, data).pipe(
      takeUntilDestroyed(this.destroyRef),
      handleApiState({
        destroyRef: this.destroyRef,
        cdr: undefined,
        notificationService: this.notificationService,
        onStateChange: (state: boolean) => this.saving.set(state),
        errorMessage: `Error al actualizar ${this.resourceName}`
      })
    );
  }

  // --- ACCIÓN: DELETE ---
  delete(item: T): void {
    if (!this.fnDelete) {
      throw new Error(`[Architecture]: 'fnDelete' no definida en ${this.constructor.name}`);
    }

    const id = (item as any)[this.primaryKey];
    this.notificationService.info(`Eliminando ${this.resourceName}...`);

    this.fnDelete(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: undefined,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => this.saving.set(state),
          successMessage: `${this.resourceName} eliminado`,
          errorMessage: `Error al eliminar ${this.resourceName}`
        })
      )
      .subscribe({
        next: () => this.fetch()
      });
  }
}