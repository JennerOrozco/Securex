import { Injectable, inject, EnvironmentInjector } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { CrudConfigService } from './crud-config.service';
import { mapToTableColumns, mapToFormFields, type CrudConfigFromAPI } from '@shared/types/crud-config.types';
import type { TableColumn } from '@shared/table-shared/shared/table.types';
import type { FormField } from '@shared/modals/modal-shell/modal-shell.types';

export interface ResolvedCrudConfig {
  title: string;
  subtitle: string;
  resourceName: string;
  addLabel: string;
  showAdd: boolean;
  showEdit: boolean;
  showDelete: boolean;
  showPermissions: boolean;
  showLegend: boolean;
  lazy: boolean;
  isTreeTable: boolean;
  permission: string;
  hidePermissionGate: boolean;
  deleteTitle: string;
  deleteMessage: string | ((item: any) => string);
  defaultSortKey: string;
  primaryKey?: string;
  columnMap?: Record<string, string | null>;
  formExtraData: any;
  
  cols: TableColumn[];
  formFields: FormField[];
  formFieldsBuilder: any;
  
  fnFetch?: (page: number, limit: number, filter?: any, sort?: any) => Observable<any>;
  fnCreate?: (data: any) => Observable<any>;
  fnUpdate?: (id: any, data: any) => Observable<any>;
  fnDelete?: (id: any) => Observable<any>;
  fnCatalogs?: Record<string, () => Observable<any>>;
  hooks?: any;
  
  dbConfig: CrudConfigFromAPI | null;
  onInitFn?: Function;
  onPermissionsFn?: Function;
  onAddRootFn?: Function;
  onAddChildFn?: Function;
}

@Injectable({ providedIn: 'root' })
export class CrudConfigResolverService {
  private crudConfigService = inject(CrudConfigService);

  async resolve(
    routeData: any,
    environmentInjector: EnvironmentInjector
  ): Promise<ResolvedCrudConfig> {
    const crudConfigKey = routeData['crudConfigKey'];
    
    const dbConfig = crudConfigKey
      ? await firstValueFrom(this.crudConfigService.getCrudConfig(crudConfigKey))
      : null;

    const wrap = (fn: Function | undefined) => fn
      ? (...args: any[]) => environmentInjector.runInContext(() => fn(...args))
      : undefined;

    const hasDb = !!dbConfig;
    const d = (routeKey: string, dbVal: any, fallback: any) =>
      routeData[routeKey] !== undefined ? routeData[routeKey] : (hasDb ? dbVal : fallback);

    return {
      title: routeData['title'] || dbConfig?.title || 'Catálogo',
      subtitle: routeData['subtitle'] || dbConfig?.subtitle || '',
      resourceName: routeData['resourceName'] || dbConfig?.resource_name || 'Elemento',
      addLabel: routeData['addLabel'] || dbConfig?.add_label || 'Nuevo',
      showAdd: d('showAdd', !!dbConfig?.show_add, true),
      showEdit: d('showEdit', !!dbConfig?.show_edit, true),
      showDelete: d('showDelete', !!dbConfig?.show_delete, true),
      showPermissions: routeData['showPermissions'] || false,
      showLegend: routeData['showLegend'] !== undefined ? routeData['showLegend'] : true,
      lazy: d('lazy', !!dbConfig?.lazy_load, false),
      isTreeTable: d('isTreeTable', !!dbConfig?.is_tree, false),
      permission: routeData['permission'] || dbConfig?.permission || '',
      hidePermissionGate: routeData['hidePermissionGate'] || false,
      deleteTitle: routeData['deleteTitle'] || 'Eliminar',
      deleteMessage: routeData['deleteMessage'] || dbConfig?.delete_msg || '¿Estás seguro de eliminar este elemento?',
      defaultSortKey: routeData['defaultSortKey'] || dbConfig?.default_sort || 'id',
      primaryKey: routeData['primaryKey'] || dbConfig?.primary_key || undefined,
      columnMap: routeData['columnMap'],
      formExtraData: null,

      cols: dbConfig?.columns
        ? mapToTableColumns(dbConfig.columns)
        : (typeof routeData['cols'] === 'function' ? [] : (routeData['cols'] || [])),

      formFields: dbConfig?.form_fields
        ? mapToFormFields(dbConfig.form_fields)
        : (typeof routeData['formFields'] === 'function' ? [] : (routeData['formFields'] || [])),

      formFieldsBuilder: !dbConfig && typeof routeData['formFieldsFn'] === 'function'
        ? null // will be resolved async in CrudShell
        : null,

      fnFetch: wrap(routeData['fnFetch']) || (dbConfig ? this.crudConfigService.buildFetchFn(dbConfig) as any : undefined),
      fnCreate: wrap(routeData['fnCreate']) || (dbConfig ? this.crudConfigService.buildCreateFn(dbConfig) as any : undefined),
      fnUpdate: wrap(routeData['fnUpdate']) || (dbConfig ? this.crudConfigService.buildUpdateFn(dbConfig) as any : undefined),
      fnDelete: wrap(routeData['fnDelete']) || (dbConfig ? this.crudConfigService.buildDeleteFn(dbConfig) as any : undefined),

      fnCatalogs: routeData['fnCatalogs']
        ? environmentInjector.runInContext(() =>
            typeof routeData['fnCatalogs'] === 'function' ? routeData['fnCatalogs']() : routeData['fnCatalogs']
          )
        : undefined,

      hooks: routeData['hooks'],
      dbConfig,
      onInitFn: routeData['onInitFn'],
      onPermissionsFn: routeData['onPermissionsFn'],
      onAddRootFn: routeData['onAddRootFn'],
      onAddChildFn: routeData['onAddChildFn'],
    };
  }

  resolveDynamicFields(cfg: ResolvedCrudConfig, routeData: any): Promise<void> {
    return Promise.resolve().then(async () => {
      if (!cfg.dbConfig) {
        if (typeof routeData['cols'] === 'function') {
          cfg.cols = await routeData['cols']();
        }
        if (typeof routeData['formFields'] === 'function') {
          cfg.formFields = await routeData['formFields']();
        }
        if (typeof routeData['formFieldsFn'] === 'function') {
          cfg.formFieldsBuilder = await routeData['formFieldsFn']();
        }
      }
    });
  }
}
