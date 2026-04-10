// Demo 13: Checkbox multi-select list
// Space to toggle, select all/none, invert, bulk actions

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

interface Item {
  id: number;
  name: string;
  size: string;
  type: string;
  icon: string;
}

const ITEMS: Item[] = [
  { id: 1, name: 'package.json', size: '1.2 KB', type: 'config', icon: '{}' },
  { id: 2, name: 'tsconfig.json', size: '0.4 KB', type: 'config', icon: '{}' },
  { id: 3, name: 'README.md', size: '3.8 KB', type: 'docs', icon: '#' },
  { id: 4, name: 'src/app.tsx', size: '2.1 KB', type: 'source', icon: '◇' },
  { id: 5, name: 'src/index.ts', size: '0.3 KB', type: 'source', icon: '◇' },
  { id: 6, name: 'src/utils.ts', size: '1.7 KB', type: 'source', icon: '◇' },
  { id: 7, name: 'src/types.ts', size: '0.8 KB', type: 'source', icon: '◇' },
  { id: 8, name: 'tests/app.test.ts', size: '4.2 KB', type: 'test', icon: '⬡' },
  { id: 9, name: 'tests/utils.test.ts', size: '2.9 KB', type: 'test', icon: '⬡' },
  { id: 10, name: '.gitignore', size: '0.1 KB', type: 'config', icon: '◦' },
  { id: 11, name: '.env.example', size: '0.2 KB', type: 'config', icon: '◦' },
  { id: 12, name: 'Dockerfile', size: '0.6 KB', type: 'devops', icon: '▣' },
  { id: 13, name: 'docker-compose.yml', size: '0.9 KB', type: 'devops', icon: '▣' },
  { id: 14, name: 'LICENSE', size: '1.1 KB', type: 'docs', icon: '§' },
  { id: 15, name: '.github/workflows/ci.yml', size: '1.4 KB', type: 'devops', icon: '▣' },
];

const TYPE_COLORS: Record<string, string> = {
  config: '#d29922',
  docs: '#58a6ff',
  source: '#3fb950',
  test: '#bc8cff',
  devops: '#da7756',
};

export default function CheckboxSelect() {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [lastAction, setLastAction] = useState('');

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    selected.forEach(id => {
      const item = ITEMS.find(i => i.id === id);
      if (item) byType[item.type] = (byType[item.type] || 0) + 1;
    });
    return byType;
  }, [selected]);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => Math.min(ITEMS.length - 1, prev + 1));
    } else if (input === ' ') {
      // Toggle current item
      setSelected(prev => {
        const next = new Set(prev);
        const id = ITEMS[cursor].id;
        if (next.has(id)) { next.delete(id); setLastAction(`Deselected: ${ITEMS[cursor].name}`); }
        else { next.add(id); setLastAction(`Selected: ${ITEMS[cursor].name}`); }
        return next;
      });
    } else if (input === 'a') {
      // Select all
      setSelected(new Set(ITEMS.map(i => i.id)));
      setLastAction('Selected all');
    } else if (input === 'n') {
      // Deselect all
      setSelected(new Set());
      setLastAction('Deselected all');
    } else if (input === 'i') {
      // Invert selection
      setSelected(prev => {
        const next = new Set<number>();
        ITEMS.forEach(item => { if (!prev.has(item.id)) next.add(item.id); });
        return next;
      });
      setLastAction('Inverted selection');
    } else if (input === 't') {
      // Select by type matching current item
      const type = ITEMS[cursor].type;
      setSelected(prev => {
        const next = new Set(prev);
        ITEMS.filter(i => i.type === type).forEach(i => next.add(i.id));
        return next;
      });
      setLastAction(`Selected all ${ITEMS[cursor].type} files`);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#bc8cff">Checkbox Multi-Select</Text>
      <Text color="gray">Space toggle, a=all, n=none, i=invert, t=select by type</Text>
      <Box marginTop={1} />

      {/* List */}
      {ITEMS.map((item, idx) => {
        const isActive = idx === cursor;
        const isChecked = selected.has(item.id);
        const typeColor = TYPE_COLORS[item.type] || 'gray';

        return (
          <Box key={item.id} gap={1}>
            <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
            <Text color={isChecked ? '#3fb950' : '#30363d'}>
              {isChecked ? '[✓]' : '[ ]'}
            </Text>
            <Text color={typeColor}>{item.icon}</Text>
            <Text color={isActive ? 'white' : 'gray'} bold={isActive}>
              {item.name.padEnd(30)}
            </Text>
            <Text color="gray" dimColor>{item.size.padStart(7)}</Text>
            <Text color={typeColor} dimColor> {item.type}</Text>
          </Box>
        );
      })}

      {/* Selection summary */}
      <Box marginTop={1}>
        <Text color="gray">{'─'.repeat(56)}</Text>
      </Box>
      <Box gap={2}>
        <Text color={selected.size > 0 ? '#3fb950' : 'gray'} bold>
          {selected.size}/{ITEMS.length} selected
        </Text>
        {Object.entries(stats).map(([type, count]) => (
          <Text key={type} color={TYPE_COLORS[type] || 'gray'}>
            {type}: {count}
          </Text>
        ))}
      </Box>

      {lastAction && (
        <Box marginTop={0}>
          <Text color="gray" dimColor>Last: {lastAction}</Text>
        </Box>
      )}

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
