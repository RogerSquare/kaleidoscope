// Demo 1: Claude Code's spinner animation
// Rotates through Unicode characters with deliberate timing variation
// First and last frames hold longer for a breathing effect

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const SPINNER_FRAMES = ['·', '✻', '✽', '✶', '✳', '✢'];
const FRAME_DURATIONS = [120, 80, 80, 80, 80, 120]; // ms - first/last hold longer

const VERBS = [
  'Thinking', 'Processing', 'Analyzing', 'Computing', 'Reasoning',
  'Evaluating', 'Synthesizing', 'Pondering', 'Contemplating', 'Resolving',
  'Flibbertigibbeting', 'Shenaniganing', 'Discombobulating', 'Perambulating',
];

const COLORS = ['#da7756', '#e8945a', '#f5b05e', '#e8945a', '#da7756', '#c85a4a'];

export default function ClaudeSpinner() {
  const [frameIdx, setFrameIdx] = useState(0);
  const [verbIdx, setVerbIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Spinner frame rotation with variable timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFrameIdx(prev => (prev + 1) % SPINNER_FRAMES.length);
    }, FRAME_DURATIONS[frameIdx]);
    return () => clearTimeout(timer);
  }, [frameIdx]);

  // Cycle verbs every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setVerbIdx(prev => (prev + 1) % VERBS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const char = SPINNER_FRAMES[frameIdx];
  const color = COLORS[frameIdx];
  const verb = VERBS[verbIdx];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#da7756">Claude Code Spinner Animation</Text>
      <Text color="gray">Replicates the exact spinner from Claude Code CLI</Text>
      <Text color="gray">Characters: {SPINNER_FRAMES.join(' ')} (first/last hold longer)</Text>
      <Box marginTop={1} />

      {/* Main spinner */}
      <Box gap={1}>
        <Text color={color}>{char}</Text>
        <Text color="white">{verb}...</Text>
        <Text color="gray">({elapsed}s)</Text>
      </Box>

      <Box marginTop={1} />

      {/* All frames shown side by side */}
      <Text color="gray">Frame sequence:</Text>
      <Box gap={1}>
        {SPINNER_FRAMES.map((f, i) => (
          <Text key={i} color={i === frameIdx ? '#da7756' : 'gray'} bold={i === frameIdx}>
            {f}
          </Text>
        ))}
      </Box>

      <Box marginTop={1} />

      {/* Timing diagram */}
      <Text color="gray">Timing (ms): {FRAME_DURATIONS.map((d, i) =>
        i === frameIdx ? `[${d}]` : `${d}`
      ).join(' ')}</Text>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
