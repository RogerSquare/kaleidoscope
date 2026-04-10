// Demo 8: Scrollable list with viewport
// Renders 50+ items but only shows a window of visible items
// With scroll position indicator and smooth navigation

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

const ITEMS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: [
    'Authentication Service', 'Payment Gateway', 'User Dashboard', 'Email Notifications',
    'File Upload Handler', 'Search Indexer', 'Rate Limiter', 'Cache Manager',
    'WebSocket Server', 'Task Scheduler', 'Log Aggregator', 'Config Manager',
    'Health Monitor', 'API Gateway', 'Session Store', 'Message Queue',
    'Data Pipeline', 'Backup Service', 'Audit Logger', 'Feature Flags',
    'Load Balancer', 'DNS Resolver', 'SSL Manager', 'Webhook Dispatcher',
    'Analytics Engine', 'Report Generator', 'Export Service', 'Import Worker',
    'Notification Hub', 'Subscription Manager', 'Invoice Generator', 'Tax Calculator',
    'Inventory Tracker', 'Order Processor', 'Shipping Estimator', 'Review Moderator',
    'Content Delivery', 'Image Optimizer', 'Video Transcoder', 'PDF Generator',
    'Chat Server', 'Presence Tracker', 'Typing Indicator', 'Read Receipts',
    'Push Notifier', 'Badge Counter', 'Deeplink Router', 'A/B Test Engine',
    'Metrics Collector', 'Alert Manager',
  ][i],
  status: ['running', 'stopped', 'error', 'running', 'running', 'stopped'][i % 6] as string,
  port: 3000 + i,
}));

const VISIBLE_COUNT = 12;

const STATUS_STYLES: Record<string, { icon: string; color: string }> = {
  running: { icon: '●', color: '#3fb950' },
  stopped: { icon: '○', color: '#8b949e' },
  error:   { icon: '✕', color: '#f85149' },
};

export default function ScrollableList() {
  const [cursor, setCursor] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setCursor(prev => {
        const next = Math.max(0, prev - 1);
        // Scroll up if cursor goes above visible window
        setScrollTop(st => Math.min(st, next));
        return next;
      });
    } else if (key.downArrow || input === 'j') {
      setCursor(prev => {
        const next = Math.min(ITEMS.length - 1, prev + 1);
        // Scroll down if cursor goes below visible window
        setScrollTop(st => Math.max(st, next - VISIBLE_COUNT + 1));
        return next;
      });
    } else if (input === 'g') {
      // Jump to top
      setCursor(0);
      setScrollTop(0);
    } else if (input === 'G') {
      // Jump to bottom
      setCursor(ITEMS.length - 1);
      setScrollTop(ITEMS.length - VISIBLE_COUNT);
    } else if (key.pageDown) {
      setCursor(prev => {
        const next = Math.min(ITEMS.length - 1, prev + VISIBLE_COUNT);
        setScrollTop(st => Math.max(st, next - VISIBLE_COUNT + 1));
        return next;
      });
    } else if (key.pageUp) {
      setCursor(prev => {
        const next = Math.max(0, prev - VISIBLE_COUNT);
        setScrollTop(st => Math.min(st, next));
        return next;
      });
    }
  });

  const visibleItems = ITEMS.slice(scrollTop, scrollTop + VISIBLE_COUNT);
  const scrollPercent = ITEMS.length <= VISIBLE_COUNT ? 100 : Math.round((scrollTop / (ITEMS.length - VISIBLE_COUNT)) * 100);

  // Scrollbar calculation
  const trackHeight = VISIBLE_COUNT;
  const thumbHeight = Math.max(1, Math.round((VISIBLE_COUNT / ITEMS.length) * trackHeight));
  const thumbPos = Math.round((scrollTop / (ITEMS.length - VISIBLE_COUNT)) * (trackHeight - thumbHeight));

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Scrollable List with Viewport</Text>
      <Text color="gray">Showing {VISIBLE_COUNT} of {ITEMS.length} items. Only visible items are rendered.</Text>
      <Text color="gray">↑↓/jk navigate, g/G jump to top/bottom, PgUp/PgDn page scroll</Text>
      <Box marginTop={1} />

      {/* Header */}
      <Box>
        <Text color="gray"> </Text>
        <Text color="gray" bold>{'#'.padEnd(4)}</Text>
        <Text color="gray" bold>{'Service'.padEnd(28)}</Text>
        <Text color="gray" bold>{'Status'.padEnd(10)}</Text>
        <Text color="gray" bold>{'Port'}</Text>
      </Box>
      <Text color="gray">{'─'.repeat(55)}</Text>

      {/* Visible items + scrollbar */}
      <Box>
        <Box flexDirection="column">
          {visibleItems.map((item) => {
            const isActive = cursor === item.id - 1;
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.stopped;
            return (
              <Box key={item.id}>
                <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
                <Text color={isActive ? 'white' : 'gray'} bold={isActive}>
                  {String(item.id).padEnd(4)}
                </Text>
                <Text color={isActive ? 'white' : 'gray'} bold={isActive}>
                  {item.name.padEnd(28)}
                </Text>
                <Text color={st.color}>
                  {`${st.icon} ${item.status}`.padEnd(10)}
                </Text>
                <Text color={isActive ? 'white' : 'gray'} dimColor={!isActive}>
                  :{item.port}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Scrollbar track */}
        <Box flexDirection="column" marginLeft={1}>
          {Array.from({ length: trackHeight }, (_, i) => {
            const isThumb = i >= thumbPos && i < thumbPos + thumbHeight;
            return (
              <Text key={i} color={isThumb ? '#58a6ff' : '#30363d'}>
                {isThumb ? '█' : '░'}
              </Text>
            );
          })}
        </Box>
      </Box>

      <Text color="gray">{'─'.repeat(55)}</Text>

      {/* Footer stats */}
      <Box gap={2}>
        <Text color="gray">
          Item {cursor + 1} of {ITEMS.length}
        </Text>
        <Text color="gray">
          Scroll: {scrollPercent}%
        </Text>
        <Text color="gray">
          Viewport: {scrollTop + 1}–{Math.min(scrollTop + VISIBLE_COUNT, ITEMS.length)}
        </Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
