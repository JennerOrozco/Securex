import { Observable } from 'rxjs';

export type ModalMode = 'add' | 'edit' | 'delete' | 'view';

export interface CrudDelegates<T = any> {
  fnFetch?: (page: number, limit: number, filter: any, sort: any) => Observable<any>;
  fnCreate?: (data: any) => Observable<any>;
  fnUpdate?: (id: any, data: any) => Observable<any>;
  fnDelete?: (id: any) => Observable<any>;
  fnCatalogs?: Record<string, () => Observable<any>>;
}
