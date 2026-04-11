// Shared utility functions extracted from demo components
// These are pure functions that can be tested independently

// === Fuzzy Finder utilities ===

export interface FuzzyMatch {
  item: string;
  score: number;
  matchedIndices: number[];
}

/**
 * Perform fuzzy (non-contiguous) matching of a query against an item string.
 * Returns null if the query doesn't match; otherwise returns a scored match.
 */
export function fuzzyMatch(query: string, item: string): FuzzyMatch | null {
  if (!query) return { item, score: 0, matchedIndices: [] };

  const lowerQuery = query.toLowerCase();
  const lowerItem = item.toLowerCase();
  const matchedIndices: number[] = [];
  let queryIdx = 0;
  let score = 0;
  let prevMatchIdx = -2;

  for (let i = 0; i < lowerItem.length && queryIdx < lowerQuery.length; i++) {
    if (lowerItem[i] === lowerQuery[queryIdx]) {
      matchedIndices.push(i);

      // Scoring bonuses
      if (i === 0) score += 10;                          // Start of string
      if (lowerItem[i - 1] === '/' || lowerItem[i - 1] === '.' || lowerItem[i - 1] === '-' || lowerItem[i - 1] === '_')
        score += 8;                                       // After separator
      if (i === prevMatchIdx + 1) score += 5;            // Consecutive match
      else score += 1;                                    // Gap penalty reduction

      prevMatchIdx = i;
      queryIdx++;
    }
  }

  // All query characters must match
  if (queryIdx < lowerQuery.length) return null;

  // Bonus for shorter items (more relevant)
  score += Math.max(0, 50 - item.length);
  // Bonus for query length ratio
  score += Math.round((query.length / item.length) * 20);

  return { item, score, matchedIndices };
}

// === Data Table utilities ===

/**
 * Pad or truncate a cell value to fit a fixed column width.
 * Values longer than width are truncated with an ellipsis.
 */
export function padCell(val: string, width: number, align: 'left' | 'right'): string {
  if (val.length > width) return val.slice(0, width - 1) + '…';
  return align === 'right' ? val.padStart(width) : val.padEnd(width);
}

// === Heatmap utilities ===

/**
 * Map a contribution count to a 0-4 intensity level for heatmap coloring.
 */
export function getLevel(val: number): number {
  if (val === 0) return 0;
  if (val <= 2) return 1;
  if (val <= 5) return 2;
  if (val <= 9) return 3;
  return 4;
}

// === Tree View utilities ===

export interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  children?: TreeNode[];
}

/**
 * Recursively count all nodes in a tree structure.
 */
export function countAll(nodes: TreeNode[]): number {
  let count = 0;
  for (const n of nodes) {
    count++;
    if (n.children) count += countAll(n.children);
  }
  return count;
}

export interface FlatNode {
  node: TreeNode;
  depth: number;
  isLast: boolean;
  parentIsLast: boolean[];
  path: string;
  childCount: number;
}

/**
 * Flatten a tree structure into a list suitable for rendering,
 * respecting which folders are expanded.
 */
export function flattenTree(
  nodes: TreeNode[],
  expanded: Set<string>,
  depth: number = 0,
  parentIsLast: boolean[] = [],
  parentPath: string = ''
): FlatNode[] {
  const result: FlatNode[] = [];
  nodes.forEach((node, idx) => {
    const isLast = idx === nodes.length - 1;
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    const childCount = node.children ? countAll(node.children) : 0;
    result.push({ node, depth, isLast, parentIsLast: [...parentIsLast], path, childCount });
    if (node.type === 'folder' && node.children && expanded.has(path)) {
      result.push(...flattenTree(node.children, expanded, depth + 1, [...parentIsLast, isLast], path));
    }
  });
  return result;
}

// === File icon mapping ===

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  '.tsx': { icon: '◇', color: '#58a6ff' },
  '.ts':  { icon: '◇', color: '#3178c6' },
  '.js':  { icon: '◆', color: '#f1e05a' },
  '.json': { icon: '{}', color: '#d29922' },
  '.md':  { icon: '#', color: '#58a6ff' },
  '':     { icon: '◦', color: '#8b949e' },
};

/**
 * Get the display icon and color for a filename based on its extension.
 */
export function getFileIcon(name: string): { icon: string; color: string } {
  for (const [ext, style] of Object.entries(FILE_ICONS)) {
    if (ext && name.endsWith(ext)) return style;
  }
  return FILE_ICONS[''];
}
