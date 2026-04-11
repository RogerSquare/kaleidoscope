// Demo 29: Heatmap grid
// GitHub-style contribution graph with color intensity
// Animated fill, cell selection, multiple color schemes

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { getLevel } from '../lib/utils.js';

const WEEKS = 26;
const DAYS = 7;
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ColorScheme {
  name: string;
  levels: string[]; // 5 levels: none, low, medium, high, max
}

const SCHEMES: ColorScheme[] = [
  { name: 'Green', levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] },
  { name: 'Blue', levels: ['#161b22', '#0a2744', '#0d4a7a', '#1a7fbd', '#58a6ff'] },
  { name: 'Purple', levels: ['#161b22', '#2d1650', '#4a2080', '#7c3aed', '#bc8cff'] },
  { name: 'Fire', levels: ['#161b22', '#3d1000', '#6a1a00', '#c84a00', '#ff8c00'] },
  { name: 'Mono', levels: ['#161b22', '#21262d', '#30363d', '#484f58', '#8b949e'] },
];

function generateData(): number[][] {
  const data: number[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    for (let d = 0; d < DAYS; d++) {
      // Simulate realistic contribution patterns
      const isWeekend = d >= 5;
      const baseChance = isWeekend ? 0.3 : 0.7;
      if (Math.random() > baseChance) {
        week.push(0);
      } else {
        // Weighted toward lower values
        const r = Math.random();
        if (r < 0.4) week.push(Math.floor(Math.random() * 3) + 1);
        else if (r < 0.7) week.push(Math.floor(Math.random() * 5) + 3);
        else if (r < 0.9) week.push(Math.floor(Math.random() * 8) + 5);
        else week.push(Math.floor(Math.random() * 12) + 8);
      }
    }
    data.push(week);
  }
  return data;
}

function getDateStr(week: number, day: number): string {
  const now = new Date();
  const daysAgo = (WEEKS - 1 - week) * 7 + (6 - day);
  const date = new Date(now.getTime() - daysAgo * 86400000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getMonthForWeek(week: number): number {
  const now = new Date();
  const daysAgo = (WEEKS - 1 - week) * 7;
  const date = new Date(now.getTime() - daysAgo * 86400000);
  return date.getMonth();
}

export default function Heatmap() {
  const [data, setData] = useState<number[][]>(() => generateData());
  const [cursor, setCursor] = useState({ week: WEEKS - 1, day: 3 });
  const [scheme, setScheme] = useState(0);
  const [revealProgress, setRevealProgress] = useState(WEEKS);
  const [animating, setAnimating] = useState(false);

  const colors = SCHEMES[scheme];

  // Animated fill
  useEffect(() => {
    if (!animating) return;
    if (revealProgress >= WEEKS) { setAnimating(false); return; }
    const timer = setTimeout(() => setRevealProgress(prev => prev + 1), 60);
    return () => clearTimeout(timer);
  }, [revealProgress, animating]);

  const stats = useMemo(() => {
    let total = 0, activeDays = 0, maxDay = 0, streak = 0, currentStreak = 0;
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const v = data[w][d];
        total += v;
        if (v > 0) { activeDays++; currentStreak++; streak = Math.max(streak, currentStreak); }
        else currentStreak = 0;
        maxDay = Math.max(maxDay, v);
      }
    }
    return { total, activeDays, maxDay, streak, totalDays: WEEKS * DAYS };
  }, [data]);

  const selectedVal = data[cursor.week]?.[cursor.day] ?? 0;

  useInput((input, key) => {
    if (key.leftArrow || input === 'h') setCursor(prev => ({ ...prev, week: Math.max(0, prev.week - 1) }));
    else if (key.rightArrow || input === 'l') setCursor(prev => ({ ...prev, week: Math.min(WEEKS - 1, prev.week + 1) }));
    else if (key.upArrow || input === 'k') setCursor(prev => ({ ...prev, day: Math.max(0, prev.day - 1) }));
    else if (key.downArrow || input === 'j') setCursor(prev => ({ ...prev, day: Math.min(DAYS - 1, prev.day + 1) }));
    else if (key.tab) setScheme(prev => (prev + 1) % SCHEMES.length);
    else if (input === 'r') {
      setData(generateData());
      setRevealProgress(0);
      setAnimating(true);
    } else if (input === 'a') {
      setRevealProgress(0);
      setAnimating(true);
    }
  });

  // Month labels along the top
  const monthHeaders: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const m = getMonthForWeek(w);
    if (m !== lastMonth) {
      monthHeaders.push({ label: MONTH_LABELS[m], col: w });
      lastMonth = m;
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#3fb950">Heatmap Grid</Text>
      <Text color="gray">GitHub-style contribution graph. ←→↑↓ select, Tab=theme, r=new data, a=animate</Text>
      <Box marginTop={1} />

      {/* Color scheme selector */}
      <Box gap={1} marginBottom={1}>
        <Text color="gray">Theme:</Text>
        {SCHEMES.map((s, i) => (
          <Text key={s.name} color={i === scheme ? s.levels[4] : '#30363d'} bold={i === scheme}>
            {i === scheme ? `[${s.name}]` : s.name}
          </Text>
        ))}
      </Box>

      {/* Month labels */}
      <Box>
        <Text>{'    '}</Text>
        {Array.from({ length: WEEKS }, (_, w) => {
          const header = monthHeaders.find(h => h.col === w);
          return <Text key={`mh-${w}`} color="#8b949e">{header ? header.label.slice(0, 2) : '  '}</Text>;
        })}
      </Box>

      {/* Grid */}
      {Array.from({ length: DAYS }, (_, d) => (
        <Box key={`row-${d}`}>
          <Text color="#8b949e">{DAY_LABELS[d].padEnd(4)}</Text>
          {Array.from({ length: WEEKS }, (_, w) => {
            const val = data[w]?.[d] ?? 0;
            const level = getLevel(val);
            const isSelected = cursor.week === w && cursor.day === d;
            const revealed = w < revealProgress;

            if (!revealed) {
              return <Text key={`c-${w}-${d}`} color="#0d1117">{'  '}</Text>;
            }

            if (isSelected) {
              return <Text key={`c-${w}-${d}`} backgroundColor="#fdb32a" color="#0d1117">{'▪ '}</Text>;
            }

            return <Text key={`c-${w}-${d}`} color={colors.levels[level]}>{'■ '}</Text>;
          })}
        </Box>
      ))}

      {/* Legend */}
      <Box marginTop={1} gap={1}>
        <Text color="gray">Less</Text>
        {colors.levels.map((c, i) => (
          <Text key={`leg-${i}`} color={c}>■</Text>
        ))}
        <Text color="gray">More</Text>
        <Box flexGrow={1} />
        <Text color="#fdb32a" bold>{getDateStr(cursor.week, cursor.day)}</Text>
      </Box>

      {/* Selected cell info */}
      <Box marginTop={1} gap={2}>
        <Text color={colors.levels[getLevel(selectedVal)]}>
          {selectedVal === 0 ? 'No contributions' : `${selectedVal} contribution${selectedVal !== 1 ? 's' : ''}`}
        </Text>
      </Box>

      {/* Stats */}
      <Box marginTop={1} gap={3}>
        <Text color="gray">Total: <Text color="white" bold>{stats.total}</Text></Text>
        <Text color="gray">Active: <Text color="white">{stats.activeDays}/{stats.totalDays} days</Text></Text>
        <Text color="gray">Streak: <Text color="white">{stats.streak}d</Text></Text>
        <Text color="gray">Max: <Text color="white">{stats.maxDay}/day</Text></Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
