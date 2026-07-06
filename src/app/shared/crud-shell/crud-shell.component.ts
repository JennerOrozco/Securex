import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, EnvironmentInjector, InjectionToken, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CrudPageComponent } from '@shared/crud-page/crud-page.component';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';
import { CrudConfigResolverService } from '@core/services/crud-config-resolver.service';
import { CrudConfigService } from '@core/services/crud-config.service';
import { mapToFormFields } from '@shared/types/crud-config.types';

export const CRUD_SERVICE_TOKEN = new InjectionToken<any>('CRUD_SERVICE');

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
        [showPermissions]="showPermissions"
        [showLegend]="showLegend"
        [permission]="permission"
        [hidePermissionGate]="hidePermissionGate"
        [deleteTitle]="deleteTitle"
        [deleteMessage]="deleteMessage"
        [isTreeTable]="isTreeTable"
        [treeNodes]="crud.items()"
        [formExtraData]="formExtraData"
        [showLegend]="showLegend"
        [dragdrop]="dragdrop"
        [searchPlaceholder]="searchPlaceholder"
        (onLazyLoad)="crud.load($event)" 
        (onSave)="crud.save($event)"
        (onConfirmDelete)="crud.confirmDelete($event)"
        (onRefresh)="crud.load()"
        (onPermissions)="handlePermissions($event)"
        (onAdd)="handleModalOpen()"
        (onEdit)="handleModalOpen()"
        (onAddRoot)="handleAddRoot()"
        (onAddChild)="handleAddChild($event)"
        (onFilterType)="handleFilterType($event)"
        (onNodeReorder)="handleNodeReorder($event)">
      </app-crud-page>

      @if (customModalComponent) {
        <ng-container *ngComponentOutlet="customModalComponent; inputs: customModalInputs"></ng-container>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UnifiedCrudService]
})
export class CrudShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private resolver = inject(CrudConfigResolverService);
  private crudConfigService = inject(CrudConfigService);
  private environmentInjector = inject(EnvironmentInjector);
  crud = inject(UnifiedCrudService);

  initialized = false;
  title = '';
  subtitle = '';
  resourceName = '';
  addLabel = 'Nuevo';
  showAdd = true;
  showEdit = true;
  showDelete = true;
  showPermissions = false;
  showLegend = false;
  dragdrop = false;
  lazy = false;
  isTreeTable = false;
  permission = '';
  hidePermissionGate = false;
  searchPlaceholder = 'Buscar...';
  deleteTitle = '';
  deleteMessage: string | ((item: any) => string) = '';
  formExtraData: any = null;
  cols: any[] = [];
  formFields: any[] = [];
  formFieldsBuilder: any = null;

  customModalComponent: any = null;
  customModalInputs: Record<string, any> = {};

  private _dbConfig: any = null;
  _rawFormFields = signal<any[]>([]);
  private routeData: any = null;

  resolvedFormFields = computed(() => {
    try {
      if (this.formFieldsBuilder) {
        return this.formFieldsBuilder(this.crud.catalogItems());
      }
      if (this._rawFormFields().length > 0) {
        return mapToFormFields(this._rawFormFields(), this.crud.catalogItems());
      }
      return this.formFields;
    } catch (e) {
      console.error('[CrudShell] Error building form fields:', e);
      return [];
    }
  });

  async ngOnInit() {
    const data = this.route.snapshot.data;
    this.routeData = data;

    const cfg = await this.resolver.resolve(data, this.environmentInjector);
    await this.resolver.resolveDynamicFields(cfg, data);

    Object.assign(this, {
      title: cfg.title, subtitle: cfg.subtitle, resourceName: cfg.resourceName,
      addLabel: cfg.addLabel, showAdd: cfg.showAdd, showEdit: cfg.showEdit,
      showDelete: cfg.showDelete, showPermissions: cfg.showPermissions,
      lazy: cfg.lazy, isTreeTable: cfg.isTreeTable, permission: cfg.permission,
      hidePermissionGate: cfg.hidePermissionGate, deleteTitle: cfg.deleteTitle,
      deleteMessage: cfg.deleteMessage, formExtraData: cfg.formExtraData,
      cols: cfg.cols, formFields: cfg.formFields,
      formFieldsBuilder: cfg.formFieldsBuilder,
      showLegend: data['showLegend'] || false,
      dragdrop: data['dragdrop'] || false,
      searchPlaceholder: data['searchPlaceholder'] || 'Buscar...',
    });

    this._dbConfig = cfg.dbConfig;
    this._rawFormFields.set(cfg.dbConfig?.form_fields || []);

    this.cdr.markForCheck();

    this.crud.initialize({
      resourceName: cfg.resourceName,
      defaultSortKey: cfg.defaultSortKey,
      ...(cfg.primaryKey ? { primaryKey: cfg.primaryKey } : {}),
      columnMap: cfg.columnMap as any,
      fnFetch: cfg.fnFetch,
      fnCreate: cfg.fnCreate,
      fnUpdate: cfg.fnUpdate,
      fnDelete: cfg.fnDelete,
      fnCatalogs: cfg.fnCatalogs,
      hooks: cfg.hooks,
      isTreeMode: cfg.isTreeTable || !!data['fnFetchTree'],
      fnFetchTree: data['fnFetchTree'] 
        ? (...args: any[]) => this.environmentInjector.runInContext(() => (data['fnFetchTree'] as Function)(...args))
        : (cfg.dbConfig ? this.crudConfigService.buildFetchTreeFn(cfg.dbConfig) as any : undefined),
      mapTreeFn: data['mapTreeFn'],
    });

    this.initialized = true;
    this.cdr.markForCheck();

    if (!this.lazy) {
      this.crud.load();
    }

    if (cfg.onInitFn) {
      this.environmentInjector.runInContext(() => {
        cfg.onInitFn!(this.crud, this.cols);
      });
    }
  }

  handlePermissions(item: any) {
    if (this.routeData?.['onPermissionsFn']) {
      this.environmentInjector.runInContext(() => {
        this.routeData['onPermissionsFn'](item, this);
      });
    }
  }

  handleModalOpen() {
    this.crud.ensureCatalogs(() => { });
  }

  handleAddRoot() {
    this.handleModalOpen();
    if (this.routeData?.['onAddRootFn']) {
      this.routeData['onAddRootFn'](this);
    } else {
      this.formExtraData = null;
    }
  }

  handleAddChild(parentId: any) {
    this.handleModalOpen();
    if (this.routeData?.['onAddChildFn']) {
      this.routeData['onAddChildFn'](parentId, this);
    } else {
      this.formExtraData = { parent_id: parentId };
    }
  }

  handleFilterType(type: string) {
    if (this.routeData?.['onFilterTypeFn']) {
      this.routeData['onFilterTypeFn'](this.crud, type);
    }
  }

  handleNodeReorder(event: any) {
    if (this.routeData?.['onNodeReorderFn']) {
      this.routeData['onNodeReorderFn'](event, this.crud, this.environmentInjector);
    }
  }
}
