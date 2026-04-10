// Demo 2: Sub-character progress bars
// Uses 9 Unicode block elements for fractional fill (like Claude Code)
// Shows multiple progress bar styles and animations

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

// Unicode block elements for sub-character precision
// Each represents 1/8th of a character width
const BLOCKS = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];

function renderBar(progress: number, width: number, color: string): React.ReactElement {
  const filled = progress * width;
  const fullBlocks = Math.floor(filled);
  const fractional = filled - fullBlocks;
  const fractIdx = Math.round(fractional * 8);
  const empty = width - fullBlocks - (fractIdx > 0 ? 1 : 0);

  const bar =
    '█'.repeat(fullBlocks) +
    (fractIdx > 0 ? BLOCKS[fractIdx] : '') +
    ' '.repeat(Math.max(0, empty));

  return (
    <Text>
      <Text color="gray">│</Text>
      <Text color={color}>{bar}</Text>
      <Text color="gray">│</Text>
      <Text color="white"> {(progress * 100).toFixed(1)}%</Text>
    </Text>
  );
}

export default function ProgressBar() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);

  // Smooth linear progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress1(prev => prev >= 1 ? 0 : prev + 0.003);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Stepped progress (simulating file downloads)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress2(prev => {
        if (prev >= 1) return 0;
        // Random jumps simulating chunk downloads
        return Math.min(1, prev + Math.random() * 0.05);
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Ease-in-out progress
  useEffect(() => {
    let t = 0;
    const timer = setInterval(() => {
      t += 0.005;
      if (t > 1) t = 0;
      // Ease in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress3(eased);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#0078d4">Sub-Character Progress Bars</Text>
      <Text color="gray">Uses 9 Unicode block elements: {BLOCKS.map((b, i) => i === 0 ? '[ ]' : b).join(' ')}</Text>
      <Text color="gray">Each block represents 1/8th of a character for smooth animation</Text>
      <Box marginTop={1} />

      <Text color="gray">Smooth linear:</Text>
      {renderBar(progress1, 30, '#3fb950')}

      <Box marginTop={1} />
      <Text color="gray">Chunked download:</Text>
      {renderBar(progress2, 30, '#0078d4')}

      <Box marginTop={1} />
      <Text color="gray">Ease in-out:</Text>
      {renderBar(progress3, 30, '#da7756')}

      <Box marginTop={1} />

      {/* Block elements reference */}
      <Text color="gray">Block elements (0/8 to 8/8):</Text>
      <Box>
        {BLOCKS.map((b, i) => (
          <Text key={i} color="#fdb32a">{b === ' ' ? '·' : b}</Text>
        ))}
        <Text color="gray">  ← each is 1/8th wider</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
