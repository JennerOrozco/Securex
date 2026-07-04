import {
  Injectable,
  signal,
  computed,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, of, forkJoin } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { TreeNode } from 'primeng/api';

import { LoggerService } from '@core/services/logger.service';
import { NotificationService } from '@core/services/notification.service';
import { FormMapperService, MappingConfig } from '@core/services/form-mapper.service';
import { CatalogCacheService } from '@shared/services/catalog-cache.service';

import {
  parseLazyLoadEvent,
  extractPaginatedData
} from '@shared/utils/pagination-utils';
import { normalizeBoolean } from '@shared/utils/form-utils';
import { extractApiArray } from '@shared/utils/api-payload.utils';

export type CrudMode = 'add' | 'edit' | 'delete' | 'view';

/**
 * Eventos del ciclo de vida para operaciones CRUD
 */
export interface CrudHooks<T = any> {
  /** Se ejecuta antes de abrir el modal. Permite modificar opciones u estado extra. */
  onBeforeModalOpen?: (mode: CrudMode, item?: T) => void | Promise<void>;
  /** Se ejecuta antes de llamar a fnCreate / fnUpdate. Permite alterar el payload o abortar (retornando un valor modificado). */
  onBeforeSave?: (data: any, mode: CrudMode) => any | Promise<any>;
  /** Se ejecuta después de guardar con éxito. */
  onAfterSave?: (res: any, mode: CrudMode) => void;
  /** Se ejecuta antes de eliminar. Retornar false o lanzar error para abortar. */
  onBeforeDelete?: (item: T) => boolean | Promise<boolean>;
  /** Se ejecuta después de eliminar con éxito. */
  onAfterDelete?: (res: any) => void;
}

/**
 * Configuración para UnifiedCrudService
 */
export interface CrudConfig<T = any> {
  /** Función para cargar datos paginados */
  fnFetch?: (page: number, limit: number, filter?: any, sort?: any) => Observable<any>;
  /** Función para crear un nuevo registro */
  fnCreate?: (data: any) => Observable<any>;
  /** Función para actualizar un registro */
  fnUpdate?: (id: any, data: any) => Observable<any>;
  /** Función para eliminar un registro */
  fnDelete?: (id: any) => Observable<any>;
  /** Transformar item del backend */
  mapFn?: (item: any) => T;
  /** Extraer ID de un item (si no es 'uuid') */
  mapItemKey?: (item: any) => any;
  /** Nombre del recurso (ej: 'Usuario', 'Categoría') */
  resourceName: string;
  /** Configuración de mapeo de formulario (sanitización) */
  mappingConfig?: Omit<MappingConfig, 'mode'>;
  /** Catálogos a pre-cargar (key -> function pointer) */
  fnCatalogs?: Record<string, () => Observable<any>>;
  /** Key primaria (default: 'uuid') */
  primaryKey?: string;
  /** Sort default (default: 'created_at') */
  defaultSortKey?: string;
  /** Mapeo de columnas frontend -> backend */
  columnMap?: Record<string, string>;
  /** Hooks del ciclo de vida (eventos) */
  hooks?: CrudHooks<T>;
  /** Si es true, el servicio usará loadTree() en lugar de loadPaginated() */
  isTreeMode?: boolean;
  /** Función para cargar el árbol completo (retorna array de items backend) */
  fnFetchTree?: () => Observable<any[]>;
  /** Transformador de items backend a TreeNodes de PrimeNG */
  mapTreeFn?: (items: any[]) => any[];
}

/**
 * UnifiedCrudService - Servicio moderno para CRUDs
 * 
 * Reemplaza la cadena de herencia de 4 niveles:
 * BaseModalComponent → BaseCatalogComponent → BaseTreeComponent → BaseNotificationConfigComponent
 * 
 * Con un enfoque basado en composición y signals (Angular 21+)
 * 
 * @example
 * constructor(private crud = inject(UnifiedCrudService)) {}
 * 
 * ngOnInit() {
 *   this.crud.initialize({
 *     fnFetch: this.service.getPaginated.bind(this.service),
 *     fnCreate: this.service.create.bind(this.service),
 *     fnUpdate: this.service.update.bind(this.service),
 *     fnDelete: this.service.delete.bind(this.service),
 *     resourceName: 'Usuario',
 *     fnCatalogs: { roles: () => this.service.getRoles() }
 *   });
 *   this.crud.load();
 * }
 */
@Injectable()
export class UnifiedCrudService<T = any> {
  private logger = inject(LoggerService);
  private notification = inject(NotificationService);
  public formMapper = inject(FormMapperService);
  private catalogCache = inject(CatalogCacheService);
  private destroyRef = inject(DestroyRef);

  // =========================================================================
  // STATE - Signals (Angular 21 modern state management)
  // =========================================================================

  // Data state
  readonly items = signal<T[]>([]);
  readonly totalRecords = signal(0);
  readonly selectedItem = signal<T | null>(null);

  // Loading state
  readonly loading = signal(false);
  readonly isSaving = signal(false);
  readonly catalogLoading = signal(false);

  // Modal state
  readonly modalVisible = signal(false);
  readonly modalMode = signal<CrudMode>('add');

  // Tree state
  readonly isTreeMode = signal(false);
  readonly treeData = signal<TreeNode[]>([]);
  readonly rawTreeItems = signal<any[]>([]);
  readonly currentParentId = signal<number | null>(null);

  // Catalog state
  readonly catalogItems = signal<Record<string, any[]>>({});

  // Configuration
  private config: CrudConfig<T> | null = null;

  // =========================================================================
  // COMPUTED (derived state)
  // =========================================================================

  readonly modalTitle = computed(() => {
    const mode = this.modalMode();
    const name = this.config?.resourceName || 'Elemento';
    if (mode === 'edit') return `Editar ${name}`;
    if (mode === 'delete') return `Eliminar ${name}`;
    if (mode === 'view') return `Ver ${name}`;
    return `Agregar ${name}`;
  });

  readonly canSave = computed(() => {
    return !this.loading() && !this.isSaving();
  });

  readonly hasSelectedItem = computed(() => {
    return this.selectedItem() !== null;
  });

  readonly resourceName = computed(() => {
    return this.config?.resourceName || '';
  });

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  /**
   * Inicializar el servicio con configuración
   */
  initialize(config: CrudConfig<T>): void {
    this.config = {
      primaryKey: 'uuid',
      defaultSortKey: 'created_at',
      columnMap: {},
      ...config
    };
    
    this.isTreeMode.set(config.isTreeMode ?? false);
  }


  /**
   * Cargar catálogos pre-configurados
   */
  private loadCatalogs(): Observable<Record<string, any[]>> {
    if (!this.config?.fnCatalogs) return of({});

    const entries = Object.entries(this.config.fnCatalogs);
    const observables = entries.map(([key, fn]) =>
      this.catalogCache.getCatalog(key, fn)
    );

    return forkJoin(observables).pipe(
      map(results => {
        return entries.reduce((acc, [key], index) => {
          acc[key] = this.extractCatalogData(results[index]);
          return acc;
        }, {} as Record<string, any[]>);
      })
    );
  }

  private extractCatalogData(res: any): any[] {
    return extractApiArray(res);
  }

  // =========================================================================
  // LOAD OPERATIONS
  // =========================================================================

  /**
   * Cargar datos (paginados o árbol)
   */
  load(event?: any): void {
    if (!this.config) {
      this.logger.error('UnifiedCrudService no está inicializado', {}, 'UnifiedCrudService');
      return;
    }

    if (this.isTreeMode()) {
      this.loadTree();
      return;
    }

    this.loadPaginated(event);
  }

  private loadPaginated(event?: any): void {
    this.loading.set(true);

    const { page, limit, filter, sort } = parseLazyLoadEvent(
      event,
      this.config!.defaultSortKey,
      this.config!.columnMap
    );

    const obs = this.config!.fnFetch?.(page, limit, filter, sort);
    if (!obs) return;

    obs
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(res => extractPaginatedData(res, this.config!.mapFn)),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (res) => {
          this.items.set(res.data ?? []);
          this.totalRecords.set(res.total ?? 0);
        },
        error: (err: any) => {
          this.logger.error(`Error al cargar ${this.config!.resourceName}`, err, 'UnifiedCrudService');
          this.notification.error(`Error al cargar ${this.config!.resourceName}`);
        }
      });
  }

  private loadTree(): void {
    if (!this.config?.fnFetchTree) {
      this.logger.error('No se ha configurado fnFetchTree para el modo árbol', {}, 'UnifiedCrudService');
      return;
    }

    this.loading.set(true);
    
    this.config.fnFetchTree()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(res => {
          const rawItems = extractApiArray(res);
          if (this.config?.mapTreeFn) {
            return this.config.mapTreeFn(rawItems);
          }
          return rawItems;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (nodes) => {
          this.items.set(nodes);
          // Opcional: totalRecords
          this.totalRecords.set(nodes.length);
        },
        error: (err: any) => {
          this.logger.error(`Error al cargar el árbol de ${this.config!.resourceName}`, err, 'UnifiedCrudService');
          this.notification.error(`Error al cargar ${this.config!.resourceName}`);
        }
      });
  }

  // =========================================================================
  // MODAL OPERATIONS
  // =========================================================================

  /**
   * Abrir modal para agregar un nuevo registro
   */
  async handleAdd(): Promise<void> {
    this.modalMode.set('add');
    this.selectedItem.set(null);
    this.currentParentId.set(null);
    
    if (this.config?.hooks?.onBeforeModalOpen) {
      await this.config.hooks.onBeforeModalOpen('add');
    }

    this.ensureCatalogs(() => {
      this.modalVisible.set(true);
    });
  }

  /**
   * Abrir modal para agregar un nuevo registro hijo (Tree)
   */
  async handleAddChild(parentId: number | string): Promise<void> {
    this.modalMode.set('add');
    this.selectedItem.set(null);
    this.currentParentId.set(parentId as number);
    
    if (this.config?.hooks?.onBeforeModalOpen) {
      await this.config.hooks.onBeforeModalOpen('add');
    }

    this.ensureCatalogs(() => {
      this.modalVisible.set(true);
    });
  }

  /**
   * Abrir modal para editar un registro
   */
  async handleEdit(item: T): Promise<void> {
    this.modalMode.set('edit');
    const copy = { ...item } as any;
    if (copy.is_active !== undefined) {
      copy.is_active = normalizeBoolean(copy.is_active);
    }
    this.selectedItem.set(copy as T);
    
    if (this.config?.hooks?.onBeforeModalOpen) {
      await this.config.hooks.onBeforeModalOpen('edit', copy as T);
    }

    this.ensureCatalogs(() => {
      this.modalVisible.set(true);
    });
  }

  /**
   * Preparar modal para eliminar un registro
   */
  handleDelete(item: T): void {
    this.modalMode.set('delete');
    this.selectedItem.set(item);
    this.modalVisible.set(true);
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.modalVisible.set(false);
    this.selectedItem.set(null);
    this.modalMode.set('add');
  }

  /**
   * Asegurar que catálogos están cargados
   */
  public ensureCatalogs(callback: () => void): void {
    if (Object.keys(this.catalogItems()).length > 0) {
      callback();
      return;
    }

    if (!this.config?.fnCatalogs) {
      callback();
      return;
    }

    this.catalogLoading.set(true);
    this.loadCatalogs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.catalogItems.set(data);
          this.catalogLoading.set(false);
          callback();
        },
        error: (err: any) => {
          this.logger.error('Error al cargar catálogos', err, 'UnifiedCrudService');
          this.catalogLoading.set(false);
          callback();
        }
      });
  }

  // =========================================================================
  // SAVE OPERATIONS
  // =========================================================================

  /**
   * Guardar un registro (create o update)
   */
  async save(eventData: any): Promise<void> {
    if (!this.config?.fnCreate && !this.config?.fnUpdate) {
      this.notification.error('CRUD no está completamente configurado');
      return;
    }

    const mode = eventData?.mode ?? this.modalMode() as 'add' | 'edit';
    let dataToSave = eventData?.data ?? eventData;

    if (this.isTreeMode() && mode === 'add' && this.currentParentId() !== null) {
      dataToSave = { ...dataToSave, parent_id: this.currentParentId() };
    }

    // Ejecutar hook de pre-guardado
    if (this.config.hooks?.onBeforeSave) {
      dataToSave = (await this.config.hooks.onBeforeSave(dataToSave, mode)) ?? dataToSave;
    }

    // Mapear datos si es necesario
    if (this.config.mappingConfig) {
      dataToSave = this.formMapper.mapPayload(dataToSave, {
        ...this.config.mappingConfig,
        mode
      } as MappingConfig);
    }

    this.isSaving.set(true);

    const obs = mode === 'add'
      ? this.config.fnCreate!(dataToSave)
      : this.updateExisting(dataToSave);

    obs
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          const action = mode === 'add' ? 'creado' : 'actualizado';
          this.notification.success(`${this.config!.resourceName} ${action} correctamente`);
          
          if (this.config?.hooks?.onAfterSave) {
            this.config.hooks.onAfterSave(res, mode);
          }
          
          this.closeModal();
          this.load();
        },
        error: (err: any) => {
          this.logger.error(`Error al guardar ${this.config!.resourceName}`, err, 'UnifiedCrudService');
          this.notification.error(`Error al guardar ${this.config!.resourceName}`);
        }
      });
  }

  private updateExisting(data: any): Observable<any> {
    if (!this.config?.fnUpdate) {
      return of(null);
    }

    const id = this.config.mapItemKey ? this.config.mapItemKey(data) : (data as any)[this.config.primaryKey!];

    if (!id) {
      this.notification.error('No se pudo identificar el registro a actualizar');
      return of(null);
    }

    return this.config.fnUpdate!(id, data);
  }

  // =========================================================================
  // DELETE OPERATIONS
  // =========================================================================

  /**
   * Confirmar eliminación de un registro
   */
  async confirmDelete(item?: T): Promise<void> {
    if (item) this.selectedItem.set(item);
    if (!this.selectedItem()) return;

    if (!this.config?.fnDelete) {
      this.notification.error('Operación de eliminación no configurada');
      return;
    }

    const selectedItem = this.selectedItem()!;

    if (this.config.hooks?.onBeforeDelete) {
      const proceed = await this.config.hooks.onBeforeDelete(selectedItem);
      if (proceed === false) return;
    }

    this.isSaving.set(true);

    const id = this.config.mapItemKey
      ? this.config.mapItemKey(selectedItem)
      : (selectedItem as any)[this.config.primaryKey!];

    this.config.fnDelete!(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: (res) => {
          this.notification.success(`${this.config!.resourceName} eliminado(a) correctamente`);
          
          if (this.config?.hooks?.onAfterDelete) {
            this.config.hooks.onAfterDelete(res);
          }
          
          this.closeModal();
          this.load();
        },
        error: (err: any) => {
          this.logger.error(`Error al eliminar ${this.config!.resourceName}`, err, 'UnifiedCrudService');
          this.notification.error(`Error al eliminar ${this.config!.resourceName}`);
        }
      });
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  /**
   * Obtener catálogo por key
   */
  getCatalog<TItem = any>(key: string): TItem[] {
    return (this.catalogItems()[key] as TItem[]) || [];
  }

  /**
   * Obtener opciones mapeadas para un select
   */
  getCatalogOptions(key: string, labelKey: string, valueKey?: string): any[] {
    const items = this.getCatalog(key);
    return items.map(item => ({
      ...item,
      label: item[labelKey],
      value: valueKey ? item[valueKey] : item
    }));
  }

  /**
   * Reset modal visible
   */
  reset(): void {
    this.closeModal();
    this.items.set([]);
    this.totalRecords.set(0);
    this.catalogItems.set({});
  }
}
