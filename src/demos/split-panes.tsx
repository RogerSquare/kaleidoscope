// Demo 18: Split panes layout
// Resizable side-by-side panels with focus switching
// Like tmux or lazygit panel layout

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';

interface FileEntry {
  name: string;
  size: string;
  modified: string;
  content: string[];
}

const FILES: FileEntry[] = [
  { name: 'server.js', size: '7.8 KB', modified: '2h ago', content: [
    'const express = require("express");',
    'const { execFile } = require("child_process");',
    'const path = require("path");',
    '',
    'const app = express();',
    'const PORT = process.env.PORT || 3005;',
    '',
    '// Input validation helpers',
    'const VALID_PERMISSIONS = [',
    '  "pull", "triage", "push",',
    '  "maintain", "admin"',
    '];',
    '',
    'app.use(express.json());',
    'app.use(express.static("public"));',
    '',
    'app.get("/api/user", async (req, res) => {',
    '  const user = await gh(["api", "user"]);',
    '  res.json(user);',
    '});',
  ]},
  { name: 'package.json', size: '1.2 KB', modified: '1d ago', content: [
    '{',
    '  "name": "gh-collab-manager",',
    '  "version": "1.0.0",',
    '  "type": "module",',
    '  "scripts": {',
    '    "dev": "node server.js"',
    '  },',
    '  "dependencies": {',
    '    "express": "^5.2.1"',
    '  }',
    '}',
  ]},
  { name: 'README.md', size: '3.2 KB', modified: '3d ago', content: [
    '# GitHub Collab Manager',
    '',
    'A local web tool for managing GitHub',
    'repository collaborators, contributors,',
    'and co-author credits.',
    '',
    '## Features',
    '- Add/remove collaborators',
    '- Change permission levels',
    '- View contributors',
    '- Remove co-author credits',
    '- Audit log',
  ]},
  { name: 'tsconfig.json', size: '0.5 KB', modified: '5d ago', content: [
    '{',
    '  "compilerOptions": {',
    '    "target": "ES2022",',
    '    "module": "nodenext",',
    '    "strict": true,',
    '    "outDir": "dist"',
    '  },',
    '  "include": ["src"]',
    '}',
  ]},
  { name: '.gitignore', size: '0.1 KB', modified: '1w ago', content: [
    'node_modules/',
    'dist/',
    '*.log',
    '.env',
    '.DS_Store',
  ]},
  { name: 'Dockerfile', size: '0.6 KB', modified: '2w ago', content: [
    'FROM node:20-alpine',
    'WORKDIR /app',
    'COPY package*.json ./',
    'RUN npm ci --production',
    'COPY . .',
    'EXPOSE 3005',
    'CMD ["node", "server.js"]',
  ]},
];

export default function SplitPanes() {
  const [focusPane, setFocusPane] = useState<'left' | 'right'>('left');
  const [selectedFile, setSelectedFile] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [splitRatio, setSplitRatio] = useState(35); // percentage for left pane
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 80;

  const leftWidth = Math.max(20, Math.floor(termWidth * splitRatio / 100));
  const rightWidth = Math.max(20, termWidth - leftWidth - 4); // 4 for padding/divider
  const previewHeight = 16;

  const file = FILES[selectedFile];
  const visibleLines = file.content.slice(scrollTop, scrollTop + previewHeight);

  useInput((input, key) => {
    if (key.tab) {
      setFocusPane(prev => prev === 'left' ? 'right' : 'left');
    } else if (input === '+' || input === '=') {
      setSplitRatio(prev => Math.min(60, prev + 5));
    } else if (input === '-') {
      setSplitRatio(prev => Math.max(20, prev - 5));
    }

    if (focusPane === 'left') {
      if (key.upArrow || input === 'k') {
        setSelectedFile(prev => Math.max(0, prev - 1));
        setScrollTop(0);
      } else if (key.downArrow || input === 'j') {
        setSelectedFile(prev => Math.min(FILES.length - 1, prev + 1));
        setScrollTop(0);
      }
    } else {
      if (key.upArrow || input === 'k') {
        setScrollTop(prev => Math.max(0, prev - 1));
      } else if (key.downArrow || input === 'j') {
        setScrollTop(prev => Math.min(Math.max(0, file.content.length - previewHeight), prev + 1));
      }
    }
  });

  const leftBorder = focusPane === 'left' ? '#58a6ff' : '#30363d';
  const rightBorder = focusPane === 'right' ? '#58a6ff' : '#30363d';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Split Panes Layout</Text>
      <Text color="gray">Tab=switch pane, ↑↓/jk=navigate, +/-=resize split ({splitRatio}%/{100 - splitRatio}%)</Text>
      <Box marginTop={1} />

      <Box>
        {/* Left pane: file list */}
        <Box
          flexDirection="column"
          width={leftWidth}
          borderStyle="round"
          borderColor={leftBorder}
          paddingX={1}
        >
          <Box marginBottom={1}>
            <Text color={focusPane === 'left' ? '#58a6ff' : '#8b949e'} bold>
              Files ({FILES.length})
            </Text>
          </Box>
          {FILES.map((f, i) => {
            const isActive = i === selectedFile;
            const ext = f.name.split('.').pop() || '';
            const iconColor = ext === 'js' ? '#f1e05a' : ext === 'json' ? '#d29922' : ext === 'md' ? '#58a6ff' : ext === 'ts' ? '#3178c6' : '#8b949e';
            return (
              <Box key={f.name} gap={1}>
                <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
                <Text color={iconColor}>◆</Text>
                <Text color={isActive ? 'white' : 'gray'} bold={isActive}>
                  {f.name.length > leftWidth - 10 ? f.name.slice(0, leftWidth - 13) + '...' : f.name}
                </Text>
              </Box>
            );
          })}
          <Box marginTop={1}>
            <Text color="gray" dimColor>{file.size} | {file.modified}</Text>
          </Box>
        </Box>

        {/* Divider */}
        <Box flexDirection="column" paddingX={0}>
          {Array.from({ length: previewHeight + 4 }, (_, i) => (
            <Text key={`div-${i}`} color="#30363d">│</Text>
          ))}
        </Box>

        {/* Right pane: file preview */}
        <Box
          flexDirection="column"
          width={rightWidth}
          borderStyle="round"
          borderColor={rightBorder}
          paddingX={1}
        >
          <Box marginBottom={1} gap={1}>
            <Text color={focusPane === 'right' ? '#58a6ff' : '#8b949e'} bold>
              {file.name}
            </Text>
            <Text color="gray" dimColor>
              ({file.content.length} lines)
            </Text>
          </Box>
          {visibleLines.map((line, i) => {
            const lineNum = scrollTop + i + 1;
            return (
              <Box key={`line-${lineNum}`}>
                <Text color="#30363d">{String(lineNum).padStart(3)} </Text>
                <Text color="white">{line.slice(0, rightWidth - 6) || ' '}</Text>
              </Box>
            );
          })}
          {/* Pad remaining lines */}
          {Array.from({ length: Math.max(0, previewHeight - visibleLines.length) }, (_, i) => (
            <Box key={`pad-${i}`}>
              <Text color="#30363d">{' '.repeat(3)} ~</Text>
            </Box>
          ))}
          {file.content.length > previewHeight && (
            <Text color="gray" dimColor>
              Lines {scrollTop + 1}-{Math.min(scrollTop + previewHeight, file.content.length)} of {file.content.length}
            </Text>
          )}
        </Box>
      </Box>

      <Box marginTop={1} />
      <Box gap={2}>
        <Text color={focusPane === 'left' ? '#58a6ff' : 'gray'}>
          {focusPane === 'left' ? '●' : '○'} File List
        </Text>
        <Text color={focusPane === 'right' ? '#58a6ff' : 'gray'}>
          {focusPane === 'right' ? '●' : '○'} Preview
        </Text>
        <Text color="gray">Split: {splitRatio}/{100 - splitRatio}</Text>
      </Box>
      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
