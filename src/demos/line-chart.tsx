// Demo 20: ASCII line chart
// Braille dot plotting for sub-character precision
// Multiple series, auto-scaling Y axis, sparklines

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

// Braille dot patterns for 2x4 grid per character
// Each character cell is a 2-wide x 4-tall dot grid
// Dot positions: ⡀⡁⡂⡃⡄⡅⡆⡇⠈⠉⠊⠋⠌⠍⠎⠏ etc.
// Braille char = 0x2800 + dot bits
// Dot layout:  1 4
//              2 5
//              3 6
//              7 8
const BRAILLE_BASE = 0x2800;
const DOT_BITS = [
  [0x01, 0x08], // row 0: dots 1,4
  [0x02, 0x10], // row 1: dots 2,5
  [0x04, 0x20], // row 2: dots 3,6
  [0x40, 0x80], // row 3: dots 7,8
];

interface Series {
  name: string;
  color: string;
  data: number[];
}

function generateData(length: number, base: number, variance: number, trend: number): number[] {
  const data: number[] = [];
  let val = base;
  for (let i = 0; i < length; i++) {
    val += (Math.random() - 0.5) * variance + trend;
    val = Math.max(0, val);
    data.push(Math.round(val * 10) / 10);
  }
  return data;
}

// Render a braille chart for a single series
function renderBrailleChart(data: number[], width: number, height: number, min: number, max: number): string[] {
  const rows = height * 4; // 4 dot rows per character row
  const cols = width * 2;  // 2 dot cols per character column
  const grid: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  const range = max - min || 1;

  // Plot data points and connect with lines
  for (let i = 0; i < Math.min(data.length, cols); i++) {
    const y = Math.round(((data[i] - min) / range) * (rows - 1));
    const row = rows - 1 - y; // Flip Y axis
    if (row >= 0 && row < rows && i >= 0 && i < cols) {
      grid[row][i] = true;
      // Connect to next point
      if (i + 1 < data.length && i + 1 < cols) {
        const nextY = Math.round(((data[i + 1] - min) / range) * (rows - 1));
        const nextRow = rows - 1 - nextY;
        const steps = Math.abs(nextRow - row);
        for (let s = 0; s <= steps; s++) {
          const interpRow = Math.round(row + (nextRow - row) * (s / Math.max(1, steps)));
          if (interpRow >= 0 && interpRow < rows) grid[interpRow][i] = true;
        }
      }
    }
  }

  // Convert grid to braille characters
  const lines: string[] = [];
  for (let charRow = 0; charRow < height; charRow++) {
    let line = '';
    for (let charCol = 0; charCol < width; charCol++) {
      let code = BRAILLE_BASE;
      for (let dr = 0; dr < 4; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          const gridRow = charRow * 4 + dr;
          const gridCol = charCol * 2 + dc;
          if (gridRow < rows && gridCol < cols && grid[gridRow][gridCol]) {
            code |= DOT_BITS[dr][dc];
          }
        }
      }
      line += String.fromCharCode(code);
    }
    lines.push(line);
  }
  return lines;
}

// Simple sparkline using block characters
function sparkline(data: number[], width: number): string {
  const SPARK_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Sample data to fit width
  const result: string[] = [];
  for (let i = 0; i < width; i++) {
    const dataIdx = Math.round((i / (width - 1)) * (data.length - 1));
    const normalized = (data[dataIdx] - min) / range;
    const charIdx = Math.min(SPARK_CHARS.length - 1, Math.floor(normalized * SPARK_CHARS.length));
    result.push(SPARK_CHARS[charIdx]);
  }
  return result.join('');
}

const CHART_WIDTH = 40;
const CHART_HEIGHT = 8;

export default function LineChart() {
  const [series, setSeries] = useState<Series[]>([]);
  const [tick, setTick] = useState(0);
  const [activeSeries, setActiveSeries] = useState(0);
  const [paused, setPaused] = useState(false);

  // Initialize data
  useEffect(() => {
    setSeries([
      { name: 'CPU %', color: '#3fb950', data: generateData(CHART_WIDTH * 2, 45, 8, 0) },
      { name: 'Memory MB', color: '#58a6ff', data: generateData(CHART_WIDTH * 2, 512, 30, 0.5) },
      { name: 'Requests/s', color: '#da7756', data: generateData(CHART_WIDTH * 2, 120, 25, -0.1) },
    ]);
  }, []);

  // Animate: add new data points
  useEffect(() => {
    if (paused || series.length === 0) return;
    const timer = setInterval(() => {
      setSeries(prev => prev.map(s => {
        const last = s.data[s.data.length - 1];
        const variance = s.name === 'CPU %' ? 5 : s.name === 'Memory MB' ? 15 : 12;
        const newVal = Math.max(0, last + (Math.random() - 0.5) * variance);
        return { ...s, data: [...s.data.slice(-CHART_WIDTH * 2 + 1), Math.round(newVal * 10) / 10] };
      }));
      setTick(prev => prev + 1);
    }, 500);
    return () => clearInterval(timer);
  }, [paused, series.length]);

  useInput((input) => {
    if (input === 'p') setPaused(prev => !prev);
    else if (input === '1') setActiveSeries(0);
    else if (input === '2' && series.length > 1) setActiveSeries(1);
    else if (input === '3' && series.length > 2) setActiveSeries(2);
  });

  if (series.length === 0) return <Text>Loading...</Text>;

  const active = series[activeSeries];
  const data = active.data;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const current = data[data.length - 1];
  const chartLines = renderBrailleChart(data, CHART_WIDTH, CHART_HEIGHT, min, max);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#3fb950">ASCII Line Chart</Text>
      <Text color="gray">Braille dot plotting for sub-character precision. 1/2/3=series, p=pause</Text>
      <Box marginTop={1} />

      {/* Series selector */}
      <Box gap={2}>
        {series.map((s, i) => (
          <Box key={s.name} gap={1}>
            <Text color={i === activeSeries ? s.color : '#30363d'} bold={i === activeSeries}>
              {i === activeSeries ? '●' : '○'}
            </Text>
            <Text color={i === activeSeries ? s.color : '#8b949e'} bold={i === activeSeries}>
              {s.name}
            </Text>
            <Text color={i === activeSeries ? 'white' : '#484f58'}>
              {s.data[s.data.length - 1].toFixed(1)}
            </Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} />

      {/* Main chart with Y axis */}
      <Box>
        {/* Y axis labels */}
        <Box flexDirection="column" marginRight={1}>
          <Text color="gray">{max.toFixed(0).padStart(5)}</Text>
          {Array.from({ length: CHART_HEIGHT - 2 }, (_, i) => {
            const val = max - ((i + 1) / (CHART_HEIGHT - 1)) * (max - min);
            return <Text key={`y-${i}`} color="#30363d">{val.toFixed(0).padStart(5)}</Text>;
          })}
          <Text color="gray">{min.toFixed(0).padStart(5)}</Text>
        </Box>

        {/* Chart area */}
        <Box flexDirection="column">
          {chartLines.map((line, i) => (
            <Text key={`cl-${i}`} color={active.color}>{line}</Text>
          ))}
        </Box>
      </Box>

      {/* X axis */}
      <Box marginLeft={6}>
        <Text color="#30363d">{'└' + '─'.repeat(CHART_WIDTH - 1)}</Text>
      </Box>
      <Box marginLeft={6} justifyContent="space-between" width={CHART_WIDTH}>
        <Text color="gray">-{Math.round(data.length / 2)}s</Text>
        <Text color="gray">now</Text>
      </Box>

      <Box marginTop={1} />

      {/* Sparklines for all series */}
      <Text color="gray" dimColor>Sparklines:</Text>
      {series.map(s => (
        <Box key={s.name} gap={1}>
          <Text color={s.color}>{s.name.padEnd(12)}</Text>
          <Text color={s.color}>{sparkline(s.data, 36)}</Text>
          <Text color="white"> {s.data[s.data.length - 1].toFixed(1)}</Text>
        </Box>
      ))}

      <Box marginTop={1} />
      <Box gap={2}>
        <Text color="gray">Range: {min.toFixed(1)} – {max.toFixed(1)}</Text>
        <Text color="gray">Points: {data.length}</Text>
        <Text color={paused ? '#d29922' : '#3fb950'}>{paused ? '⏸ Paused' : '▶ Live'}</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
