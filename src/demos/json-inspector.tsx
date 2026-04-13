// Demo 27: JSON inspector
// Collapsible tree with syntax coloring, path breadcrumb, value types

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

const SAMPLE_JSON = {
  name: "agent-task-board",
  version: "1.0.0",
  private: true,
  description: "Kanban-style task management for AI agents",
  author: {
    name: "Roger Ochoa",
    email: "rog@r-that.com",
    url: "https://r-that.com"
  },
  scripts: {
    dev: "node server.js",
    start: "NODE_ENV=production node server.js",
    test: "vitest run",
    lint: "eslint ."
  },
  dependencies: {
    express: "^5.2.1",
    "better-sqlite3": "^12.8.0",
    jsonwebtoken: "^9.0.3",
    bcryptjs: "^3.0.3",
    cors: "^2.8.6",
    "socket.io": "^4.8.3"
  },
  devDependencies: {
    vitest: "^4.1.2",
    eslint: "^9.39.4",
    typescript: "^6.0.2"
  },
  config: {
    port: 3001,
    maxTasks: 500,
    features: {
      agents: true,
      aiChat: true,
      designStudio: false,
      federation: null
    },
    allowedOrigins: [
      "http://localhost:5173",
      "http://localhost:3001",
      "https://r-that.com"
    ]
  },
  tags: ["typescript", "react", "express", "kanban", "ai-agents"],
  stats: {
    totalTasks: 147,
    completedTasks: 89,
    activeAgents: 2,
    uptime: 86400
  }
};

interface FlatNode {
  key: string;
  value: unknown;
  depth: number;
  path: string[];
  isExpandable: boolean;
  isExpanded: boolean;
  isLast: boolean;
  parentLasts: boolean[];
  childCount?: number;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
}

function getType(val: unknown): FlatNode['type'] {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val as FlatNode['type'];
}

function flatten(obj: unknown, expanded: Set<string>, depth: number = 0, path: string[] = [], parentLasts: boolean[] = []): FlatNode[] {
  const nodes: FlatNode[] = [];
  if (typeof obj !== 'object' || obj === null) return nodes;

  const entries = Array.isArray(obj)
    ? obj.map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(obj as Record<string, unknown>);

  entries.forEach(([key, value], idx) => {
    const isLast = idx === entries.length - 1;
    const nodePath = [...path, key];
    const pathStr = nodePath.join('.');
    const type = getType(value);
    const isExpandable = type === 'object' || type === 'array';
    const isExpanded = expanded.has(pathStr);

    let childCount: number | undefined;
    if (isExpandable && value !== null) {
      childCount = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    }

    nodes.push({
      key,
      value,
      depth,
      path: nodePath,
      isExpandable,
      isExpanded,
      isLast,
      parentLasts: [...parentLasts],
      childCount,
      type,
    });

    if (isExpandable && isExpanded && value !== null) {
      nodes.push(...flatten(value, expanded, depth + 1, nodePath, [...parentLasts, isLast]));
    }
  });

  return nodes;
}

const TYPE_COLORS: Record<string, string> = {
  string: '#3fb950',
  number: '#da7756',
  boolean: '#bc8cff',
  null: '#484f58',
  object: '#58a6ff',
  array: '#d29922',
};

function formatValue(value: unknown, type: string): string {
  if (type === 'string') return `"${value}"`;
  if (type === 'null') return 'null';
  return String(value);
}

const VISIBLE = 18;

export default function JsonInspector() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['', 'author', 'config', 'config.features']));
  const [cursor, setCursor] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const nodes = useMemo(() => flatten(SAMPLE_JSON, expanded), [expanded]);

  // Keep cursor in view
  const safeCursor = Math.min(cursor, Math.max(0, nodes.length - 1));

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setCursor(prev => {
        const next = Math.max(0, prev - 1);
        setScrollTop(st => Math.min(st, next));
        return next;
      });
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => {
        const next = Math.min(nodes.length - 1, prev + 1);
        setScrollTop(st => Math.max(st, next - VISIBLE + 1));
        return next;
      });
    } else if (key.return || input === ' ') {
      const node = nodes[safeCursor];
      if (node && node.isExpandable) {
        setExpanded(prev => {
          const next = new Set(prev);
          const pathStr = node.path.join('.');
          if (next.has(pathStr)) next.delete(pathStr);
          else next.add(pathStr);
          return next;
        });
      }
    } else if (input === 'e') {
      // Expand all
      const all = new Set<string>();
      function addPaths(obj: unknown, path: string[] = []) {
        if (typeof obj !== 'object' || obj === null) return;
        const pathStr = path.join('.');
        all.add(pathStr);
        const entries = Array.isArray(obj) ? obj.map((v, i) => [String(i), v] as [string, unknown]) : Object.entries(obj as Record<string, unknown>);
        entries.forEach(([k, v]) => addPaths(v, [...path, k]));
      }
      addPaths(SAMPLE_JSON);
      setExpanded(all);
    } else if (input === 'w') {
      setExpanded(new Set());
      setCursor(0);
      setScrollTop(0);
    }
  });

  const visible = nodes.slice(scrollTop, scrollTop + VISIBLE);
  const currentNode = nodes[safeCursor];
  const currentPath = currentNode ? currentNode.path.join('.') : 'root';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#d29922">JSON Inspector</Text>
      <Text color="gray">Collapsible JSON tree with syntax coloring. Enter/Space=toggle, e=expand all, w=collapse</Text>
      <Box marginTop={1} />

      {/* Path breadcrumb */}
      <Box gap={0}>
        <Text color="#484f58">Path: </Text>
        <Text color="#58a6ff">root</Text>
        {currentNode && currentNode.path.map((seg, i) => (
          <Text key={`p-${i}`}>
            <Text color="#484f58">.</Text>
            <Text color={i === currentNode.path.length - 1 ? '#fdb32a' : '#58a6ff'}>{seg}</Text>
          </Text>
        ))}
      </Box>

      <Box marginTop={1} />

      {/* JSON tree */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={1}>
        {visible.map((node, i) => {
          const globalIdx = scrollTop + i;
          const isActive = globalIdx === safeCursor;

          // Tree connectors
          let prefix = '';
          for (let d = 0; d < node.depth; d++) {
            prefix += node.parentLasts[d] ? '   ' : ' │ ';
          }
          if (node.depth > 0) {
            prefix += node.isLast ? ' └─' : ' ├─';
          }

          const expandIcon = node.isExpandable ? (node.isExpanded ? '▾' : '▸') : ' ';
          const typeColor = TYPE_COLORS[node.type] || 'gray';

          return (
            <Box key={`n-${globalIdx}`}>
              <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
              <Text color="#30363d">{prefix}</Text>
              <Text color={node.isExpandable ? '#58a6ff' : '#484f58'}>{expandIcon} </Text>
              <Text color={isActive ? '#fdb32a' : '#8b949e'} bold={isActive}>
                {Array.isArray(nodes[0]?.value) ? '' : node.key}
              </Text>
              {!node.isExpandable ? (
                <Text>
                  <Text color="#484f58">: </Text>
                  <Text color={typeColor}>{formatValue(node.value, node.type)}</Text>
                </Text>
              ) : (
                <Text>
                  <Text color="#484f58">: </Text>
                  <Text color={typeColor}>
                    {node.type === 'array' ? '[' : '{'}
                  </Text>
                  {!node.isExpanded && (
                    <Text color="#484f58"> {node.childCount} {node.type === 'array' ? 'items' : 'keys'} </Text>
                  )}
                  {!node.isExpanded && (
                    <Text color={typeColor}>
                      {node.type === 'array' ? ']' : '}'}
                    </Text>
                  )}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box marginTop={1} gap={2}>
        <Text color="gray">{nodes.length} nodes</Text>
        <Text color="gray">{expanded.size} expanded</Text>
        {currentNode && <Text color="gray">Type: <Text color={TYPE_COLORS[currentNode.type]}>{currentNode.type}</Text></Text>}
      </Box>

      {/* Type legend */}
      <Box gap={2}>
        <Text color={TYPE_COLORS.string}>string</Text>
        <Text color={TYPE_COLORS.number}>number</Text>
        <Text color={TYPE_COLORS.boolean}>boolean</Text>
        <Text color={TYPE_COLORS.null}>null</Text>
        <Text color={TYPE_COLORS.object}>object</Text>
        <Text color={TYPE_COLORS.array}>array</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
