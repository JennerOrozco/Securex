import { Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { filterTreeByQuery } from '@shared/utils/tree-utils';
import { BaseCatalogComponent } from './base-catalog.component';

@Directive()
export abstract class BaseTreeComponent<T = any> extends BaseCatalogComponent<T> {
  protected isTreeTable = false;
  treeData: TreeNode[] = [];
  rawItems: any[] = [];
  currentParentId: number | null = null;

  protected loadTreeData(): Observable<any[]> {
    throw new Error('loadTreeData() debe sobreescribirse cuando isTreeTable es true');
  }

  protected mapToTreeNodes?(items: any[]): TreeNode[];

  protected filterTree(query: string): void {
    const filtered = filterTreeByQuery(this.rawItems, query);
    if (this.mapToTreeNodes) {
      this.treeData = this.mapToTreeNodes(filtered);
    }
    this.cdr.markForCheck();
  }

  protected handleAddRoot(): void {
    this.currentParentId = null;
  }

  protected handleAddChild(parentId: number): void {
    this.currentParentId = parentId;
  }
}
