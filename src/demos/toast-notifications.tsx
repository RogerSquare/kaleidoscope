// Demo 10: Toast notification system
// Timed auto-dismiss, queue management, multiple types
// Slide-in animation with progress countdown

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  createdAt: number;
  duration: number; // ms
}

const TOAST_STYLES: Record<ToastType, { icon: string; color: string; label: string }> = {
  success: { icon: '✓', color: '#3fb950', label: 'Success' },
  error:   { icon: '✕', color: '#f85149', label: 'Error' },
  info:    { icon: 'ℹ', color: '#58a6ff', label: 'Info' },
  warning: { icon: '⚠', color: '#d29922', label: 'Warning' },
};

const SAMPLE_MESSAGES: Record<ToastType, string[]> = {
  success: ['File saved successfully', 'Deployment complete', 'Tests passed (42/42)', 'Branch merged'],
  error:   ['Connection refused on port 3001', 'Build failed: syntax error', 'Permission denied', 'Timeout after 30s'],
  info:    ['New version available: v2.5.0', '3 tasks assigned to you', 'Server restarted', 'Cache cleared'],
  warning: ['Disk usage at 85%', 'API rate limit: 8/100 remaining', 'Certificate expires in 7 days', 'Memory usage high'],
};

const MAX_VISIBLE = 5;
const TOAST_DURATION = 4000;
const BAR_WIDTH = 20;

function ToastItem({ toast, now }: { toast: Toast; now: number }) {
  const style = TOAST_STYLES[toast.type];
  const elapsed = now - toast.createdAt;
  const remaining = Math.max(0, toast.duration - elapsed);
  const progress = remaining / toast.duration;
  const filledChars = Math.round(progress * BAR_WIDTH);

  // Fade effect: dim when almost expired
  const fading = progress < 0.2;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={fading ? '#30363d' : style.color}
      paddingX={1}
      width={48}
      marginBottom={0}
    >
      <Box gap={1}>
        <Text color={style.color} bold>{style.icon}</Text>
        <Text color={style.color} bold>{style.label}</Text>
        <Box flexGrow={1} />
        <Text color="gray" dimColor>{Math.ceil(remaining / 1000)}s</Text>
      </Box>
      <Text color={fading ? 'gray' : 'white'} dimColor={fading}>{toast.message}</Text>
      <Box marginTop={0}>
        <Text color={style.color}>{'█'.repeat(filledChars)}</Text>
        <Text color="#30363d">{'░'.repeat(BAR_WIDTH - filledChars)}</Text>
      </Box>
    </Box>
  );
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [now, setNow] = useState(Date.now());
  const [totalFired, setTotalFired] = useState(0);
  const nextId = useRef(0);

  // Tick for countdown animation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  // Auto-dismiss expired toasts
  useEffect(() => {
    setToasts(prev => prev.filter(t => now - t.createdAt < t.duration));
  }, [now]);

  const addToast = useCallback((type: ToastType) => {
    const messages = SAMPLE_MESSAGES[type];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const toast: Toast = {
      id: nextId.current++,
      type,
      message,
      createdAt: Date.now(),
      duration: TOAST_DURATION,
    };
    setToasts(prev => [...prev.slice(-(MAX_VISIBLE - 1)), toast]);
    setTotalFired(prev => prev + 1);
  }, []);

  useInput((input) => {
    if (input === '1') addToast('success');
    else if (input === '2') addToast('error');
    else if (input === '3') addToast('info');
    else if (input === '4') addToast('warning');
    else if (input === 'a') {
      // Fire all types at once
      addToast('success');
      setTimeout(() => addToast('error'), 300);
      setTimeout(() => addToast('info'), 600);
      setTimeout(() => addToast('warning'), 900);
    } else if (input === 'c') {
      setToasts([]);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#d29922">Toast Notifications</Text>
      <Text color="gray">Auto-dismiss with countdown, queue management, max {MAX_VISIBLE} visible</Text>
      <Box marginTop={1} />

      {/* Trigger controls */}
      <Box gap={2}>
        <Box gap={1}><Text color="gray">1</Text><Text color="#3fb950">Success</Text></Box>
        <Box gap={1}><Text color="gray">2</Text><Text color="#f85149">Error</Text></Box>
        <Box gap={1}><Text color="gray">3</Text><Text color="#58a6ff">Info</Text></Box>
        <Box gap={1}><Text color="gray">4</Text><Text color="#d29922">Warning</Text></Box>
        <Box gap={1}><Text color="gray">a</Text><Text color="#bc8cff">All</Text></Box>
        <Box gap={1}><Text color="gray">c</Text><Text color="gray">Clear</Text></Box>
      </Box>

      <Box marginTop={1} />

      {/* Toast area */}
      <Box flexDirection="column" minHeight={MAX_VISIBLE * 4 + 1}>
        {toasts.length === 0 ? (
          <Box height={3} alignItems="center" justifyContent="center" width={48}>
            <Text color="gray" dimColor>No notifications. Press 1-4 to fire.</Text>
          </Box>
        ) : (
          toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} now={now} />
          ))
        )}
      </Box>

      {/* Stats */}
      <Box marginTop={1} gap={2}>
        <Text color="gray">Active: {toasts.length}/{MAX_VISIBLE}</Text>
        <Text color="gray">Total fired: {totalFired}</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
