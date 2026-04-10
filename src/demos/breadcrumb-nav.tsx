// Demo 30: Breadcrumb navigation
// Hierarchical drill-down with path display
// Navigate up by selecting breadcrumb segments

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface NavNode {
  name: string;
  icon: string;
  color: string;
  content: string[];
  children?: NavNode[];
}

const NAV_TREE: NavNode = {
  name: 'Home', icon: '⌂', color: '#58a6ff', content: [
    'Welcome to the Settings panel.',
    'Navigate into any category below.',
    '',
    'Use arrow keys to select, Enter to drill down,',
    'Backspace to go up, or click a breadcrumb segment.',
  ],
  children: [
    { name: 'Account', icon: '◉', color: '#3fb950', content: [
      'Manage your account settings.',
      '',
      'Username:   RogerSquare',
      'Email:      rog@r-that.com',
      'Plan:       Pro',
      'Member since: Sep 2024',
    ], children: [
      { name: 'Profile', icon: '◆', color: '#58a6ff', content: [
        'Edit your public profile.',
        '',
        'Display name:  Roger Ochoa',
        'Bio:           Software Engineer',
        'Location:      Houston, TX',
        'Website:       rogersquare.github.io',
        'Company:       --',
      ]},
      { name: 'Security', icon: '◇', color: '#f85149', content: [
        'Security settings.',
        '',
        'Password:           Last changed 30d ago',
        'Two-factor auth:    Enabled (authenticator)',
        'Sessions:           3 active',
        'SSH keys:           2 registered',
        'Personal tokens:    1 active',
      ], children: [
        { name: 'Sessions', icon: '○', color: '#d29922', content: [
          'Active sessions:',
          '',
          '1. Windows 11 - Chrome    Houston, TX    Active now',
          '2. macOS - Safari         Houston, TX    2h ago',
          '3. iOS - Mobile App       Houston, TX    1d ago',
          '',
          'Press D to revoke a session.',
        ]},
        { name: 'SSH Keys', icon: '○', color: '#d29922', content: [
          'Registered SSH keys:',
          '',
          '1. ed25519 SHA256:a8f3...  QUADRO     Added Mar 2025',
          '2. ed25519 SHA256:c1d9...  MacBook    Added Jan 2026',
        ]},
      ]},
      { name: 'Billing', icon: '◇', color: '#d29922', content: [
        'Billing information.',
        '',
        'Current plan:    Pro ($20/mo)',
        'Next invoice:    May 1, 2026',
        'Payment method:  Visa ****4242',
        'Usage this month: 82%',
      ]},
    ]},
    { name: 'Appearance', icon: '◉', color: '#bc8cff', content: [
      'Customize the look and feel.',
      '',
      'Theme:       Dark',
      'Font size:   14px',
      'Font family: JetBrains Mono',
      'Accent:      Blue (#58a6ff)',
      'Sidebar:     Expanded',
    ], children: [
      { name: 'Themes', icon: '◆', color: '#bc8cff', content: [
        'Available themes:',
        '',
        '  ● Dark          Currently active',
        '  ○ Light         High contrast light',
        '  ○ Solarized     Warm tones',
        '  ○ Nord          Cool blue-gray',
        '  ○ Dracula       Purple accent',
      ]},
      { name: 'Fonts', icon: '◆', color: '#bc8cff', content: [
        'Font settings:',
        '',
        'Editor font:    JetBrains Mono',
        'UI font:        Inter',
        'Terminal font:  Fira Code',
        'Size:           14px',
        'Line height:    1.5',
      ]},
    ]},
    { name: 'Notifications', icon: '◉', color: '#d29922', content: [
      'Notification preferences.',
      '',
      'Email:       Enabled (daily digest)',
      'Push:        Enabled (all)',
      'In-app:      Enabled',
      'Sound:       Disabled',
      'Do not disturb: Off',
    ]},
    { name: 'Integrations', icon: '◉', color: '#da7756', content: [
      'Connected services.',
      '',
      '● GitHub         Connected as RogerSquare',
      '● Slack          Connected to #dev-team',
      '○ Linear         Not connected',
      '○ Vercel         Not connected',
      '○ Discord        Not connected',
    ]},
  ],
};

function getNodeAtPath(path: string[]): NavNode {
  let node = NAV_TREE;
  for (const seg of path) {
    const child = node.children?.find(c => c.name === seg);
    if (!child) break;
    node = child;
  }
  return node;
}

export default function BreadcrumbNav() {
  const [path, setPath] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const [breadcrumbCursor, setBreadcrumbCursor] = useState(-1); // -1 means not in breadcrumb mode

  const currentNode = getNodeAtPath(path);
  const children = currentNode.children || [];
  const safeCursor = Math.min(cursor, Math.max(0, children.length - 1));

  useInput((input, key) => {
    // Breadcrumb mode: left/right to select segment, Enter to jump
    if (breadcrumbCursor >= 0) {
      if (key.leftArrow || input === 'h') {
        setBreadcrumbCursor(prev => Math.max(0, prev - 1));
      } else if (key.rightArrow || input === 'l') {
        setBreadcrumbCursor(prev => Math.min(path.length, prev + 1));
      } else if (key.return) {
        // Navigate to selected breadcrumb
        setPath(path.slice(0, breadcrumbCursor));
        setCursor(0);
        setBreadcrumbCursor(-1);
      } else if (key.escape || key.downArrow) {
        setBreadcrumbCursor(-1);
      }
      return;
    }

    // Normal navigation
    if (key.upArrow || input === 'k') {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => Math.min(children.length - 1, prev + 1));
    } else if (key.return || input === ' ') {
      if (children[safeCursor]) {
        setPath(prev => [...prev, children[safeCursor].name]);
        setCursor(0);
      }
    } else if (key.backspace || key.escape) {
      if (path.length > 0) {
        setPath(prev => prev.slice(0, -1));
        setCursor(0);
      }
    } else if (key.upArrow && key.shift || input === 'b') {
      // Enter breadcrumb mode
      if (path.length > 0) {
        setBreadcrumbCursor(path.length);
      }
    }
  });

  const depth = path.length;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Breadcrumb Navigation</Text>
      <Text color="gray">Enter=drill down, Backspace=go up, b=breadcrumb mode</Text>
      <Box marginTop={1} />

      {/* Breadcrumb bar */}
      <Box borderStyle="round" borderColor={breadcrumbCursor >= 0 ? '#fdb32a' : '#30363d'} paddingX={1}>
        <Text
          color={breadcrumbCursor === 0 ? '#fdb32a' : '#58a6ff'}
          bold={breadcrumbCursor === 0}
          backgroundColor={breadcrumbCursor === 0 ? '#3d2e00' : undefined}
        >
          {NAV_TREE.icon} Home
        </Text>
        {path.map((seg, i) => {
          const node = getNodeAtPath(path.slice(0, i + 1));
          const isBcActive = breadcrumbCursor === i + 1;
          return (
            <Text key={`bc-${i}`}>
              <Text color="#30363d"> {'>'} </Text>
              <Text
                color={isBcActive ? '#fdb32a' : (i === path.length - 1 ? 'white' : '#8b949e')}
                bold={isBcActive || i === path.length - 1}
                backgroundColor={isBcActive ? '#3d2e00' : undefined}
              >
                {node.icon} {seg}
              </Text>
            </Text>
          );
        })}
        {breadcrumbCursor >= 0 && (
          <Text color="gray" dimColor>  (←→ select, Enter=jump)</Text>
        )}
      </Box>

      <Box marginTop={1} />

      {/* Content area */}
      <Box flexDirection="column" borderStyle="round" borderColor={currentNode.color} paddingX={2} paddingY={1} minHeight={10}>
        {currentNode.content.map((line, i) => (
          <Text key={`cl-${i}`} color={i === 0 ? currentNode.color : '#c9d1d9'} bold={i === 0}>{line || ' '}</Text>
        ))}
      </Box>

      {/* Children list */}
      {children.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="gray" dimColor>Navigate to:</Text>
          <Box marginTop={0} />
          {children.map((child, i) => {
            const isActive = i === safeCursor;
            const hasChildren = child.children && child.children.length > 0;
            return (
              <Box key={child.name} gap={1}>
                <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
                <Text color={child.color}>{child.icon}</Text>
                <Text color={isActive ? 'white' : 'gray'} bold={isActive}>{child.name}</Text>
                {hasChildren && <Text color="#30363d">{'>'}</Text>}
                {isActive && <Text color="gray" dimColor>— {child.content[0]}</Text>}
              </Box>
            );
          })}
        </Box>
      )}

      {children.length === 0 && path.length > 0 && (
        <Box marginTop={1}>
          <Text color="gray" dimColor>End of path. Press Backspace to go up.</Text>
        </Box>
      )}

      {/* Footer */}
      <Box marginTop={1} gap={2}>
        <Text color="gray">Depth: {depth}</Text>
        <Text color="gray">{children.length} items</Text>
        {breadcrumbCursor >= 0 && <Text color="#fdb32a">Breadcrumb mode</Text>}
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
