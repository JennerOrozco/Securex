import { TreeNode } from 'primeng/api';

/**
 * Configuration for mapToTreeNodes. Each callback is optional;
 * defaults are permissive (canAdd/canEdit/canDelete = true).
 */
export interface TreeMapOptions<T = any> {
  canAdd?: (item: T) => boolean;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
  label?: (item: T) => string;
  icon?: (item: T) => string;
  leaf?: (item: T) => boolean;
  expanded?: (item: T) => boolean;
  childrenKey?: string;
  dataExtras?: (item: T) => Record<string, any>;
}

/**
 * Converts a nested array of items into PrimeNG TreeNode[].
 * Adds _canAdd / _canEdit / _canDelete flags automatically.
 */
export function mapToTreeNodes<T extends Record<string, any>>(
  items: T[],
  options: TreeMapOptions<T> = {},
): TreeNode[] {
  const {
    canAdd = () => true,
    canEdit = () => true,
    canDelete = () => true,
    label,
    icon,
    leaf,
    expanded,
    childrenKey = 'children',
    dataExtras,
  } = options;

  return items.map((item) => {
    const children = item[childrenKey];
    const data: Record<string, any> = {
      ...item,
      _canAdd: canAdd(item),
      _canEdit: canEdit(item),
      _canDelete: canDelete(item),
      ...(dataExtras ? dataExtras(item) : {}),
    };

    const node: TreeNode = {
      data,
      children: children && children.length > 0
        ? mapToTreeNodes(children, options)
        : undefined,
    };

    if (label) (node as any).label = label(item);
    if (icon) (node as any).icon = icon(item);
    if (leaf) (node as any).leaf = leaf(item);
    if (expanded) node.expanded = expanded(item);

    return node;
  });
}

/**
 * Filters a nested tree by predicate.  Keeps a node if it matches
 * OR if any descendant matches (preserving the parent chain).
 */
export function filterTree<T extends { children?: T[]; name: string; slug?: string }>(
  nodes: T[],
  predicate: (node: T) => boolean,
): T[] {
  return nodes.reduce((acc, node) => {
    const matches = predicate(node);
    const children = node.children && node.children.length > 0
      ? filterTree(node.children, predicate)
      : [];
    if (matches || children.length > 0) {
      acc.push({ ...node, children });
    }
    return acc;
  }, [] as T[]);
}

/**
 * Filters a nested tree by `name` or `slug` substring (case-insensitive).
 */
export function filterTreeByQuery<
  T extends { children?: T[]; name: string; slug?: string }
>(nodes: T[], query: string): T[] {
  const q = (query || '').toLowerCase().trim();
  if (!q) return nodes;
  return filterTree(nodes, (n) =>
    n.name.toLowerCase().includes(q) ||
    (n.slug || '').toLowerCase().includes(q)
  );
}
