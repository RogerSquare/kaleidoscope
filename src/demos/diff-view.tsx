// Demo 7: Terminal-optimized diff display
// Shows how code diffs can be rendered with syntax highlighting in the terminal

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNum?: number;
}

const DIFF_LINES: DiffLine[] = [
  { type: 'header', content: '── src/config.ts ──' },
  { type: 'context', content: '  import express from "express";', lineNum: 1 },
  { type: 'context', content: '  const app = express();', lineNum: 2 },
  { type: 'remove',  content: '  const PORT = 3000;', lineNum: 3 },
  { type: 'add',     content: '  const PORT = parseInt(process.env.PORT) || 3000;', lineNum: 3 },
  { type: 'context', content: '', lineNum: 4 },
  { type: 'remove',  content: '  app.use(cors());', lineNum: 5 },
  { type: 'add',     content: '  app.use(cors({ origin: ALLOWED_ORIGINS }));', lineNum: 5 },
  { type: 'add',     content: '  app.use(rateLimit({ windowMs: 60000, max: 100 }));', lineNum: 6 },
  { type: 'context', content: '  app.use(express.json());', lineNum: 7 },
  { type: 'context', content: '', lineNum: 8 },
  { type: 'header', content: '── src/auth.ts ──' },
  { type: 'context', content: '  export function validateToken(token: string) {', lineNum: 12 },
  { type: 'remove',  content: '    if (!token) return false;', lineNum: 13 },
  { type: 'add',     content: '    if (!token || token.length < 32) return false;', lineNum: 13 },
  { type: 'add',     content: '    if (isTokenExpired(token)) return false;', lineNum: 14 },
  { type: 'context', content: '    return jwt.verify(token, SECRET);', lineNum: 15 },
  { type: 'context', content: '  }', lineNum: 16 },
];

export default function DiffView() {
  const [revealIdx, setRevealIdx] = useState(0);
  const [mode, setMode] = useState<'animated' | 'full'>('animated');

  // Animate reveal
  useEffect(() => {
    if (mode !== 'animated' || revealIdx >= DIFF_LINES.length) return;
    const delay = DIFF_LINES[revealIdx].type === 'header' ? 500 : 150;
    const timer = setTimeout(() => setRevealIdx(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [revealIdx, mode]);

  useInput((input) => {
    if (input === 'r') {
      setRevealIdx(0);
      setMode('animated');
    } else if (input === 'f') {
      setRevealIdx(DIFF_LINES.length);
      setMode('full');
    }
  });

  const visibleLines = DIFF_LINES.slice(0, mode === 'full' ? DIFF_LINES.length : revealIdx);
  const adds = visibleLines.filter(l => l.type === 'add').length;
  const removes = visibleLines.filter(l => l.type === 'remove').length;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#e8945a">Diff Display</Text>
      <Text color="gray">Terminal-optimized code diff with line-by-line animation</Text>
      <Box marginTop={1} />

      {/* Stats */}
      <Box gap={2}>
        <Text color="#3fb950">+{adds} additions</Text>
        <Text color="#f85149">-{removes} removals</Text>
        <Text color="gray">across 2 files</Text>
      </Box>

      <Box marginTop={1} />

      {/* Diff output */}
      <Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
        {visibleLines.map((line, i) => {
          if (line.type === 'header') {
            return (
              <Text key={i} color="#58a6ff" bold>{line.content}</Text>
            );
          }

          const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';
          const color = line.type === 'add' ? '#3fb950' : line.type === 'remove' ? '#f85149' : 'gray';
          const bgColor = line.type === 'add' ? '#0d2818' : line.type === 'remove' ? '#2d0b0b' : undefined;
          const lineNum = line.lineNum !== undefined ? String(line.lineNum).padStart(3) : '   ';

          return (
            <Box key={i}>
              <Text color="gray" dimColor>{lineNum} </Text>
              <Text color={color} backgroundColor={bgColor}>
                {prefix} {line.content}
              </Text>
            </Box>
          );
        })}
        {mode === 'animated' && revealIdx < DIFF_LINES.length && (
          <Text color="gray" dimColor>  ...</Text>
        )}
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'r' to replay animation, 'f' for full view, 'q' to return to menu</Text>
    </Box>
  );
}
