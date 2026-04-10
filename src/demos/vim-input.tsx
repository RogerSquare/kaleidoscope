// Demo 24: Vim mode input
// Normal/Insert/Visual modes with cursor shapes
// h/j/k/l movement, w/b word jump, 0/$ line edges, dd delete, yy yank

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL';

const INITIAL_LINES = [
  'const express = require("express");',
  'const cors = require("cors");',
  'const path = require("path");',
  '',
  'const app = express();',
  'const PORT = 3005;',
  '',
  'app.use(cors());',
  'app.use(express.json());',
  'app.use(express.static("public"));',
  '',
  '// API routes',
  'app.get("/api/user", async (req, res) => {',
  '  const user = await getUser();',
  '  res.json(user);',
  '});',
  '',
  'app.listen(PORT, () => {',
  '  console.log(`Server on :${PORT}`);',
  '});',
];

const MODE_COLORS: Record<VimMode, { bg: string; fg: string }> = {
  NORMAL: { bg: '#58a6ff', fg: '#0d1117' },
  INSERT: { bg: '#3fb950', fg: '#0d1117' },
  VISUAL: { bg: '#bc8cff', fg: '#0d1117' },
};

export default function VimInput() {
  const [lines, setLines] = useState<string[]>([...INITIAL_LINES]);
  const [cursor, setCursor] = useState({ line: 0, col: 0 });
  const [mode, setMode] = useState<VimMode>('NORMAL');
  const [visualStart, setVisualStart] = useState<{ line: number; col: number } | null>(null);
  const [yankBuffer, setYankBuffer] = useState('');
  const [message, setMessage] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [lastKey, setLastKey] = useState('');
  const [pendingD, setPendingD] = useState(false);
  const [pendingY, setPendingY] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);

  const VISIBLE = 14;

  // Cursor blink in insert mode
  useEffect(() => {
    if (mode !== 'INSERT') return;
    const timer = setInterval(() => setCursorBlink(prev => !prev), 530);
    return () => clearInterval(timer);
  }, [mode]);

  // Clear message after 2s
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  // Keep cursor in scroll view
  useEffect(() => {
    if (cursor.line < scrollTop) setScrollTop(cursor.line);
    if (cursor.line >= scrollTop + VISIBLE) setScrollTop(cursor.line - VISIBLE + 1);
  }, [cursor.line]);

  function clampCol(line: number, col: number): number {
    const maxCol = mode === 'INSERT' ? lines[line].length : Math.max(0, lines[line].length - 1);
    return Math.min(col, maxCol);
  }

  function findNextWord(line: string, col: number): number {
    let i = col;
    while (i < line.length && /\w/.test(line[i])) i++;
    while (i < line.length && !/\w/.test(line[i])) i++;
    return i >= line.length ? line.length - 1 : i;
  }

  function findPrevWord(line: string, col: number): number {
    let i = col - 1;
    while (i > 0 && !/\w/.test(line[i])) i--;
    while (i > 0 && /\w/.test(line[i - 1])) i--;
    return Math.max(0, i);
  }

  useInput((input, key) => {
    setLastKey(input || (key.return ? 'Enter' : key.escape ? 'Esc' : key.backspace ? 'BS' : ''));

    // INSERT mode
    if (mode === 'INSERT') {
      if (key.escape) {
        setMode('NORMAL');
        setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
        return;
      }
      if (key.return) {
        const line = lines[cursor.line];
        const before = line.slice(0, cursor.col);
        const after = line.slice(cursor.col);
        setLines(prev => [...prev.slice(0, cursor.line), before, after, ...prev.slice(cursor.line + 1)]);
        setCursor({ line: cursor.line + 1, col: 0 });
        return;
      }
      if (key.backspace) {
        if (cursor.col > 0) {
          const line = lines[cursor.line];
          setLines(prev => [...prev.slice(0, cursor.line), line.slice(0, cursor.col - 1) + line.slice(cursor.col), ...prev.slice(cursor.line + 1)]);
          setCursor(prev => ({ ...prev, col: prev.col - 1 }));
        } else if (cursor.line > 0) {
          const prevLine = lines[cursor.line - 1];
          const curLine = lines[cursor.line];
          const newCol = prevLine.length;
          setLines(prev => [...prev.slice(0, cursor.line - 1), prevLine + curLine, ...prev.slice(cursor.line + 1)]);
          setCursor({ line: cursor.line - 1, col: newCol });
        }
        return;
      }
      if (input && !key.ctrl && !key.meta && input !== 'q') {
        const line = lines[cursor.line];
        setLines(prev => [...prev.slice(0, cursor.line), line.slice(0, cursor.col) + input + line.slice(cursor.col), ...prev.slice(cursor.line + 1)]);
        setCursor(prev => ({ ...prev, col: prev.col + input.length }));
        return;
      }
      return;
    }

    // VISUAL mode
    if (mode === 'VISUAL') {
      if (key.escape) { setMode('NORMAL'); setVisualStart(null); return; }
      if (input === 'y' && visualStart) {
        const startLine = Math.min(visualStart.line, cursor.line);
        const endLine = Math.max(visualStart.line, cursor.line);
        const yanked = lines.slice(startLine, endLine + 1).join('\n');
        setYankBuffer(yanked);
        setMessage(`Yanked ${endLine - startLine + 1} line(s)`);
        setMode('NORMAL');
        setVisualStart(null);
        return;
      }
      if (input === 'd' && visualStart) {
        const startLine = Math.min(visualStart.line, cursor.line);
        const endLine = Math.max(visualStart.line, cursor.line);
        setYankBuffer(lines.slice(startLine, endLine + 1).join('\n'));
        setLines(prev => prev.length > endLine - startLine + 1 ? [...prev.slice(0, startLine), ...prev.slice(endLine + 1)] : ['']);
        setCursor({ line: Math.min(startLine, lines.length - (endLine - startLine + 1) - 1), col: 0 });
        setMessage(`Deleted ${endLine - startLine + 1} line(s)`);
        setMode('NORMAL');
        setVisualStart(null);
        return;
      }
    }

    // Movement (shared between NORMAL and VISUAL)
    if (input === 'h' || key.leftArrow) {
      setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    } else if (input === 'l' || key.rightArrow) {
      setCursor(prev => ({ ...prev, col: clampCol(prev.line, prev.col + 1) }));
    } else if (input === 'k' || key.upArrow) {
      setCursor(prev => {
        const newLine = Math.max(0, prev.line - 1);
        return { line: newLine, col: clampCol(newLine, prev.col) };
      });
    } else if (input === 'j' || key.downArrow) {
      setCursor(prev => {
        const newLine = Math.min(lines.length - 1, prev.line + 1);
        return { line: newLine, col: clampCol(newLine, prev.col) };
      });
    } else if (input === 'w') {
      setCursor(prev => ({ ...prev, col: findNextWord(lines[prev.line], prev.col) }));
    } else if (input === 'b') {
      setCursor(prev => ({ ...prev, col: findPrevWord(lines[prev.line], prev.col) }));
    } else if (input === '0') {
      setCursor(prev => ({ ...prev, col: 0 }));
    } else if (input === '$') {
      setCursor(prev => ({ ...prev, col: Math.max(0, lines[prev.line].length - 1) }));
    } else if (input === 'g') {
      setCursor({ line: 0, col: 0 });
    } else if (input === 'G') {
      setCursor({ line: lines.length - 1, col: 0 });
    }

    // NORMAL-only commands
    if (mode === 'NORMAL') {
      if (input === 'i') { setMode('INSERT'); }
      else if (input === 'a') { setMode('INSERT'); setCursor(prev => ({ ...prev, col: Math.min(lines[prev.line].length, prev.col + 1) })); }
      else if (input === 'o') {
        setLines(prev => [...prev.slice(0, cursor.line + 1), '', ...prev.slice(cursor.line + 1)]);
        setCursor({ line: cursor.line + 1, col: 0 });
        setMode('INSERT');
      }
      else if (input === 'v') { setMode('VISUAL'); setVisualStart({ ...cursor }); }
      else if (input === 'p' && yankBuffer) {
        const yankLines = yankBuffer.split('\n');
        setLines(prev => [...prev.slice(0, cursor.line + 1), ...yankLines, ...prev.slice(cursor.line + 1)]);
        setCursor({ line: cursor.line + 1, col: 0 });
        setMessage(`Pasted ${yankLines.length} line(s)`);
      }
      else if (input === 'd') {
        if (pendingD) {
          setYankBuffer(lines[cursor.line]);
          setLines(prev => prev.length > 1 ? [...prev.slice(0, cursor.line), ...prev.slice(cursor.line + 1)] : ['']);
          setCursor(prev => ({ line: Math.min(prev.line, lines.length - 2), col: 0 }));
          setMessage('Deleted line');
          setPendingD(false);
        } else { setPendingD(true); setTimeout(() => setPendingD(false), 1000); }
      }
      else if (input === 'y') {
        if (pendingY) {
          setYankBuffer(lines[cursor.line]);
          setMessage('Yanked line');
          setPendingY(false);
        } else { setPendingY(true); setTimeout(() => setPendingY(false), 1000); }
      }
      else if (input === 'u') {
        setLines([...INITIAL_LINES]);
        setCursor({ line: 0, col: 0 });
        setMessage('Undo (reset to original)');
      }
    }
  });

  const visibleLines = lines.slice(scrollTop, scrollTop + VISIBLE);
  const isVisualRange = (line: number) => {
    if (mode !== 'VISUAL' || !visualStart) return false;
    const start = Math.min(visualStart.line, cursor.line);
    const end = Math.max(visualStart.line, cursor.line);
    return line >= start && line <= end;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Vim Mode Input</Text>
      <Text color="gray">Full vim subset: hjkl, w/b, 0/$, i/a/o, v, dd, yy, p, u</Text>
      <Box marginTop={1} />

      {/* Editor */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={0}>
        {visibleLines.map((line, i) => {
          const lineNum = scrollTop + i;
          const isCursorLine = lineNum === cursor.line;
          const isVisual = isVisualRange(lineNum);

          return (
            <Box key={`vl-${lineNum}`}>
              {/* Line number */}
              <Text color={isCursorLine ? '#fdb32a' : '#30363d'}>
                {' '}{String(lineNum + 1).padStart(3)}{' '}
              </Text>

              {/* Line content with cursor */}
              <Text backgroundColor={isVisual ? '#2d1f50' : undefined}>
                {line.split('').map((char, ci) => {
                  const isCursor = isCursorLine && ci === cursor.col;
                  if (isCursor) {
                    if (mode === 'INSERT') {
                      return <Text key={`c-${ci}`} color="white">{cursorBlink ? <Text backgroundColor="#3fb950" color="#0d1117">{char || ' '}</Text> : char || ' '}</Text>;
                    }
                    return <Text key={`c-${ci}`} backgroundColor={MODE_COLORS[mode].bg} color={MODE_COLORS[mode].fg}>{char || ' '}</Text>;
                  }
                  return <Text key={`c-${ci}`} color={isVisual ? '#bc8cff' : isCursorLine ? 'white' : 'gray'}>{char}</Text>;
                })}
                {isCursorLine && cursor.col >= line.length && (
                  mode === 'INSERT'
                    ? <Text backgroundColor={cursorBlink ? '#3fb950' : undefined} color={cursorBlink ? '#0d1117' : 'white'}> </Text>
                    : <Text backgroundColor={MODE_COLORS[mode].bg} color={MODE_COLORS[mode].fg}> </Text>
                )}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Status line */}
      <Box>
        <Text backgroundColor={MODE_COLORS[mode].bg} color={MODE_COLORS[mode].fg} bold> {mode} </Text>
        <Text backgroundColor="#21262d" color="#8b949e"> {lines.length}L </Text>
        {pendingD && <Text backgroundColor="#6e3a00" color="#fdb32a"> d </Text>}
        {pendingY && <Text backgroundColor="#1c3a1c" color="#3fb950"> y </Text>}
        {message && <Text color="#d29922"> {message}</Text>}
        <Box flexGrow={1} />
        {yankBuffer && <Text color="#30363d"> yank: {yankBuffer.length > 20 ? yankBuffer.slice(0, 20) + '...' : yankBuffer} </Text>}
        <Text backgroundColor="#21262d" color="#c9d1d9"> {cursor.line + 1}:{cursor.col + 1} </Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu (in NORMAL mode when not typing q)</Text>
    </Box>
  );
}
