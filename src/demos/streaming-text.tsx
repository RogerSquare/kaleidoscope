// Demo 3: Streaming text animation
// Character-by-character reveal simulating LLM token streaming
// With cursor blink and variable speed

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from 'ink';

const SAMPLE_TEXTS = [
  "The terminal is a powerful canvas for creating rich, interactive user interfaces. With Unicode characters and ANSI escape codes, we can build animations that feel smooth and responsive.",
  "React + Ink brings component-based architecture to the CLI. Each animation runs as an isolated component with its own state, preventing unnecessary re-renders across the UI tree.",
  "Sub-character precision using Unicode block elements allows progress bars smoother than any traditional ASCII art. Combined with frame diffing, only changed characters are rewritten.",
];

export default function StreamingText() {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [speed, setSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const text = SAMPLE_TEXTS[textIdx];
  const done = charIdx >= text.length;

  const speeds = { slow: 60, medium: 25, fast: 8 };

  // Character streaming
  useEffect(() => {
    if (done) return;
    const delay = speeds[speed] + Math.random() * speeds[speed]; // Variable timing
    const timer = setTimeout(() => {
      setCharIdx(prev => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, done, speed]);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible(prev => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance to next text after done
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => {
      setTextIdx(prev => (prev + 1) % SAMPLE_TEXTS.length);
      setCharIdx(0);
    }, 3000);
    return () => clearTimeout(timer);
  }, [done]);

  const revealed = text.slice(0, charIdx);
  const cursor = cursorVisible ? '█' : ' ';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#3fb950">Streaming Text Animation</Text>
      <Text color="gray">Character-by-character reveal simulating LLM token streaming</Text>
      <Text color="gray">Variable timing per character creates a natural typing feel</Text>
      <Box marginTop={1} />

      {/* Speed selector */}
      <Box gap={2}>
        <Text color="gray">Speed:</Text>
        {(['slow', 'medium', 'fast'] as const).map(s => (
          <Text key={s} color={speed === s ? '#fdb32a' : 'gray'} bold={speed === s}>
            [{speed === s ? 'x' : ' '}] {s} ({speeds[s]}ms)
          </Text>
        ))}
      </Box>

      <Box marginTop={1} />

      {/* Streaming output */}
      <Box borderStyle="round" borderColor="gray" paddingX={1} width={60}>
        <Text color="white" wrap="wrap">
          {revealed}
          {!done && <Text color="#da7756">{cursor}</Text>}
          {done && <Text color="#3fb950"> ✓</Text>}
        </Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray">
        Characters: {charIdx}/{text.length}
        {done ? ' — Complete! Next in 3s...' : ''}
      </Text>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 1/2/3 for speed, 'q' to return to menu</Text>
    </Box>
  );
}
