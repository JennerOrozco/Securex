import { Route } from '@angular/router';
import { Observable } from 'rxjs';
import { TableColumn } from '@shared/table-shared/shared/table.types';
import { UnifiedCrudService } from '@shared/crud-base/unified-crud.service';

export interface CrudRouteConfig {
  permission?: string;
  hidePermissionGate?: boolean;
  title: string;
  subtitle?: string;
  resourceName: string;
  addLabel?: string;
  primaryKey?: string;
  isTreeTable?: boolean;
  lazy?: boolean;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  deleteTitle?: string;
  deleteMessage?: string | ((item: any) => string);
  defaultSortKey?: string;
  columnMap?: Record<string, any>;
  
  // Handlers
  fnFetch: (page: number, limit: number, filter: any, sort: any) => Observable<any>;
  fnCreate?: (data: any) => Observable<any>;
  fnUpdate?: (id: string | number, data: any) => Observable<any>;
  fnDelete?: (id: string | number) => Observable<any>;
  fnCatalogs?: () => Record<string, () => Observable<any>>;
  
  // Lazy-loaded configurations
  cols: () => Promise<TableColumn[]>;
  formFields?: () => Promise<any[]>;
  formFieldsFn?: () => Promise<(catalogItems: any) => any[]>;
  
  // Hooks
  onInitFn?: (crud: UnifiedCrudService, cols: TableColumn[]) => void;
  onAddRootFn?: (shell: any) => void;
  onAddChildFn?: (parentId: any, shell: any) => void;
  hooks?: () => {
    onBeforeSave?: (data: any, mode: 'add' | 'edit') => Promise<any>;
  };
}

/**
 * Función utilitaria para definir rutas dinámicas que apuntan al CrudShellComponent
 * con tipado estricto, autocompletado y validación en tiempo de compilación.
 */
export function defineCrudRoute(path: string, config: CrudRouteConfig): Route {
  return {
    path,
    title: config.title,
    loadComponent: () => import('@shared/crud-shell/crud-shell.component').then(m => m.CrudShellComponent),
    data: config
  };
}
