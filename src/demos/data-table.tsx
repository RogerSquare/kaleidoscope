// Demo 12: Sortable data table
// Column headers with sort indicators, color-coded values
// Keyboard navigation for rows and sort toggling

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

interface Row {
  name: string;
  language: string;
  stars: number;
  issues: number;
  status: 'healthy' | 'warning' | 'critical';
  updated: string;
}

const DATA: Row[] = [
  { name: 'Artifex', language: 'TypeScript', stars: 342, issues: 5, status: 'healthy', updated: '2h ago' },
  { name: 'agent-task-board', language: 'JavaScript', stars: 128, issues: 12, status: 'warning', updated: '15m ago' },
  { name: 'portfolio', language: 'Go', stars: 89, issues: 0, status: 'healthy', updated: '3d ago' },
  { name: 'Lumeo', language: 'Swift', stars: 56, issues: 3, status: 'healthy', updated: '1d ago' },
  { name: 'GameThemeMusic', language: 'TypeScript', stars: 1205, issues: 24, status: 'critical', updated: '5h ago' },
  { name: 'gh-collab-manager', language: 'JavaScript', stars: 15, issues: 1, status: 'healthy', updated: '30m ago' },
  { name: 'terminal-ui', language: 'TypeScript', stars: 203, issues: 8, status: 'warning', updated: '1h ago' },
  { name: 'data-pipeline', language: 'Python', stars: 467, issues: 2, status: 'healthy', updated: '4h ago' },
  { name: 'auth-service', language: 'Rust', stars: 891, issues: 0, status: 'healthy', updated: '6d ago' },
  { name: 'mobile-app', language: 'Swift', stars: 78, issues: 31, status: 'critical', updated: '45m ago' },
  { name: 'infra-config', language: 'HCL', stars: 34, issues: 7, status: 'warning', updated: '2d ago' },
  { name: 'docs-site', language: 'MDX', stars: 22, issues: 0, status: 'healthy', updated: '1w ago' },
];

interface Column {
  key: keyof Row;
  label: string;
  width: number;
  align: 'left' | 'right';
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Repository', width: 22, align: 'left' },
  { key: 'language', label: 'Language', width: 14, align: 'left' },
  { key: 'stars', label: 'Stars', width: 8, align: 'right' },
  { key: 'issues', label: 'Issues', width: 8, align: 'right' },
  { key: 'status', label: 'Status', width: 10, align: 'left' },
  { key: 'updated', label: 'Updated', width: 10, align: 'right' },
];

const STATUS_STYLES: Record<string, { icon: string; color: string }> = {
  healthy:  { icon: '●', color: '#3fb950' },
  warning:  { icon: '▲', color: '#d29922' },
  critical: { icon: '✕', color: '#f85149' },
};

type SortDir = 'asc' | 'desc';

function padCell(val: string, width: number, align: 'left' | 'right'): string {
  if (val.length > width) return val.slice(0, width - 1) + '…';
  return align === 'right' ? val.padStart(width) : val.padEnd(width);
}

export default function DataTable() {
  const [sortCol, setSortCol] = useState(0);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeRow, setActiveRow] = useState(0);

  const sorted = useMemo(() => {
    const col = COLUMNS[sortCol];
    return [...DATA].sort((a, b) => {
      const aVal = a[col.key];
      const bVal = b[col.key];
      let cmp: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortCol, sortDir]);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setActiveRow(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setActiveRow(prev => Math.min(sorted.length - 1, prev + 1));
    } else if (key.leftArrow || input === 'h') {
      setSortCol(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow || input === 'l') {
      setSortCol(prev => Math.min(COLUMNS.length - 1, prev + 1));
    } else if (input === 's' || key.return) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else if (key.tab) {
      setSortCol(prev => (prev + 1) % COLUMNS.length);
    }
  });

  const totalWidth = COLUMNS.reduce((s, c) => s + c.width, 0) + COLUMNS.length + 2;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#e8945a">Sortable Data Table</Text>
      <Text color="gray">←→/hl change sort column, s/Enter toggle direction, ↑↓/jk select row</Text>
      <Box marginTop={1} />

      {/* Column headers */}
      <Box>
        <Text color="gray"> </Text>
        {COLUMNS.map((col, i) => {
          const isSort = i === sortCol;
          const arrow = isSort ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '  ';
          const label = padCell(col.label, col.width - 2, col.align);
          return (
            <Box key={col.key}>
              <Text color={isSort ? '#fdb32a' : '#8b949e'} bold={isSort}>
                {label}{arrow}
              </Text>
              {i < COLUMNS.length - 1 && <Text color="#30363d"> │ </Text>}
            </Box>
          );
        })}
      </Box>

      {/* Separator */}
      <Box>
        <Text color="#30363d">{' ' + '─'.repeat(totalWidth)}</Text>
      </Box>

      {/* Data rows */}
      {sorted.map((row, rowIdx) => {
        const isActive = rowIdx === activeRow;
        return (
          <Box key={row.name}>
            <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
            {COLUMNS.map((col, colIdx) => {
              let val = String(row[col.key]);
              let color = isActive ? 'white' : 'gray';

              // Special rendering for certain columns
              if (col.key === 'status') {
                const st = STATUS_STYLES[row.status];
                return (
                  <Box key={col.key}>
                    <Text color={st.color}>
                      {padCell(`${st.icon} ${val}`, col.width, col.align)}
                    </Text>
                    {colIdx < COLUMNS.length - 1 && <Text color="#30363d"> │ </Text>}
                  </Box>
                );
              }

              if (col.key === 'stars') {
                color = isActive ? '#fdb32a' : (row.stars > 500 ? '#fdb32a' : row.stars > 100 ? '#d29922' : '#8b949e');
              }
              if (col.key === 'issues') {
                color = row.issues > 20 ? '#f85149' : row.issues > 5 ? '#d29922' : isActive ? 'white' : '#8b949e';
              }
              if (col.key === 'name') {
                color = isActive ? '#58a6ff' : 'white';
              }

              return (
                <Box key={col.key}>
                  <Text color={color} bold={isActive && col.key === 'name'}>
                    {padCell(val, col.width, col.align)}
                  </Text>
                  {colIdx < COLUMNS.length - 1 && <Text color="#30363d"> │ </Text>}
                </Box>
              );
            })}
          </Box>
        );
      })}

      {/* Footer */}
      <Box marginTop={1} />
      <Box>
        <Text color="#30363d">{' ' + '─'.repeat(totalWidth)}</Text>
      </Box>
      <Box gap={2}>
        <Text color="gray">{sorted.length} rows</Text>
        <Text color="gray">Sorted by: <Text color="#fdb32a" bold>{COLUMNS[sortCol].label}</Text> <Text color="#fdb32a">{sortDir === 'asc' ? '▲' : '▼'}</Text></Text>
        <Text color="gray">Row {activeRow + 1}/{sorted.length}</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
