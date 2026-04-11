import { describe, it, expect } from 'vitest';
import {
  fuzzyMatch,
  padCell,
  getLevel,
  countAll,
  flattenTree,
  getFileIcon,
  type TreeNode,
} from './utils.js';

// ─── fuzzyMatch ────────────────────────────────────────────

describe('fuzzyMatch', () => {
  it('returns a zero-score match with no indices when query is empty', () => {
    const result = fuzzyMatch('', 'src/app.tsx');
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
    expect(result!.matchedIndices).toEqual([]);
    expect(result!.item).toBe('src/app.tsx');
  });

  it('matches contiguous characters and records their indices', () => {
    const result = fuzzyMatch('app', 'src/app.tsx');
    expect(result).not.toBeNull();
    expect(result!.matchedIndices).toEqual([4, 5, 6]);
  });

  it('matches non-contiguous characters across the string', () => {
    const result = fuzzyMatch('sat', 'src/app.tsx');
    expect(result).not.toBeNull();
    // s at 0, a at 4, t at 8
    expect(result!.matchedIndices).toEqual([0, 4, 8]);
  });

  it('returns null when the query cannot be matched', () => {
    const result = fuzzyMatch('xyz', 'src/app.tsx');
    expect(result).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = fuzzyMatch('APP', 'src/app.tsx');
    expect(result).not.toBeNull();
    expect(result!.matchedIndices).toEqual([4, 5, 6]);
  });

  it('gives higher scores to shorter items (relevance bonus)', () => {
    const short = fuzzyMatch('a', 'a.ts')!;
    const long = fuzzyMatch('a', 'some/very/long/path/to/a/file.ts')!;
    expect(short.score).toBeGreaterThan(long.score);
  });

  it('gives a bonus for matches after path separators', () => {
    // "t" matching after "/" should score higher than "t" mid-word
    const afterSep = fuzzyMatch('t', 'src/tasks.ts')!;
    const midWord = fuzzyMatch('t', 'butter.ts')!;
    // afterSep matches at index 4 (after /), midWord matches at index 2 (mid-word)
    // afterSep gets separator bonus (8) vs midWord gets start-ish bonus (1)
    expect(afterSep.score).toBeGreaterThan(midWord.score);
  });

  it('gives a bonus for consecutive character matches', () => {
    // "ab" matching consecutively in "abc" vs non-consecutively in "a_b_c"
    const consecutive = fuzzyMatch('ab', 'abc')!;
    const gapped = fuzzyMatch('ab', 'a_b_c')!;
    expect(consecutive.score).toBeGreaterThan(gapped.score);
  });
});

// ─── padCell ───────────────────────────────────────────────

describe('padCell', () => {
  it('pads a short value to the right for left alignment', () => {
    expect(padCell('hi', 6, 'left')).toBe('hi    ');
  });

  it('pads a short value to the left for right alignment', () => {
    expect(padCell('42', 6, 'right')).toBe('    42');
  });

  it('truncates with ellipsis when value exceeds width', () => {
    const result = padCell('very long text', 8, 'left');
    expect(result).toBe('very lo…');
    expect(result.length).toBe(8);
  });

  it('returns the value unchanged when it exactly fits', () => {
    expect(padCell('exact', 5, 'left')).toBe('exact');
  });
});

// ─── getLevel ──────────────────────────────────────────────

describe('getLevel', () => {
  it('returns 0 for zero contributions', () => {
    expect(getLevel(0)).toBe(0);
  });

  it('returns 1 for 1-2 contributions', () => {
    expect(getLevel(1)).toBe(1);
    expect(getLevel(2)).toBe(1);
  });

  it('returns 2 for 3-5 contributions', () => {
    expect(getLevel(3)).toBe(2);
    expect(getLevel(5)).toBe(2);
  });

  it('returns 3 for 6-9 contributions', () => {
    expect(getLevel(6)).toBe(3);
    expect(getLevel(9)).toBe(3);
  });

  it('returns 4 for 10+ contributions', () => {
    expect(getLevel(10)).toBe(4);
    expect(getLevel(100)).toBe(4);
  });
});

// ─── countAll ──────────────────────────────────────────────

describe('countAll', () => {
  it('counts a flat list of files', () => {
    const nodes: TreeNode[] = [
      { name: 'a.ts', type: 'file' },
      { name: 'b.ts', type: 'file' },
    ];
    expect(countAll(nodes)).toBe(2);
  });

  it('counts nested folders and files recursively', () => {
    const nodes: TreeNode[] = [
      {
        name: 'src', type: 'folder', children: [
          { name: 'index.ts', type: 'file' },
          {
            name: 'lib', type: 'folder', children: [
              { name: 'utils.ts', type: 'file' },
            ],
          },
        ],
      },
      { name: 'README.md', type: 'file' },
    ];
    // src + index.ts + lib + utils.ts + README.md = 5
    expect(countAll(nodes)).toBe(5);
  });

  it('returns 0 for an empty array', () => {
    expect(countAll([])).toBe(0);
  });
});

// ─── flattenTree ───────────────────────────────────────────

describe('flattenTree', () => {
  const tree: TreeNode[] = [
    {
      name: 'src', type: 'folder', children: [
        { name: 'app.ts', type: 'file' },
        { name: 'lib', type: 'folder', children: [
          { name: 'utils.ts', type: 'file' },
        ]},
      ],
    },
    { name: 'README.md', type: 'file' },
  ];

  it('shows only top-level nodes when nothing is expanded', () => {
    const flat = flattenTree(tree, new Set());
    expect(flat.map(f => f.path)).toEqual(['src', 'README.md']);
  });

  it('expands a folder to show its children', () => {
    const flat = flattenTree(tree, new Set(['src']));
    expect(flat.map(f => f.path)).toEqual([
      'src',
      'src/app.ts',
      'src/lib',
      'README.md',
    ]);
  });

  it('expands nested folders when both are in the expanded set', () => {
    const flat = flattenTree(tree, new Set(['src', 'src/lib']));
    expect(flat.map(f => f.path)).toEqual([
      'src',
      'src/app.ts',
      'src/lib',
      'src/lib/utils.ts',
      'README.md',
    ]);
  });

  it('sets correct depth values', () => {
    const flat = flattenTree(tree, new Set(['src', 'src/lib']));
    expect(flat.map(f => f.depth)).toEqual([0, 1, 1, 2, 0]);
  });

  it('calculates childCount for folder nodes', () => {
    const flat = flattenTree(tree, new Set());
    const srcNode = flat.find(f => f.path === 'src')!;
    // src has: app.ts, lib, utils.ts = 3 children total
    expect(srcNode.childCount).toBe(3);
  });

  it('marks the last item at each level with isLast', () => {
    const flat = flattenTree(tree, new Set(['src']));
    // At depth 0: src is not last (README is), README is last
    // At depth 1 under src: app.ts is not last, lib is last
    expect(flat.find(f => f.path === 'src')!.isLast).toBe(false);
    expect(flat.find(f => f.path === 'README.md')!.isLast).toBe(true);
    expect(flat.find(f => f.path === 'src/app.ts')!.isLast).toBe(false);
    expect(flat.find(f => f.path === 'src/lib')!.isLast).toBe(true);
  });
});

// ─── getFileIcon ───────────────────────────────────────────

describe('getFileIcon', () => {
  it('returns TypeScript React icon for .tsx files', () => {
    const icon = getFileIcon('App.tsx');
    expect(icon.icon).toBe('◇');
    expect(icon.color).toBe('#58a6ff');
  });

  it('returns TypeScript icon for .ts files', () => {
    const icon = getFileIcon('utils.ts');
    expect(icon.icon).toBe('◇');
    expect(icon.color).toBe('#3178c6');
  });

  it('returns JavaScript icon for .js files', () => {
    const icon = getFileIcon('server.js');
    expect(icon.icon).toBe('◆');
    expect(icon.color).toBe('#f1e05a');
  });

  it('returns JSON icon for .json files', () => {
    const icon = getFileIcon('package.json');
    expect(icon.icon).toBe('{}');
  });

  it('returns Markdown icon for .md files', () => {
    const icon = getFileIcon('README.md');
    expect(icon.icon).toBe('#');
  });

  it('returns default icon for unknown extensions', () => {
    const icon = getFileIcon('.gitignore');
    expect(icon.icon).toBe('◦');
    expect(icon.color).toBe('#8b949e');
  });
});
