// Demo 4: Interactive selection menus
// Multiple choice with arrow keys, number shortcuts, and visual feedback

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface MenuItem {
  label: string;
  value: string;
  description: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Approve', value: 'approve', description: 'Allow this action to proceed', icon: '✓' },
  { label: 'Deny', value: 'deny', description: 'Block this action', icon: '✕' },
  { label: 'Edit', value: 'edit', description: 'Modify the action before proceeding', icon: '✎' },
  { label: 'Skip', value: 'skip', description: 'Skip this step entirely', icon: '→' },
  { label: 'Always Allow', value: 'always', description: 'Remember this choice for the session', icon: '◎' },
];

const COLORS = {
  approve: '#3fb950',
  deny: '#f85149',
  edit: '#58a6ff',
  skip: '#8b949e',
  always: '#da7756',
};

export default function SelectMenu() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useInput((input, key) => {
    if (selected) {
      // Any key to reset after selection
      setSelected(null);
      return;
    }

    if (key.upArrow || input === 'k') {
      setActiveIdx(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setActiveIdx(prev => Math.min(MENU_ITEMS.length - 1, prev + 1));
    } else if (key.return) {
      const item = MENU_ITEMS[activeIdx];
      setSelected(item.value);
      setHistory(prev => [...prev.slice(-4), item.label]);
    } else if (input >= '1' && input <= '5') {
      const idx = parseInt(input) - 1;
      if (idx < MENU_ITEMS.length) {
        setActiveIdx(idx);
        const item = MENU_ITEMS[idx];
        setSelected(item.value);
        setHistory(prev => [...prev.slice(-4), item.label]);
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Interactive Selection Menu</Text>
      <Text color="gray">Arrow keys or j/k to navigate, Enter or number to select</Text>
      <Box marginTop={1} />

      {/* Prompt */}
      <Text color="white" bold>Allow tool: <Text color="#da7756">Edit(src/config.ts)</Text></Text>
      <Box marginTop={1} />

      {/* Menu items */}
      {MENU_ITEMS.map((item, i) => {
        const isActive = i === activeIdx;
        const isSelected = selected === item.value;
        const color = COLORS[item.value as keyof typeof COLORS] || 'white';

        return (
          <Box key={item.value} gap={1}>
            <Text color={isActive ? color : 'gray'}>
              {isActive ? '❯' : ' '}
            </Text>
            <Text color="gray" dimColor>{i + 1}.</Text>
            <Text color={isActive ? color : 'gray'} bold={isActive}>
              {item.icon} {item.label}
            </Text>
            {isActive && (
              <Text color="gray" dimColor> — {item.description}</Text>
            )}
            {isSelected && (
              <Text color={color}> ✓</Text>
            )}
          </Box>
        );
      })}

      {/* Selection feedback */}
      {selected && (
        <Box marginTop={1} borderStyle="round" borderColor={COLORS[selected as keyof typeof COLORS] || 'gray'} paddingX={1}>
          <Text color={COLORS[selected as keyof typeof COLORS] || 'white'}>
            Selected: {MENU_ITEMS.find(m => m.value === selected)?.label}
          </Text>
          <Text color="gray"> — press any key to reset</Text>
        </Box>
      )}

      {/* History */}
      {history.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text color="gray" dimColor>Selection history:</Text>
          <Text color="gray" dimColor>{history.join(' → ')}</Text>
        </Box>
      )}

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
