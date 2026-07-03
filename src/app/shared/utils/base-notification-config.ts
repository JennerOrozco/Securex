import { OnInit, Directive, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { parseLazyLoadEvent, extractPaginatedData } from '@shared/utils/pagination-utils';
import { handleApiState } from './rxjs-utils';
import { FormMapperService, MappingConfig } from '@core/services/form-mapper.service';
import { BaseTreeComponent } from './base-crud/base-tree.component';

/**
 * @deprecated Usar UnifiedCrudService en lugar de herencia.
 * 
 * Esta clase mantiene compatibilidad hacia atrás pero se recomienda migrar a:
 * `UnifiedCrudService` ubicado en `src/app/shared/crud-base/unified-crud.service.ts`
 * 
 * Ventajas de UnifiedCrudService:
 * - Composición en lugar de herencia (4 niveles → 0 niveles)
 * - Signals moderno (Angular 21+)
 * - Más fácil de testear
 * - Mejor performance
 * - Código más explícito
 * 
 * @example ANTES (heredando BaseNotificationConfigComponent)
 * export class MyListComponent extends BaseNotificationConfigComponent<MyEntity> {
 *   override fnFetch = this.service.getPaginated.bind(this.service);
 *   override fnCreate = this.service.create.bind(this.service);
 *   // ... más boilerplate
 * }
 * 
 * @example DESPUÉS (usando UnifiedCrudService)
 * export class MyListComponent implements OnInit {
 *   crud = inject(UnifiedCrudService<MyEntity>);
 * 
 *   ngOnInit() {
 *     this.crud.initialize({
 *       fnFetch: this.service.getPaginated.bind(this.service),
 *       fnCreate: this.service.create.bind(this.service),
 *       resourceName: 'Entidad'
 *     });
 *     this.crud.load();
 *   }
 * }
 */
@Directive()
export abstract class BaseNotificationConfigComponent<T = any> extends BaseTreeComponent<T> implements OnInit {
  protected formMapper = inject(FormMapperService);

  // =========================================================================
  //  DELEGADOS DECLARATIVOS (Function Pointers)
  // =========================================================================

  protected fnFetch?: (page: number, limit: number, filter: any, sort: any) => Observable<any>;
  protected fnCreate?: (data: any) => Observable<any>;
  protected fnUpdate?: (id: any, data: any) => Observable<any>;
  protected fnDelete?: (id: any) => Observable<any>;
  protected mapFn?: (item: any) => T;
  protected noInlineSave = false;
  protected mapItemKey?: (item: any) => any;

  /** Configuración opcional de FormMapperService para auto-sanitizar y castear cargas en save() */
  protected mappingConfig?: MappingConfig;

  // =========================================================================
  //  MÉTODOS DE ORQUESTACIÓN HÍBRIDA
  // =========================================================================

  loadSettings(event?: any): void | Observable<any> {
    if (this.fnFetch) {
      const { page, limit, filter, sort } = parseLazyLoadEvent(event, this.defaultSortKey, this.columnMap);
      return this.fnFetch(page, limit, filter, sort);
    }
    throw new Error(`[Architecture]: El componente ${this.constructor.name} requiere 'fnFetch'`);
  }

  /**
   * Persiste un item en el backend. Delega la operación a `fnCreate` o `fnUpdate`.
   * Si el componente tiene `noInlineSave = true` (add/edit ruteados), retorna of(null).
   * Para extraer el id en modo edit, usa mapItemKey si está definido, sino data[primaryKey].
   */
  saveSetting(data: any, mode: 'add' | 'edit'): Observable<any> {
    if (this.noInlineSave) return of(null);
    if (mode === 'add' && this.fnCreate) return this.fnCreate(data);
    if (mode === 'edit' && this.fnUpdate) {
      const raw = this.selectedItem ?? data;
      const id = this.mapItemKey ? this.mapItemKey(raw) : raw[this.primaryKey];
      return this.fnUpdate(id, data);
    }
    throw new Error(`[Architecture]: El componente ${this.constructor.name} requiere 'fnCreate' y 'fnUpdate'. Si el CRUD es ruteado, asigna 'noInlineSave = true'.`);
  }

  /**
   * Elimina un registro del backend. Usa mapItemKey si está definido para extraer el id,
   * sino usa item[primaryKey].
   */
  deleteSetting(item: T): Observable<any> {
    if (this.fnDelete) {
      const id = this.mapItemKey ? this.mapItemKey(item) : (item as any)[this.primaryKey];
      return this.fnDelete(id);
    }
    throw new Error(`[Architecture]: El componente ${this.constructor.name} requiere 'fnDelete'`);
  }

  // =========================================================================
  //  CICLO DE VIDA
  // =========================================================================

  ngOnInit(): void {
    if (this.autoLoadOnInit) {
      this.load();
    }
  }

  // =========================================================================
  //  ORQUESTACIÓN CENTRALIZADA
  // =========================================================================

  load(event?: any): void {
    if (this.isTreeTable) {
      this.loadTree();
      return;
    }

    this.loading = this.tableLoading = true;
    this.cdr.markForCheck();

    try {
      const result = this.loadSettings(event);

      if (result instanceof Observable) {
        result
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            map((res: any) => extractPaginatedData<T>(res, this.mapFn)),
            finalize(() => {
              this.loading = this.tableLoading = false;
              this.cdr.markForCheck();
            })
          )
          .subscribe({
            next: (res: { data: T[]; total: number }) => {
              this.items = res.data ?? [];
              this.totalRecords = res.total ?? 0;
            },
            error: () => {
              this.notificationService.error(`Error al cargar el listado de ${this.resourceName}`);
            }
          });
      }

    } catch {
      this.loading = this.tableLoading = false;
      this.cdr.markForCheck();
    }
  }

  private loadTree(): void {
    this.loading = this.tableLoading = true;
    this.cdr.markForCheck();

    this.loadTreeData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = this.tableLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.rawItems = data || [];
          if (this.mapToTreeNodes) {
            this.treeData = this.mapToTreeNodes(this.rawItems);
          }
        },
        error: () => {
          this.notificationService.error(`Error al cargar el árbol de ${this.resourceName}`);
        }
      });
  }

  protected wrapLoading<V>(obs: Observable<V>): Observable<V> {
    return obs.pipe(
      finalize(() => {
        this.loading = this.tableLoading = false;
        this.cdr.markForCheck();
      })
    );
  }

  save(eventData: any, mode?: 'add' | 'edit'): void {
    const rawData = eventData?.data ?? eventData;
    const saveMode: 'add' | 'edit' = eventData?.mode ?? (mode as 'add' | 'edit');

    if (this.isTreeTable && saveMode === 'add') {
      rawData.parent_id = this.currentParentId;
    }

    const dataToSave = this.mappingConfig 
      ? this.formMapper.mapPayload(rawData, { ...this.mappingConfig, mode: saveMode }) 
      : rawData;

    const accion = saveMode === 'add' ? 'creado' : 'actualizado';

    this.saveSetting(dataToSave, saveMode)
      .pipe(
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: this.cdr,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => this.isSaving = state,
          successMessage: `${this.resourceName} ${accion} correctamente`
        })
      )
      .subscribe({
        next: () => {
          this.modalVisible = false;
          this.selectedItem = null;
          this.load();
        }
      });
  }

  protected saveWithForm(formGroup: FormGroup, preProcessFn?: (data: any) => any): void {
    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      return;
    }

    let rawData = formGroup.getRawValue();
    const saveMode = this.modalMode as 'add' | 'edit';

    if (this.isTreeTable && saveMode === 'add') {
      rawData.parent_id = this.currentParentId;
    }

    if (preProcessFn) {
      rawData = preProcessFn(rawData);
    }

    const dataToSave = this.mappingConfig 
      ? this.formMapper.mapPayload(rawData, { ...this.mappingConfig, mode: saveMode }) 
      : rawData;

    const accion = saveMode === 'add' ? 'creado' : 'actualizado';

    this.saveSetting(dataToSave, saveMode)
      .pipe(
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: this.cdr,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => this.isSaving = state,
          successMessage: `${this.resourceName} ${accion} correctamente`
        })
      )
      .subscribe({
        next: () => {
          this.modalVisible = false;
          this.selectedItem = null;
          this.load();
        }
      });
  }

  confirmDelete(item?: T): void {
    if (item) this.selectedItem = item;
    if (!this.selectedItem) return;

    this.deleteSetting(this.selectedItem)
      .pipe(
        handleApiState({
          destroyRef: this.destroyRef,
          cdr: this.cdr,
          notificationService: this.notificationService,
          onStateChange: (state: boolean) => this.isSaving = state,
          successMessage: `${this.resourceName} eliminado(a) correctamente`
        })
      )
      .subscribe({
        next: () => {
          this.modalVisible = false;
          this.selectedItem = null;
          this.load();
        }
      });
  }
}