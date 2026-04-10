// Demo 16: Loading skeletons
// Shimmer placeholders that transition to real content
// Multiple layouts: card, list, profile

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

const SHIMMER_CHARS = ['░', '▒', '▓', '█', '▓', '▒'];
const SHIMMER_COLORS = ['#1a1a24', '#22222e', '#2a2a3a', '#333346', '#2a2a3a', '#22222e'];

function SkeletonLine({ width, shimmerOffset }: { width: number; shimmerOffset: number }) {
  return (
    <Box>
      {Array.from({ length: width }, (_, i) => {
        const idx = (shimmerOffset + i) % SHIMMER_CHARS.length;
        return <Text key={`s-${i}`} color={SHIMMER_COLORS[idx]}>{SHIMMER_CHARS[idx]}</Text>;
      })}
    </Box>
  );
}

function SkeletonCard({ shimmerOffset, loaded, data }: { shimmerOffset: number; loaded: boolean; data: { title: string; desc: string; stat1: string; stat2: string; stat3: string } }) {
  if (loaded) {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={44}>
        <Text color="#58a6ff" bold>{data.title}</Text>
        <Text color="gray">{data.desc}</Text>
        <Box marginTop={1} gap={3}>
          <Text color="#3fb950" bold>{data.stat1}</Text>
          <Text color="#d29922" bold>{data.stat2}</Text>
          <Text color="#bc8cff" bold>{data.stat3}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="#1a1a24" paddingX={2} paddingY={1} width={44}>
      <SkeletonLine width={18} shimmerOffset={shimmerOffset} />
      <SkeletonLine width={32} shimmerOffset={shimmerOffset + 3} />
      <Box marginTop={1} gap={3}>
        <SkeletonLine width={6} shimmerOffset={shimmerOffset + 6} />
        <SkeletonLine width={6} shimmerOffset={shimmerOffset + 9} />
        <SkeletonLine width={6} shimmerOffset={shimmerOffset + 12} />
      </Box>
    </Box>
  );
}

function SkeletonListItem({ shimmerOffset, loaded, data }: { shimmerOffset: number; loaded: boolean; data: { icon: string; name: string; status: string; statusColor: string } }) {
  if (loaded) {
    return (
      <Box gap={1}>
        <Text color={data.statusColor}>{data.icon}</Text>
        <Text color="white">{data.name.padEnd(24)}</Text>
        <Text color={data.statusColor}>{data.status}</Text>
      </Box>
    );
  }

  return (
    <Box gap={1}>
      <SkeletonLine width={1} shimmerOffset={shimmerOffset} />
      <SkeletonLine width={24} shimmerOffset={shimmerOffset + 2} />
      <SkeletonLine width={8} shimmerOffset={shimmerOffset + 5} />
    </Box>
  );
}

function SkeletonProfile({ shimmerOffset, loaded }: { shimmerOffset: number; loaded: boolean }) {
  if (loaded) {
    return (
      <Box flexDirection="column" gap={1}>
        <Box gap={2}>
          <Box flexDirection="column" alignItems="center" width={10}>
            <Text color="#58a6ff">{'╭──────╮'}</Text>
            <Text color="#58a6ff">{'│  RO  │'}</Text>
            <Text color="#58a6ff">{'╰──────╯'}</Text>
          </Box>
          <Box flexDirection="column">
            <Text color="white" bold>Roger Ochoa</Text>
            <Text color="#58a6ff">Software Engineer</Text>
            <Text color="gray">Houston, TX</Text>
          </Box>
        </Box>
        <Box gap={3} marginTop={1}>
          <Box flexDirection="column" alignItems="center">
            <Text color="white" bold>7</Text>
            <Text color="gray" dimColor>repos</Text>
          </Box>
          <Box flexDirection="column" alignItems="center">
            <Text color="white" bold>5</Text>
            <Text color="gray" dimColor>langs</Text>
          </Box>
          <Box flexDirection="column" alignItems="center">
            <Text color="white" bold>8+</Text>
            <Text color="gray" dimColor>years</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Box flexDirection="column" width={10}>
          <SkeletonLine width={8} shimmerOffset={shimmerOffset} />
          <SkeletonLine width={8} shimmerOffset={shimmerOffset + 2} />
          <SkeletonLine width={8} shimmerOffset={shimmerOffset + 4} />
        </Box>
        <Box flexDirection="column">
          <SkeletonLine width={16} shimmerOffset={shimmerOffset + 1} />
          <SkeletonLine width={20} shimmerOffset={shimmerOffset + 3} />
          <SkeletonLine width={12} shimmerOffset={shimmerOffset + 5} />
        </Box>
      </Box>
      <Box gap={3} marginTop={1}>
        <SkeletonLine width={4} shimmerOffset={shimmerOffset + 7} />
        <SkeletonLine width={4} shimmerOffset={shimmerOffset + 9} />
        <SkeletonLine width={4} shimmerOffset={shimmerOffset + 11} />
      </Box>
    </Box>
  );
}

const CARD_DATA = [
  { title: 'Artifex', desc: 'AI image gallery with ML tagging', stat1: '342 stars', stat2: '5 issues', stat3: 'healthy' },
  { title: 'Agent Task Board', desc: 'Kanban for AI dev agents', stat1: '128 stars', stat2: '12 issues', stat3: 'warning' },
];

const LIST_DATA = [
  { icon: '●', name: 'API Server', status: 'running', statusColor: '#3fb950' },
  { icon: '●', name: 'Frontend Dev', status: 'running', statusColor: '#3fb950' },
  { icon: '○', name: 'Redis Cache', status: 'stopped', statusColor: '#8b949e' },
  { icon: '✕', name: 'Worker Process', status: 'error', statusColor: '#f85149' },
  { icon: '●', name: 'Database', status: 'running', statusColor: '#3fb950' },
];

export default function LoadingSkeleton() {
  const [shimmerOffset, setShimmerOffset] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'loaded'>('loading');
  const [loadDuration, setLoadDuration] = useState(3);
  const [elapsed, setElapsed] = useState(0);

  // Shimmer animation
  useEffect(() => {
    const timer = setInterval(() => {
      setShimmerOffset(prev => prev + 1);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Loading simulation
  useEffect(() => {
    if (loadState !== 'loading') return;
    const timer = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= loadDuration) {
          setLoadState('loaded');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loadState, loadDuration]);

  useInput((input) => {
    if (input === 'r') {
      setLoadState('loading');
      setElapsed(0);
    } else if (input === '1') setLoadDuration(2);
    else if (input === '2') setLoadDuration(4);
    else if (input === '3') setLoadDuration(6);
  });

  const loaded = loadState === 'loaded';

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#da7756">Loading Skeletons</Text>
      <Text color="gray">Shimmer placeholders that transition to real content</Text>
      <Box marginTop={1} />

      {/* Controls */}
      <Box gap={2}>
        <Text color="gray">r=reload</Text>
        <Text color={loadDuration === 2 ? '#fdb32a' : 'gray'}>1=fast (2s)</Text>
        <Text color={loadDuration === 4 ? '#fdb32a' : 'gray'}>2=medium (4s)</Text>
        <Text color={loadDuration === 6 ? '#fdb32a' : 'gray'}>3=slow (6s)</Text>
        {!loaded && <Text color="#da7756">Loading... {elapsed}/{loadDuration}s</Text>}
        {loaded && <Text color="#3fb950">Loaded</Text>}
      </Box>

      <Box marginTop={1} />

      {/* Profile skeleton */}
      <Text color="gray" dimColor>Profile</Text>
      <Box marginTop={0} borderStyle="round" borderColor={loaded ? '#30363d' : '#1a1a24'} paddingX={2} paddingY={1} width={44}>
        <SkeletonProfile shimmerOffset={shimmerOffset} loaded={loaded} />
      </Box>

      <Box marginTop={1} />

      {/* Card skeletons */}
      <Text color="gray" dimColor>Cards</Text>
      <Box gap={1} marginTop={0}>
        {CARD_DATA.map((card, i) => (
          <SkeletonCard key={i} shimmerOffset={shimmerOffset + i * 5} loaded={loaded} data={card} />
        ))}
      </Box>

      <Box marginTop={1} />

      {/* List skeletons */}
      <Text color="gray" dimColor>Services</Text>
      <Box flexDirection="column" marginTop={0} borderStyle="round" borderColor={loaded ? '#30363d' : '#1a1a24'} paddingX={2} paddingY={1} width={44}>
        {LIST_DATA.map((item, i) => (
          <SkeletonListItem key={i} shimmerOffset={shimmerOffset + i * 3} loaded={loaded} data={item} />
        ))}
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
