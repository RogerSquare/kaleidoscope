// Demo 5: Thinking indicator with shimmer effect
// Uses the ∴ (therefore) symbol with color cycling
// Plus a dots animation and pulse effect

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

// Color gradient for shimmer effect
const SHIMMER_COLORS = [
  '#4a3728', '#5c4030', '#6e4938', '#805240', '#925b48',
  '#a46450', '#b66d58', '#c87660', '#da7756', '#e88a64',
  '#da7756', '#c87660', '#b66d58', '#a46450', '#925b48',
  '#805240', '#6e4938', '#5c4030',
];

// Dots animation frames
const DOTS_FRAMES = ['   ', '.  ', '.. ', '...', ' ..', '  .'];

// Braille spinner (smooth rotation)
const BRAILLE_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Pulse characters
const PULSE_FRAMES = ['○', '◎', '●', '◉', '●', '◎'];

export default function ThinkingIndicator() {
  const [shimmerIdx, setShimmerIdx] = useState(0);
  const [dotsIdx, setDotsIdx] = useState(0);
  const [brailleIdx, setBrailleIdx] = useState(0);
  const [pulseIdx, setPulseIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Shimmer color cycle (fast)
  useEffect(() => {
    const timer = setInterval(() => {
      setShimmerIdx(prev => (prev + 1) % SHIMMER_COLORS.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Dots animation
  useEffect(() => {
    const timer = setInterval(() => {
      setDotsIdx(prev => (prev + 1) % DOTS_FRAMES.length);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Braille spinner (smooth)
  useEffect(() => {
    const timer = setInterval(() => {
      setBrailleIdx(prev => (prev + 1) % BRAILLE_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIdx(prev => (prev + 1) % PULSE_FRAMES.length);
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#bc8cff">Thinking Indicators</Text>
      <Text color="gray">Various patterns for showing AI is processing</Text>
      <Box marginTop={1} />

      {/* Therefore symbol with shimmer */}
      <Box gap={1}>
        <Text color={SHIMMER_COLORS[shimmerIdx]} bold>∴</Text>
        <Text color={SHIMMER_COLORS[shimmerIdx]}>Thinking</Text>
        <Text color="gray">— therefore symbol with color shimmer</Text>
      </Box>

      <Box marginTop={1} />

      {/* Claude-style spinner + verb */}
      <Box gap={1}>
        <Text color={SHIMMER_COLORS[(shimmerIdx + 5) % SHIMMER_COLORS.length]}>
          {BRAILLE_FRAMES[brailleIdx]}
        </Text>
        <Text color="white">Processing request{DOTS_FRAMES[dotsIdx]}</Text>
        <Text color="gray">— braille spinner + dots</Text>
      </Box>

      <Box marginTop={1} />

      {/* Pulse indicator */}
      <Box gap={1}>
        <Text color="#3fb950">{PULSE_FRAMES[pulseIdx]}</Text>
        <Text color="white">Connected</Text>
        <Text color="gray">— pulse animation for status</Text>
      </Box>

      <Box marginTop={1} />

      {/* Multi-character wave */}
      <Box gap={0}>
        <Text color="gray">Wave: </Text>
        {'thinking'.split('').map((char, i) => {
          const colorIdx = (shimmerIdx + i * 2) % SHIMMER_COLORS.length;
          return <Text key={i} color={SHIMMER_COLORS[colorIdx]}>{char}</Text>;
        })}
        <Text color="gray"> — per-character color wave</Text>
      </Box>

      <Box marginTop={1} />

      {/* Bar shimmer */}
      <Box gap={0}>
        <Text color="gray">Shimmer: </Text>
        {'████████████████████'.split('').map((char, i) => {
          const colorIdx = (shimmerIdx + i) % SHIMMER_COLORS.length;
          return <Text key={i} color={SHIMMER_COLORS[colorIdx]}>{char}</Text>;
        })}
      </Box>

      <Box marginTop={1} />

      {/* Timer */}
      <Text color="gray" dimColor>Running for {seconds}s</Text>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
