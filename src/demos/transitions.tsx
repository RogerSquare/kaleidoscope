// Demo 28: View transitions
// Fade, slide, wipe, and expand/collapse animations between content panels

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'wipe-down' | 'expand' | 'none';

interface Panel {
  title: string;
  color: string;
  lines: string[];
}

const PANELS: Panel[] = [
  { title: 'Dashboard', color: '#58a6ff', lines: [
    '                Overview',
    '',
    '   Services: 6 running    Tasks: 47',
    '   CPU: 24%               Memory: 612MB',
    '   Uptime: 14d 6h 32m',
    '',
    '   Recent Activity:',
    '   - Task feat-001 moved to review',
    '   - Agent opus started on bug-003',
    '   - Deploy v2.4.1 completed',
  ]},
  { title: 'Services', color: '#3fb950', lines: [
    '            Service List',
    '',
    '   API Server      ● running    :3001',
    '   Frontend         ● running    :5173',
    '   Database         ● running    :5432',
    '   Redis Cache      ○ stopped    :6379',
    '   Worker           ✕ error      :----',
    '   Scheduler        ● running    :8080',
    '',
    '   4/6 services healthy',
  ]},
  { title: 'Settings', color: '#bc8cff', lines: [
    '            Configuration',
    '',
    '   Theme:           Dark',
    '   Auto-save:       Enabled',
    '   Notifications:   All',
    '   Debug mode:      Off',
    '   Telemetry:       Disabled',
    '   Log level:       INFO',
    '',
    '   Last updated: 2h ago',
  ]},
];

const TRANSITION_NAMES: { type: TransitionType; label: string; desc: string }[] = [
  { type: 'fade', label: 'Fade', desc: 'Characters dissolve in/out' },
  { type: 'slide-left', label: 'Slide Left', desc: 'Content slides from right' },
  { type: 'slide-right', label: 'Slide Right', desc: 'Content slides from left' },
  { type: 'wipe-down', label: 'Wipe Down', desc: 'Lines reveal top to bottom' },
  { type: 'expand', label: 'Expand', desc: 'Content grows from center' },
  { type: 'none', label: 'None', desc: 'Instant switch' },
];

const CONTENT_WIDTH = 44;
const CONTENT_HEIGHT = 10;
const TRANSITION_FRAMES = 12;

// Characters for fade effect (ordered by visual density)
const FADE_CHARS = [' ', '░', '▒', '▓', '█'];

function applyTransition(
  lines: string[],
  transition: TransitionType,
  progress: number, // 0 to 1
): { text: string; color: string }[][] {
  const rows: { text: string; color: string }[][] = [];
  const paddedLines = [...lines];
  while (paddedLines.length < CONTENT_HEIGHT) paddedLines.push('');

  for (let row = 0; row < CONTENT_HEIGHT; row++) {
    const line = paddedLines[row] || '';
    const padded = line.padEnd(CONTENT_WIDTH).slice(0, CONTENT_WIDTH);
    const chars: { text: string; color: string }[] = [];

    for (let col = 0; col < CONTENT_WIDTH; col++) {
      const originalChar = padded[col];

      switch (transition) {
        case 'fade': {
          // Characters progress through density levels
          const charProgress = Math.min(1, progress * 1.5 - (col + row * 2) * 0.005);
          if (charProgress <= 0) {
            chars.push({ text: ' ', color: '#0d1117' });
          } else if (charProgress < 0.25) {
            chars.push({ text: FADE_CHARS[1], color: '#1a1a24' });
          } else if (charProgress < 0.5) {
            chars.push({ text: FADE_CHARS[2], color: '#2a2a3a' });
          } else if (charProgress < 0.75) {
            chars.push({ text: FADE_CHARS[3], color: '#484f58' });
          } else {
            chars.push({ text: originalChar, color: '#c9d1d9' });
          }
          break;
        }
        case 'slide-left': {
          // Content slides in from the right
          const offset = Math.round((1 - progress) * CONTENT_WIDTH);
          const srcCol = col + offset;
          if (srcCol >= CONTENT_WIDTH) {
            chars.push({ text: ' ', color: '#0d1117' });
          } else {
            chars.push({ text: padded[srcCol] || ' ', color: '#c9d1d9' });
          }
          break;
        }
        case 'slide-right': {
          const offset = Math.round((1 - progress) * CONTENT_WIDTH);
          const srcCol = col - offset;
          if (srcCol < 0) {
            chars.push({ text: ' ', color: '#0d1117' });
          } else {
            chars.push({ text: padded[srcCol] || ' ', color: '#c9d1d9' });
          }
          break;
        }
        case 'wipe-down': {
          // Lines reveal from top to bottom
          const revealRow = Math.floor(progress * (CONTENT_HEIGHT + 2));
          if (row <= revealRow) {
            chars.push({ text: originalChar, color: '#c9d1d9' });
          } else if (row === revealRow + 1) {
            chars.push({ text: '─', color: '#58a6ff' });
          } else {
            chars.push({ text: ' ', color: '#0d1117' });
          }
          break;
        }
        case 'expand': {
          // Content grows from center
          const centerRow = CONTENT_HEIGHT / 2;
          const centerCol = CONTENT_WIDTH / 2;
          const maxDist = Math.sqrt(centerRow * centerRow + centerCol * centerCol);
          const dist = Math.sqrt((row - centerRow) ** 2 + (col - centerCol) ** 2);
          const threshold = progress * maxDist * 1.3;
          if (dist <= threshold) {
            chars.push({ text: originalChar, color: '#c9d1d9' });
          } else if (dist <= threshold + 2) {
            chars.push({ text: '·', color: '#30363d' });
          } else {
            chars.push({ text: ' ', color: '#0d1117' });
          }
          break;
        }
        default:
          chars.push({ text: originalChar, color: '#c9d1d9' });
      }
    }
    rows.push(chars);
  }
  return rows;
}

export default function Transitions() {
  const [activePanel, setActivePanel] = useState(0);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [transitionFrame, setTransitionFrame] = useState(TRANSITION_FRAMES);
  const [speed, setSpeed] = useState(40);
  const isAnimating = transitionFrame < TRANSITION_FRAMES;

  // Animation tick
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setTransitionFrame(prev => prev + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [transitionFrame, isAnimating, speed]);

  const switchPanel = useCallback((idx: number) => {
    if (idx === activePanel || isAnimating) return;
    setActivePanel(idx);
    setTransitionFrame(transitionType === 'none' ? TRANSITION_FRAMES : 0);
  }, [activePanel, isAnimating, transitionType]);

  useInput((input, key) => {
    if (isAnimating) return;

    if (key.leftArrow || input === 'h') {
      switchPanel((activePanel - 1 + PANELS.length) % PANELS.length);
    } else if (key.rightArrow || input === 'l') {
      switchPanel((activePanel + 1) % PANELS.length);
    } else if (input === '1') switchPanel(0);
    else if (input === '2') switchPanel(1);
    else if (input === '3') switchPanel(2);
    else if (key.tab) {
      const idx = TRANSITION_NAMES.findIndex(t => t.type === transitionType);
      setTransitionType(TRANSITION_NAMES[(idx + 1) % TRANSITION_NAMES.length].type);
    } else if (input === '+') setSpeed(prev => Math.max(15, prev - 10));
    else if (input === '-') setSpeed(prev => Math.min(100, prev + 10));
  });

  const progress = Math.min(1, transitionFrame / TRANSITION_FRAMES);
  const panel = PANELS[activePanel];
  const rendered = applyTransition(panel.lines, transitionType, progress);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#da7756">View Transitions</Text>
      <Text color="gray">←→ switch panels, Tab cycle transition type, +/- speed</Text>
      <Box marginTop={1} />

      {/* Transition selector */}
      <Box gap={1} marginBottom={1}>
        <Text color="gray">Effect:</Text>
        {TRANSITION_NAMES.map(t => (
          <Text key={t.type} color={transitionType === t.type ? '#fdb32a' : '#30363d'} bold={transitionType === t.type}>
            {transitionType === t.type ? `[${t.label}]` : t.label}
          </Text>
        ))}
      </Box>

      {/* Panel tabs */}
      <Box>
        {PANELS.map((p, i) => (
          <Box key={p.title} flexDirection="column">
            <Box paddingX={1}>
              <Text color={i === activePanel ? p.color : '#484f58'} bold={i === activePanel}>
                {i + 1}. {p.title}
              </Text>
            </Box>
            <Text color={i === activePanel ? p.color : '#21262d'}>
              {(i === activePanel ? '━' : '─').repeat(p.title.length + 5)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Content area with transition */}
      <Box flexDirection="column" borderStyle="round" borderColor={panel.color} paddingX={0} width={CONTENT_WIDTH + 2}>
        {rendered.map((row, rowIdx) => (
          <Box key={`r-${rowIdx}`}>
            {row.map((cell, colIdx) => (
              <Text key={`c-${rowIdx}-${colIdx}`} color={cell.color}>{cell.text}</Text>
            ))}
          </Box>
        ))}
      </Box>

      <Box marginTop={1} gap={2}>
        <Text color={isAnimating ? '#d29922' : '#3fb950'}>
          {isAnimating ? `Animating... ${Math.round(progress * 100)}%` : 'Ready'}
        </Text>
        <Text color="gray">Speed: {speed}ms/frame</Text>
        <Text color="gray" dimColor>{TRANSITION_NAMES.find(t => t.type === transitionType)?.desc}</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
