import { TreeNode } from 'primeng/api';

/**
 * @interface TreeMapOptions
 * @description Interfaz de configuración para la función `mapToTreeNodes`.
 * Define las opciones para personalizar la transformación de objetos planos a nodos de árbol.
 * @template T - Tipo de dato de los elementos que serán convertidos a nodos.
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
 * @function mapToTreeNodes
 * @description Convierte un array de objetos anidados en una estructura de árbol compatible con PrimeNG (TreeNode[]).
 * Añade automáticamente propiedades de control (_canAdd, _canEdit, _canDelete) a cada nodo basadas en las opciones proporcionadas.
 * @template T - Tipo de dato de los elementos del array, debe ser un objeto.
 * @param {T[]} items - Array de elementos a convertir en nodos de árbol.
 * @param {TreeMapOptions<T>} options - Objeto de configuración opcional para personalizar la transformación.
 * @returns {TreeNode[]} Array de nodos de árbol listos para ser usados con PrimeNG.
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
 * @function filterTree
 * @description Filtra un árbol jerárquico aplicando un predicado a cada nodo.
 * Mantiene intacta la estructura del árbol, preservando la relación padre-hijo, 
 * mostrando tanto los nodos que coinciden con el predicado como sus ancestros.
 * @template T - Tipo de dato de los nodos del árbol, debe incluir `children` y `name`.
 * @param {T[]} nodes - Array de nodos raíz del árbol a filtrar.
 * @param {(node: T) => boolean} predicate - Función de predicado que retorna `true` si el nodo debe ser incluido.
 * @returns {T[]} Nuevo array de nodos que coinciden con el predicado.
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
 * @function filterTreeByQuery
 * @description Filtra un árbol jerárquico basándose en una consulta de búsqueda.
 * Mantiene intacta la estructura del árbol, preservando la relación padre-hijo, 
 * mostrando tanto los nodos que coinciden con la búsqueda como sus ancestros.
 * @template T - Tipo de dato de los nodos del árbol, debe incluir `name` y opcionalmente `slug`.
 * @param {T[]} nodes - Array de nodos raíz del árbol a filtrar.
 * @param {string} query - Cadena de búsqueda a aplicar.
 * @returns {T[]} Nuevo array de nodos que coinciden con la consulta.
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
