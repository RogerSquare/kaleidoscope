// Demo 17: Gradient text and color effects
// Per-character color interpolation, HSL manipulation
// Multiple gradient presets, animated shifts

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

// HSL to hex conversion
function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Interpolate between two hex colors
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

// Multi-stop gradient
function gradientColor(stops: string[], t: number): string {
  if (stops.length === 1) return stops[0];
  const segment = t * (stops.length - 1);
  const idx = Math.min(Math.floor(segment), stops.length - 2);
  const local = segment - idx;
  return lerpColor(stops[idx], stops[idx + 1], local);
}

interface Preset {
  name: string;
  stops: string[];
}

const PRESETS: Preset[] = [
  { name: 'Rainbow', stops: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff0088'] },
  { name: 'Sunset', stops: ['#ff6b35', '#f7c59f', '#efefd0', '#004e89', '#1a659e'] },
  { name: 'Ocean', stops: ['#0b132b', '#1c2541', '#3a506b', '#5bc0be', '#6fffe9'] },
  { name: 'Fire', stops: ['#370617', '#6a040f', '#9d0208', '#dc2f02', '#e85d04', '#faa307', '#ffba08'] },
  { name: 'Aurora', stops: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#a3c4bc', '#bde0fe', '#a2d2ff'] },
  { name: 'Neon', stops: ['#ff00ff', '#8800ff', '#0000ff', '#0088ff', '#00ffff', '#00ff88', '#00ff00'] },
];

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';
const BLOCK_BAR = '████████████████████████████████████████';
const BANNER = 'TERMINAL UI SHOWCASE';

function GradientLine({ text, stops, offset, animated }: { text: string; stops: string[]; offset: number; animated: boolean }) {
  return (
    <Box>
      {text.split('').map((char, i) => {
        const t = animated
          ? ((i + offset) % (text.length * 2)) / (text.length * 2)
          : i / Math.max(1, text.length - 1);
        const color = gradientColor(stops, t);
        return <Text key={`g-${i}`} color={color}>{char}</Text>;
      })}
    </Box>
  );
}

export default function GradientText() {
  const [activePreset, setActivePreset] = useState(0);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<'text' | 'hsl'>('text');

  // Animation tick
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setOffset(prev => prev + 1), 50);
    return () => clearInterval(timer);
  }, [paused]);

  useInput((input, key) => {
    if (key.leftArrow || input === 'h') {
      setActivePreset(prev => (prev - 1 + PRESETS.length) % PRESETS.length);
    } else if (key.rightArrow || input === 'l') {
      setActivePreset(prev => (prev + 1) % PRESETS.length);
    } else if (input === 'p') {
      setPaused(prev => !prev);
    } else if (input === 'm') {
      setMode(prev => prev === 'text' ? 'hsl' : 'text');
    }
  });

  const preset = PRESETS[activePreset];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#ff00ff">Gradient Text & Color Effects</Text>
      <Text color="gray">←→/hl cycle presets, p=pause, m=toggle mode</Text>
      <Box marginTop={1} />

      {/* Preset selector */}
      <Box gap={1}>
        <Text color="gray">Preset:</Text>
        {PRESETS.map((p, i) => (
          <Text key={p.name} color={i === activePreset ? gradientColor(p.stops, 0.5) : '#30363d'} bold={i === activePreset}>
            {i === activePreset ? `[${p.name}]` : p.name}
          </Text>
        ))}
      </Box>

      <Box marginTop={1} />

      {mode === 'text' ? (
        <Box flexDirection="column">
          {/* Animated gradient text */}
          <Text color="gray" dimColor>Animated text:</Text>
          <GradientLine text={SAMPLE_TEXT} stops={preset.stops} offset={offset} animated={true} />

          <Box marginTop={1} />

          {/* Static gradient text */}
          <Text color="gray" dimColor>Static gradient:</Text>
          <GradientLine text={SAMPLE_TEXT} stops={preset.stops} offset={0} animated={false} />

          <Box marginTop={1} />

          {/* Bold banner */}
          <Text color="gray" dimColor>Banner:</Text>
          <Box>
            {BANNER.split('').map((char, i) => {
              const t = ((i + offset * 0.5) % (BANNER.length * 2)) / (BANNER.length * 2);
              return <Text key={`b-${i}`} color={gradientColor(preset.stops, t)} bold>{char}</Text>;
            })}
          </Box>

          <Box marginTop={1} />

          {/* Gradient bar */}
          <Text color="gray" dimColor>Color bar:</Text>
          <GradientLine text={BLOCK_BAR} stops={preset.stops} offset={offset} animated={true} />

          <Box marginTop={1} />

          {/* Gradient border box */}
          <Text color="gray" dimColor>Bordered box:</Text>
          <Box flexDirection="column">
            <Box>
              {'╭──────────────────────────────────────╮'.split('').map((c, i) => (
                <Text key={`bt-${i}`} color={gradientColor(preset.stops, ((i + offset) % 80) / 80)}>{c}</Text>
              ))}
            </Box>
            <Box>
              <Text color={gradientColor(preset.stops, ((offset) % 80) / 80)}>│</Text>
              <Text color="white">  Per-character color interpolation  </Text>
              <Text color={gradientColor(preset.stops, ((38 + offset) % 80) / 80)}>│</Text>
            </Box>
            <Box>
              {'╰──────────────────────────────────────╯'.split('').map((c, i) => (
                <Text key={`bb-${i}`} color={gradientColor(preset.stops, ((i + offset + 20) % 80) / 80)}>{c}</Text>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column">
          {/* HSL color space visualization */}
          <Text color="gray" dimColor>HSL hue sweep (S:100%, L:50%):</Text>
          <Box>
            {Array.from({ length: 48 }, (_, i) => {
              const hue = (i * 7.5 + offset * 3) % 360;
              return <Text key={`h-${i}`} color={hslToHex(hue, 100, 50)}>█</Text>;
            })}
          </Box>

          <Box marginTop={1} />

          {/* Saturation gradient */}
          <Text color="gray" dimColor>Saturation sweep (H:200, L:50%):</Text>
          <Box>
            {Array.from({ length: 48 }, (_, i) => {
              const sat = (i / 47) * 100;
              return <Text key={`s-${i}`} color={hslToHex(200, sat, 50)}>█</Text>;
            })}
          </Box>

          <Box marginTop={1} />

          {/* Lightness gradient */}
          <Text color="gray" dimColor>Lightness sweep (H:200, S:100%):</Text>
          <Box>
            {Array.from({ length: 48 }, (_, i) => {
              const light = (i / 47) * 100;
              return <Text key={`l-${i}`} color={hslToHex(200, 100, light)}>█</Text>;
            })}
          </Box>

          <Box marginTop={1} />

          {/* Full hue x lightness grid */}
          <Text color="gray" dimColor>Hue x Lightness grid:</Text>
          {[20, 35, 50, 65, 80].map(l => (
            <Box key={l}>
              <Text color="gray" dimColor>{String(l).padStart(3)}% </Text>
              {Array.from({ length: 42 }, (_, i) => {
                const hue = (i * 8.5 + offset * 2) % 360;
                return <Text key={`g-${l}-${i}`} color={hslToHex(hue, 90, l)}>█</Text>;
              })}
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1} />
      <Text color="gray">
        {paused ? '⏸ Paused' : '▶ Playing'}
        {' — '}
        Mode: {mode === 'text' ? 'Gradient Text' : 'HSL Color Space'}
      </Text>
      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
