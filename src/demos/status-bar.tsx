// Demo 23: Status bar
// Persistent footer with mode indicator, connection status, clock,
// context-dependent key hints, notification badge

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';

type Mode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND';
type ConnectionState = 'connected' | 'connecting' | 'disconnected';

const MODE_STYLES: Record<Mode, { bg: string; fg: string }> = {
  NORMAL:  { bg: '#58a6ff', fg: '#0d1117' },
  INSERT:  { bg: '#3fb950', fg: '#0d1117' },
  VISUAL:  { bg: '#bc8cff', fg: '#0d1117' },
  COMMAND: { bg: '#d29922', fg: '#0d1117' },
};

const MODE_HINTS: Record<Mode, string[]> = {
  NORMAL:  ['i insert', 'v visual', ': command', '/ search', 'dd delete line'],
  INSERT:  ['Esc normal', 'Tab indent', 'Enter newline'],
  VISUAL:  ['Esc normal', 'y yank', 'd delete', 'hjkl select'],
  COMMAND: ['Esc cancel', 'Enter execute', 'Tab complete'],
};

const PULSE_FRAMES = ['●', '◉', '○', '◉'];

export default function StatusBar() {
  const [mode, setMode] = useState<Mode>('NORMAL');
  const [connection, setConnection] = useState<ConnectionState>('connected');
  const [clock, setClock] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [branch, setBranch] = useState('main');
  const [fileChanged, setFileChanged] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 24, col: 18 });
  const [pulseIdx, setPulseIdx] = useState(0);
  const [encoding] = useState('UTF-8');
  const [lineEnding] = useState('LF');
  const [commandInput, setCommandInput] = useState('');
  const { stdout } = useStdout();
  const width = stdout?.columns || 80;

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Connection pulse
  useEffect(() => {
    const timer = setInterval(() => setPulseIdx(prev => (prev + 1) % PULSE_FRAMES.length), 400);
    return () => clearInterval(timer);
  }, []);

  // Simulate connection changes
  useEffect(() => {
    const timer = setInterval(() => {
      setConnection(prev => {
        if (prev === 'connected' && Math.random() < 0.1) return 'connecting';
        if (prev === 'connecting') return Math.random() < 0.5 ? 'connected' : 'disconnected';
        if (prev === 'disconnected' && Math.random() < 0.3) return 'connecting';
        return prev;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if (mode === 'COMMAND') {
      if (key.escape) { setMode('NORMAL'); setCommandInput(''); }
      else if (key.return) { setMode('NORMAL'); setCommandInput(''); }
      else if (key.backspace) setCommandInput(prev => prev.slice(0, -1));
      else if (input && !key.ctrl && !key.meta && input !== 'q') setCommandInput(prev => prev + input);
      return;
    }

    if (mode === 'NORMAL') {
      if (input === 'i') setMode('INSERT');
      else if (input === 'v') setMode('VISUAL');
      else if (input === ':') { setMode('COMMAND'); setCommandInput(''); }
      else if (input === 'n') setNotifications(prev => prev + 1);
      else if (input === 'c') setNotifications(0);
      else if (input === 'b') setBranch(prev => prev === 'main' ? 'feature/auth' : prev === 'feature/auth' ? 'fix/bug-123' : 'main');
      else if (input === 'm') setFileChanged(prev => !prev);
      else if (key.upArrow) setCursorPos(prev => ({ ...prev, line: Math.max(1, prev.line - 1) }));
      else if (key.downArrow) setCursorPos(prev => ({ ...prev, line: prev.line + 1 }));
      else if (key.leftArrow) setCursorPos(prev => ({ ...prev, col: Math.max(1, prev.col - 1) }));
      else if (key.rightArrow) setCursorPos(prev => ({ ...prev, col: prev.col + 1 }));
    } else if (mode === 'INSERT' || mode === 'VISUAL') {
      if (key.escape) setMode('NORMAL');
    }
  });

  const modeStyle = MODE_STYLES[mode];
  const hints = MODE_HINTS[mode];
  const connColor = connection === 'connected' ? '#3fb950' : connection === 'connecting' ? '#d29922' : '#f85149';
  const connIcon = connection === 'connected' ? PULSE_FRAMES[pulseIdx] : connection === 'connecting' ? '◌' : '✕';
  const connText = connection === 'connected' ? 'Connected' : connection === 'connecting' ? 'Reconnecting...' : 'Disconnected';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#d29922">Status Bar</Text>
      <Text color="gray">Mode switching (i/v/:/Esc), live clock, connection, notifications</Text>
      <Box marginTop={1} />

      {/* Controls help */}
      <Box gap={2} marginBottom={1}>
        <Text color="gray">n=+notification</Text>
        <Text color="gray">c=clear</Text>
        <Text color="gray">b=branch</Text>
        <Text color="gray">m=modified</Text>
        <Text color="gray">arrows=cursor</Text>
      </Box>

      {/* Simulated editor area */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d" height={10} paddingX={1}>
        {Array.from({ length: 8 }, (_, i) => {
          const lineNum = cursorPos.line - 3 + i;
          if (lineNum < 1) return <Text key={`ln-${i}`} color="#30363d">{'~'.padStart(4)}</Text>;
          const isCurrent = lineNum === cursorPos.line;
          return (
            <Box key={`ln-${i}`}>
              <Text color={isCurrent ? '#fdb32a' : '#30363d'}>{String(lineNum).padStart(3)} </Text>
              <Text color={isCurrent ? 'white' : 'gray'}>
                {isCurrent ? 'const server = express();' : lineNum % 3 === 0 ? '// TODO: implement' : 'app.use(middleware());'}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Command line (when in COMMAND mode) */}
      {mode === 'COMMAND' && (
        <Box paddingX={1}>
          <Text color="#d29922" bold>:</Text>
          <Text color="white">{commandInput}</Text>
          <Text color="white" backgroundColor="white"> </Text>
        </Box>
      )}

      {/* === STATUS BAR === */}
      <Box>
        {/* Mode indicator */}
        <Text backgroundColor={modeStyle.bg} color={modeStyle.fg} bold> {mode} </Text>

        {/* Git branch */}
        <Text backgroundColor="#21262d" color="#8b949e"> {'\u2387'} {branch} </Text>

        {/* File status */}
        <Text backgroundColor="#161b22" color={fileChanged ? '#d29922' : '#3fb950'}>
          {' '}{fileChanged ? '●' : '✓'} server.js{fileChanged ? ' [+]' : ''}{' '}
        </Text>

        {/* Spacer */}
        <Box flexGrow={1}>
          <Text backgroundColor="#0d1117"> </Text>
        </Box>

        {/* Connection */}
        <Text backgroundColor="#161b22" color={connColor}> {connIcon} {connText} </Text>

        {/* Notifications */}
        {notifications > 0 && (
          <Text backgroundColor="#6e3a00" color="#fdb32a" bold> {'\u2709'} {notifications} </Text>
        )}

        {/* Encoding / line ending */}
        <Text backgroundColor="#21262d" color="#8b949e"> {encoding} {lineEnding} </Text>

        {/* Cursor position */}
        <Text backgroundColor="#21262d" color="#c9d1d9"> Ln {cursorPos.line} Col {cursorPos.col} </Text>

        {/* Clock */}
        <Text backgroundColor="#161b22" color="#8b949e"> {clock} </Text>
      </Box>

      {/* Key hints bar */}
      <Box paddingX={1} gap={2}>
        {hints.map((hint, i) => {
          const [key, ...desc] = hint.split(' ');
          return (
            <Text key={`hint-${i}`} color="#8b949e">
              <Text color="#58a6ff">{key}</Text> {desc.join(' ')}
            </Text>
          );
        })}
        <Box flexGrow={1} />
        <Text color="gray" dimColor>q=menu</Text>
      </Box>
    </Box>
  );
}
