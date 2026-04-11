// Demo 15: Expandable tree view
// Nested folder/file structure with tree lines
// Expand/collapse with Enter/Space, navigate with arrows

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { countAll, flattenTree, getFileIcon, type TreeNode, type FlatNode } from '../lib/utils.js';

const TREE: TreeNode[] = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'Board.tsx', type: 'file', size: '4.2 KB' },
      { name: 'Sidebar.tsx', type: 'file', size: '6.8 KB' },
      { name: 'TaskCard.tsx', type: 'file', size: '2.1 KB' },
      { name: 'TaskModal.tsx', type: 'file', size: '8.3 KB' },
      { name: 'Settings.tsx', type: 'file', size: '3.4 KB' },
    ]},
    { name: 'hooks', type: 'folder', children: [
      { name: 'useTasks.ts', type: 'file', size: '5.1 KB' },
      { name: 'useAuth.ts', type: 'file', size: '2.7 KB' },
      { name: 'useSocket.ts', type: 'file', size: '1.3 KB' },
    ]},
    { name: 'lib', type: 'folder', children: [
      { name: 'api.ts', type: 'file', size: '1.8 KB' },
      { name: 'constants.ts', type: 'file', size: '0.4 KB' },
    ]},
    { name: 'App.tsx', type: 'file', size: '3.9 KB' },
    { name: 'index.ts', type: 'file', size: '0.2 KB' },
  ]},
  { name: 'backend', type: 'folder', children: [
    { name: 'routes', type: 'folder', children: [
      { name: 'tasks.js', type: 'file', size: '12.4 KB' },
      { name: 'auth.js', type: 'file', size: '4.1 KB' },
      { name: 'projects.js', type: 'file', size: '5.6 KB' },
    ]},
    { name: 'lib', type: 'folder', children: [
      { name: 'constants.js', type: 'file', size: '1.2 KB' },
      { name: 'authMiddleware.js', type: 'file', size: '2.0 KB' },
    ]},
    { name: 'server.js', type: 'file', size: '7.8 KB' },
    { name: 'package.json', type: 'file', size: '1.1 KB' },
  ]},
  { name: 'tests', type: 'folder', children: [
    { name: 'integration', type: 'folder', children: [
      { name: 'tasks.test.ts', type: 'file', size: '6.2 KB' },
      { name: 'auth.test.ts', type: 'file', size: '3.5 KB' },
    ]},
    { name: 'setup.ts', type: 'file', size: '0.8 KB' },
  ]},
  { name: 'package.json', type: 'file', size: '1.4 KB' },
  { name: 'tsconfig.json', type: 'file', size: '0.5 KB' },
  { name: 'README.md', type: 'file', size: '3.2 KB' },
  { name: '.gitignore', type: 'file', size: '0.1 KB' },
];

export default function TreeView() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['src', 'backend']));
  const [cursor, setCursor] = useState(0);

  const flat = useMemo(() => flattenTree(TREE, expanded), [expanded]);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => Math.min(flat.length - 1, prev + 1));
    } else if (key.return || input === ' ') {
      const item = flat[cursor];
      if (item && item.node.type === 'folder') {
        setExpanded(prev => {
          const next = new Set(prev);
          if (next.has(item.path)) next.delete(item.path);
          else next.add(item.path);
          return next;
        });
      }
    } else if (input === 'e') {
      // Expand all
      const all = new Set<string>();
      function addAll(nodes: TreeNode[], prefix: string) {
        for (const n of nodes) {
          const p = prefix ? `${prefix}/${n.name}` : n.name;
          if (n.type === 'folder') { all.add(p); if (n.children) addAll(n.children, p); }
        }
      }
      addAll(TREE, '');
      setExpanded(all);
    } else if (input === 'w') {
      // Collapse all
      setExpanded(new Set());
      setCursor(0);
    }
  });

  const folders = flat.filter(f => f.node.type === 'folder').length;
  const files = flat.filter(f => f.node.type === 'file').length;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#3fb950">Expandable Tree View</Text>
      <Text color="gray">↑↓/jk navigate, Enter/Space expand/collapse, e=expand all, w=collapse all</Text>
      <Box marginTop={1} />

      {flat.map((item, idx) => {
        const isActive = idx === cursor;
        const { node, depth, isLast, parentIsLast } = item;

        // Build tree connector lines
        let prefix = '';
        for (let d = 0; d < depth; d++) {
          prefix += parentIsLast[d] ? '    ' : ' │  ';
        }
        if (depth > 0) {
          prefix += isLast ? ' └── ' : ' ├── ';
        }

        const isFolder = node.type === 'folder';
        const isOpen = expanded.has(item.path);
        const folderIcon = isOpen ? '▾' : '▸';
        const fileStyle = getFileIcon(node.name);

        return (
          <Box key={item.path}>
            <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
            <Text color="#30363d">{prefix}</Text>
            {isFolder ? (
              <Text color={isActive ? '#fdb32a' : '#58a6ff'}>
                {folderIcon} <Text bold>{node.name}/</Text>
                {!isOpen && item.childCount > 0 && <Text color="gray" dimColor> ({item.childCount})</Text>}
              </Text>
            ) : (
              <Box gap={0}>
                <Text color={fileStyle.color}>{fileStyle.icon} </Text>
                <Text color={isActive ? 'white' : 'gray'}>{node.name}</Text>
                {node.size && <Text color="gray" dimColor> {node.size}</Text>}
              </Box>
            )}
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">{'─'.repeat(50)}</Text>
      </Box>
      <Box gap={2}>
        <Text color="gray">{folders} folders</Text>
        <Text color="gray">{files} files</Text>
        <Text color="gray">{expanded.size} expanded</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
