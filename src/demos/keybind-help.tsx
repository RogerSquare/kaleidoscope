// Demo 25: Keyboard shortcut cheatsheet
// Press ? to toggle help overlay, grouped by category
// Color-coded modifier keys, scrollable

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface Keybind {
  keys: string[];
  desc: string;
}

interface Category {
  name: string;
  color: string;
  icon: string;
  bindings: Keybind[];
}

const CATEGORIES: Category[] = [
  { name: 'Navigation', color: '#58a6ff', icon: '→', bindings: [
    { keys: ['↑', '↓'], desc: 'Move up / down' },
    { keys: ['←', '→'], desc: 'Move left / right' },
    { keys: ['Ctrl', 'Home'], desc: 'Go to beginning of file' },
    { keys: ['Ctrl', 'End'], desc: 'Go to end of file' },
    { keys: ['Alt', '←'], desc: 'Jump to previous word' },
    { keys: ['Alt', '→'], desc: 'Jump to next word' },
    { keys: ['Ctrl', 'G'], desc: 'Go to line number' },
    { keys: ['PgUp'], desc: 'Page up' },
    { keys: ['PgDn'], desc: 'Page down' },
  ]},
  { name: 'Editing', color: '#3fb950', icon: '✎', bindings: [
    { keys: ['Ctrl', 'Z'], desc: 'Undo last change' },
    { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo last change' },
    { keys: ['Ctrl', 'X'], desc: 'Cut selection' },
    { keys: ['Ctrl', 'C'], desc: 'Copy selection' },
    { keys: ['Ctrl', 'V'], desc: 'Paste from clipboard' },
    { keys: ['Ctrl', 'D'], desc: 'Duplicate current line' },
    { keys: ['Ctrl', 'Shift', 'K'], desc: 'Delete current line' },
    { keys: ['Tab'], desc: 'Indent selection' },
    { keys: ['Shift', 'Tab'], desc: 'Outdent selection' },
  ]},
  { name: 'Search', color: '#d29922', icon: '⌕', bindings: [
    { keys: ['Ctrl', 'F'], desc: 'Find in file' },
    { keys: ['Ctrl', 'H'], desc: 'Find and replace' },
    { keys: ['Ctrl', 'Shift', 'F'], desc: 'Search across files' },
    { keys: ['F3'], desc: 'Find next match' },
    { keys: ['Shift', 'F3'], desc: 'Find previous match' },
    { keys: ['Ctrl', 'P'], desc: 'Quick open file (fuzzy)' },
  ]},
  { name: 'View', color: '#bc8cff', icon: '◱', bindings: [
    { keys: ['Ctrl', 'B'], desc: 'Toggle sidebar' },
    { keys: ['Ctrl', '`'], desc: 'Toggle terminal' },
    { keys: ['Ctrl', 'Shift', 'E'], desc: 'Show file explorer' },
    { keys: ['Ctrl', 'Shift', 'M'], desc: 'Show problems panel' },
    { keys: ['Ctrl', '+'], desc: 'Zoom in' },
    { keys: ['Ctrl', '-'], desc: 'Zoom out' },
  ]},
  { name: 'Git', color: '#da7756', icon: '⎇', bindings: [
    { keys: ['Ctrl', 'Shift', 'G'], desc: 'Open source control' },
    { keys: ['Ctrl', 'Enter'], desc: 'Commit staged changes' },
    { keys: ['Ctrl', 'Shift', 'P'], desc: 'Git push' },
    { keys: ['Alt', 'Shift', 'P'], desc: 'Git pull' },
  ]},
  { name: 'Tools', color: '#f85149', icon: '⚙', bindings: [
    { keys: ['Ctrl', 'Shift', 'P'], desc: 'Command palette' },
    { keys: ['Ctrl', ','], desc: 'Open settings' },
    { keys: ['Ctrl', 'Shift', 'I'], desc: 'Format document' },
    { keys: ['F2'], desc: 'Rename symbol' },
    { keys: ['F12'], desc: 'Go to definition' },
    { keys: ['Ctrl', '.'], desc: 'Quick fix' },
  ]},
];

const MOD_COLORS: Record<string, string> = {
  Ctrl: '#58a6ff',
  Shift: '#d29922',
  Alt: '#bc8cff',
};

function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <Box gap={0}>
      {keys.map((key, i) => {
        const modColor = MOD_COLORS[key];
        return (
          <Text key={`k-${i}`}>
            {i > 0 && <Text color="#30363d"> + </Text>}
            <Text
              color={modColor || '#c9d1d9'}
              bold={!!modColor}
              backgroundColor={modColor ? undefined : '#21262d'}
            >
              {modColor ? key : ` ${key} `}
            </Text>
          </Text>
        );
      })}
    </Box>
  );
}

export default function KeybindHelp() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [simAction, setSimAction] = useState('');

  const VISIBLE_BINDS = 8;

  useInput((input, key) => {
    if (input === '?' || (input === '/' && !showOverlay)) {
      setShowOverlay(prev => !prev);
      setScrollTop(0);
      return;
    }

    if (showOverlay) {
      if (key.escape) { setShowOverlay(false); return; }
      if (key.leftArrow || input === 'h') setActiveCategory(prev => Math.max(0, prev - 1));
      else if (key.rightArrow || input === 'l') setActiveCategory(prev => Math.min(CATEGORIES.length - 1, prev + 1));
      else if (key.upArrow || input === 'k') setScrollTop(prev => Math.max(0, prev - 1));
      else if (key.downArrow || input === 'j') setScrollTop(prev => {
        const max = Math.max(0, CATEGORIES[activeCategory].bindings.length - VISIBLE_BINDS);
        return Math.min(max, prev + 1);
      });
      else if (key.tab) {
        setActiveCategory(prev => (prev + 1) % CATEGORIES.length);
        setScrollTop(0);
      }
      return;
    }

    // Simulate actions when overlay is closed
    if (input === 's') setSimAction('Saved file');
    else if (input === 'f') setSimAction('Find opened');
    else if (input === 'p') setSimAction('Command palette opened');
    else if (input === 'z') setSimAction('Undo');
    else if (input === 'r') setSimAction('Redo');
    else setSimAction('');
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#d29922">Keyboard Shortcut Cheatsheet</Text>
      <Text color="gray">Press <Text color="#fdb32a" bold>?</Text> to toggle the help overlay</Text>
      <Box marginTop={1} />

      {!showOverlay ? (
        /* Main content area when help is hidden */
        <Box flexDirection="column">
          <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={50}>
            <Text color="white" bold>Editor</Text>
            <Box marginTop={1} />
            <Text color="gray">Try pressing keys: s=save, f=find, p=palette, z=undo, r=redo</Text>
            <Box marginTop={1} />
            {simAction ? (
              <Text color="#3fb950" bold>{simAction}</Text>
            ) : (
              <Text color="gray" dimColor>Press ? for keyboard shortcuts</Text>
            )}
            <Box marginTop={1} />
            <Text color="gray" dimColor>This simulates an editor where ? opens</Text>
            <Text color="gray" dimColor>a discoverable keybinding reference.</Text>
          </Box>

          <Box marginTop={1} />
          <Box gap={2}>
            <Text color="#8b949e"><Text color="#fdb32a">?</Text> shortcuts</Text>
            <Text color="#8b949e"><Text color="#58a6ff">s</Text> save</Text>
            <Text color="#8b949e"><Text color="#58a6ff">f</Text> find</Text>
            <Text color="#8b949e"><Text color="#58a6ff">p</Text> palette</Text>
            <Text color="#8b949e"><Text color="#58a6ff">z</Text> undo</Text>
          </Box>
        </Box>
      ) : (
        /* Help overlay */
        <Box flexDirection="column">
          {/* Category tabs */}
          <Box gap={0}>
            {CATEGORIES.map((cat, i) => {
              const isActive = i === activeCategory;
              return (
                <Box key={cat.name} flexDirection="column">
                  <Box paddingX={1}>
                    <Text color={isActive ? cat.color : '#484f58'} bold={isActive}>
                      {cat.icon} {cat.name}
                    </Text>
                  </Box>
                  <Text color={isActive ? cat.color : '#21262d'}>
                    {isActive ? '━'.repeat(cat.name.length + 4) : '─'.repeat(cat.name.length + 4)}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Bindings list */}
          <Box flexDirection="column" borderStyle="round" borderColor={CATEGORIES[activeCategory].color} paddingX={2} paddingY={1} width={56}>
            <Text color={CATEGORIES[activeCategory].color} bold>
              {CATEGORIES[activeCategory].icon} {CATEGORIES[activeCategory].name} Shortcuts
            </Text>
            <Box marginTop={1} />

            {CATEGORIES[activeCategory].bindings.slice(scrollTop, scrollTop + VISIBLE_BINDS).map((bind, i) => (
              <Box key={`bind-${i}`} justifyContent="space-between" gap={2}>
                <Box width={24}>
                  <KeyCombo keys={bind.keys} />
                </Box>
                <Text color="gray">{bind.desc}</Text>
              </Box>
            ))}

            {CATEGORIES[activeCategory].bindings.length > VISIBLE_BINDS && (
              <Box marginTop={1}>
                <Text color="gray" dimColor>
                  {scrollTop + 1}-{Math.min(scrollTop + VISIBLE_BINDS, CATEGORIES[activeCategory].bindings.length)} of {CATEGORIES[activeCategory].bindings.length}
                  {scrollTop > 0 ? ' ↑' : ''}{scrollTop + VISIBLE_BINDS < CATEGORIES[activeCategory].bindings.length ? ' ↓' : ''}
                </Text>
              </Box>
            )}
          </Box>

          {/* Legend */}
          <Box marginTop={1} gap={3}>
            <Text color="#58a6ff">Ctrl</Text>
            <Text color="#d29922">Shift</Text>
            <Text color="#bc8cff">Alt</Text>
            <Text backgroundColor="#21262d" color="#c9d1d9"> Key </Text>
          </Box>

          <Box marginTop={1} gap={2}>
            <Text color="#8b949e"><Text color="#58a6ff">←→</Text> category</Text>
            <Text color="#8b949e"><Text color="#58a6ff">↑↓</Text> scroll</Text>
            <Text color="#8b949e"><Text color="#58a6ff">Tab</Text> next</Text>
            <Text color="#8b949e"><Text color="#58a6ff">Esc</Text> close</Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
