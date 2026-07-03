import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Injector, EnvironmentInjector, InjectionToken, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';

export const CRUD_SERVICE_TOKEN = new InjectionToken<any>('CRUD_SERVICE');

/**
 * CrudShellComponent
 * 
 * Un wrapper genérico para crear pantallas CRUD completas usando solo configuración en las rutas.
 * Elimina la necesidad de crear un Componente TS + HTML para cada catálogo simple.
 * 
 * Uso en el enrutador:
 * {
 *   path: 'apps',
 *   component: CrudShellComponent,
 *   providers: [{ provide: 'CRUD_SERVICE', useExisting: AppService }],
 *   data: {
 *     title: 'Aplicaciones',
 *     subtitle: 'Catálogo de aplicaciones',
 *     resourceName: 'Aplicación',
 *     methods: { fetch: 'getAppsWithCompanies', create: 'createAppGql', update: 'updateAppGql', delete: 'deleteAppGql' },
 *     cols: () => import('./apps.config').then(m => m.APPS_COLS),
 *     formFields: () => import('./apps.config').then(m => m.APPS_FORM_FIELDS)
 *   }
 * }
 */
@Component({
  selector: 'app-crud-shell',
  standalone: true,
  imports: [CommonModule, CrudPageComponent],
  template: `
    @if (initialized) {
      <app-crud-page 
        [title]="title"
      [subtitle]="subtitle" 
      [columns]="cols"
      [data]="crud.items()" 
      [loading]="crud.loading()" 
      [formFields]="resolvedFormFields()" 
      [resourceName]="resourceName" 
      [addLabel]="addLabel"
      [isSaving]="crud.isSaving()"
      [lazy]="lazy" 
      [totalRecords]="crud.totalRecords()"
      [showAdd]="showAdd"
      [showEdit]="showEdit"
      [showDelete]="showDelete"
      [permission]="permission"
      [hidePermissionGate]="hidePermissionGate"
      [deleteTitle]="deleteTitle"
      [deleteMessage]="deleteMessage"
      (onLazyLoad)="crud.load($event)" 
      (onSave)="crud.save($event)"
      (onConfirmDelete)="crud.confirmDelete($event)"
        (onRefresh)="crud.load()">
      </app-crud-page>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UnifiedCrudService]
})
export class CrudShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private injector = inject(Injector);
  private service = inject(CRUD_SERVICE_TOKEN, { optional: true });
  crud = inject(UnifiedCrudService);
  private environmentInjector = inject(EnvironmentInjector);

  initialized = false;
  title = '';
  subtitle = '';
  resourceName = '';
  addLabel = 'Nuevo';
  showAdd = true;
  showEdit = true;
  showDelete = true;
  lazy = false;
  permission = '';
  hidePermissionGate = false;
  deleteTitle: string = '';
  deleteMessage: string | ((item: any) => string) = '';
  cols: any[] = [];
  formFields: any[] = [];
  formFieldsBuilder: any = null;

  resolvedFormFields = computed(() => {
    if (this.formFieldsBuilder) {
      return this.formFieldsBuilder(this.crud.catalogItems());
    }
    return this.formFields;
  });

  async ngOnInit() {
    const data = this.route.snapshot.data;
    
    this.title = data['title'] || 'Catálogo';
    this.subtitle = data['subtitle'] || '';
    this.resourceName = data['resourceName'] || 'Elemento';
    this.addLabel = data['addLabel'] || 'Nuevo';
    this.showAdd = data['showAdd'] !== undefined ? data['showAdd'] : true;
    this.showEdit = data['showEdit'] !== undefined ? data['showEdit'] : true;
    this.showDelete = data['showDelete'] !== undefined ? data['showDelete'] : true;
    this.lazy = data['lazy'] || false;
    this.permission = data['permission'] || '';
    this.hidePermissionGate = data['hidePermissionGate'] || false;
    this.deleteTitle = data['deleteTitle'] || 'Eliminar';
    this.deleteMessage = data['deleteMessage'] || '¿Estás seguro de eliminar este elemento?';
    
    // Resolve dynamic imports for cols and formFields if they are functions (lazy loaded)
    this.cols = typeof data['cols'] === 'function' ? await data['cols']() : (data['cols'] || []);
    this.formFields = typeof data['formFields'] === 'function' ? await data['formFields']() : (data['formFields'] || []);
    
    if (typeof data['formFieldsFn'] === 'function') {
      this.formFieldsBuilder = await data['formFieldsFn']();
    }
    
    this.cdr.markForCheck();
    
    // Service methods binding
    let fnFetch, fnCreate, fnUpdate, fnDelete;

    // Approach 1: Use provided CRUD_SERVICE and method names
    if (this.service && data['methods']) {
      const fetchMethod = data['methods'].fetch;
      const createMethod = data['methods'].create;
      const updateMethod = data['methods'].update;
      const deleteMethod = data['methods'].delete;

      fnFetch = fetchMethod ? this.service[fetchMethod].bind(this.service) : undefined;
      fnCreate = createMethod ? this.service[createMethod].bind(this.service) : undefined;
      fnUpdate = updateMethod ? this.service[updateMethod].bind(this.service) : undefined;
      fnDelete = deleteMethod ? this.service[deleteMethod].bind(this.service) : undefined;
    }
    
    // Approach 2: Use direct function callbacks passed in route data (they can use inject())
    if (data['fnFetch']) fnFetch = (...args: any[]) => this.environmentInjector.runInContext(() => data['fnFetch'](...args));
    if (data['fnCreate']) fnCreate = (...args: any[]) => this.environmentInjector.runInContext(() => data['fnCreate'](...args));
    if (data['fnUpdate']) fnUpdate = (...args: any[]) => this.environmentInjector.runInContext(() => data['fnUpdate'](...args));
    if (data['fnDelete']) fnDelete = (...args: any[]) => this.environmentInjector.runInContext(() => data['fnDelete'](...args));

    let fnCatalogs;
    if (data['fnCatalogs']) {
      fnCatalogs = this.environmentInjector.runInContext(() => {
        return typeof data['fnCatalogs'] === 'function' ? data['fnCatalogs']() : data['fnCatalogs'];
      });
    }

    this.crud.initialize({
      fnFetch,
      fnCreate,
      fnUpdate,
      fnDelete,
      resourceName: this.resourceName,
      defaultSortKey: data['defaultSortKey'] || 'id',
      primaryKey: data['primaryKey'],
      columnMap: data['columnMap'],
      fnCatalogs
    });
    
    this.initialized = true;
    this.cdr.markForCheck();
    
    // Only manual load if not lazy. If lazy, the table's onLazyLoad will trigger it automatically
    // once the component renders (since initialized is now true).
    if (!this.lazy) {
      this.crud.load();
    }
    
    if (data['onInitFn']) {
      this.environmentInjector.runInContext(() => {
        data['onInitFn'](this.crud, this.cols);
      });
    }
  }
}
