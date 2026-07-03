import { Directive, ChangeDetectorRef, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormField } from '@shared/modals/modal-shell/modal-shell.types';
import { BaseModalComponent } from './base-modal.component';
import { CatalogCacheService } from '@shared/services/catalog-cache.service';
import { extractApiArray } from '@shared/utils/api-payload.utils';

/**
 * Componente base para catálogos con caché global y optimización de renderizado.
 */
@Directive()
export abstract class BaseCatalogComponent<T = any> extends BaseModalComponent<T> {
  protected override cdr = inject(ChangeDetectorRef);
  protected catalogCache = inject(CatalogCacheService);

  catalogItems: Record<string, any[]> = {};
  override catalogLoading = false;

  protected getCatalogArray<TItem>(key: string): TItem[] {
    return (this.catalogItems[key] as TItem[]) || [];
  }

  protected fnCatalogs?: Record<string, () => Observable<any>>;

  /**
   * Carga todos los catálogos apoyándose en el caché global para evitar peticiones HTTP duplicadas.
   */
  loadCatalog(): Observable<Record<string, any[]>> {
    if (!this.fnCatalogs || Object.keys(this.fnCatalogs).length === 0) return of({});

    const entries = Object.entries(this.fnCatalogs);

    // Aquí ocurre la magia: pasamos la petición por el servicio de caché
    const observables = entries.map(([key, fn]) =>
      this.catalogCache.getCatalog(key, fn)
    );

    return forkJoin(observables).pipe(
      map(results => {
        return entries.reduce((acc, [key], index) => {
          acc[key] = this.extractData(results[index]);
          return acc;
        }, {} as Record<string, any[]>);
      })
    );
  }

  private extractData(res: any): any[] {
    return extractApiArray<any>(res);
  }

  updateFormFields(): void {
    const allFields = [...this.formFields, ...((this as any).modalFormFields || [])];
    const localCache = new Map<string, any[]>();

    for (const field of allFields) {
      if (!field.catalogConfig) continue;

      const { key, labelKey, valueKey } = field.catalogConfig;

      if (!localCache.has(key)) {
        const raw = this.catalogItems[key] || [];
        localCache.set(key, labelKey ? this.mapToOptions(raw, labelKey, valueKey) : raw);
      }
      field.options = localCache.get(key);
    }
  }

  protected mapToOptions(items: any[], labelOrFn: string | ((item: any) => string), valueKey?: string): any[] {
    return items.map(item => ({
      ...item,
      label: typeof labelOrFn === 'function' ? labelOrFn(item) : item[labelOrFn],
      value: valueKey ? item[valueKey] : item
    }));
  }

  protected ensureCatalog(callback: () => void): void {
    // Si ya los tenemos instanciados en la clase, no hacemos nada.
    if (Object.keys(this.catalogItems).length > 0) {
      callback();
      return;
    }

    this.loading = this.catalogLoading = true;
    this.cdr.markForCheck();

    this.loadCatalog()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = this.catalogLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe(data => {
        this.catalogItems = data;
        this.updateFormFields();
        callback();
      });
  }

  protected initFormFromFields(form: FormGroup, fields: FormField[], data?: any): void {
    const value = fields.reduce((acc, field) => {
      const val = data?.[field.name];
      acc[field.name] = (val !== undefined && val !== null) ? val : ((field as any).defaultValue ?? '');
      return acc;
    }, {} as Record<string, any>);

    form.patchValue(value, { emitEvent: false });
    form.markAsPristine();
    form.markAsUntouched();
  }

  protected prepareModal(mode: 'add' | 'edit', item?: T): void {
    this.ensureCatalog(() => {
      this.updateFormFields();
      this.onBeforeModalOpen?.(mode, item as T);
      this.modalVisible = true;
      this.cdr.markForCheck();
    });
  }

  override handleAdd(): void {
    super.handleAdd();
    this.prepareModal('add');
  }

  override handleEdit(item: T): void {
    super.handleEdit(item);
    this.prepareModal('edit', item);
  }
}