export interface PermissionTreeNode {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  type: string;
  children: PermissionTreeNode[];
  allIds: number[];
  expanded?: boolean;
}
