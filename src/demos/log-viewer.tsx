// Demo 26: Terminal log viewer
// Streaming log lines, level filtering, auto-scroll with pause-on-scroll-up

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  source: string;
  msg: string;
}

const LEVEL_STYLES: Record<LogLevel, { color: string; icon: string }> = {
  DEBUG: { color: '#484f58', icon: '·' },
  INFO:  { color: '#58a6ff', icon: '●' },
  WARN:  { color: '#d29922', icon: '▲' },
  ERROR: { color: '#f85149', icon: '✕' },
};

const SOURCES = ['api', 'auth', 'db', 'ws', 'cache', 'worker', 'scheduler'];

const MESSAGES: Record<LogLevel, string[]> = {
  DEBUG: [
    'Parsing request body: 234 bytes',
    'Cache key generated: usr_82af31',
    'SQL query: SELECT * FROM tasks WHERE status = ?',
    'WebSocket frame: ping/pong',
    'Token payload decoded successfully',
    'Middleware chain: cors -> json -> auth -> route',
  ],
  INFO: [
    'GET /api/tasks 200 12ms',
    'POST /api/tasks/create 201 45ms',
    'PUT /api/tasks/feat-001 200 23ms',
    'WebSocket client connected: agent-01',
    'Cache refreshed: 47 entries, 12ms',
    'Background job started: cleanup_orphans',
    'Session renewed for user: RogerSquare',
    'GET /api/projects 200 3ms',
    'DELETE /api/tasks/old-001 200 8ms',
    'Health check passed: all services green',
  ],
  WARN: [
    'Rate limit approaching: 82/100 for 192.168.1.42',
    'Slow query detected: findTasksByProject took 892ms',
    'Disk usage at 78% on /data volume',
    'Certificate expires in 12 days: *.example.com',
    'Memory usage: 1.2GB / 2GB (60%)',
    'Deprecated API version used: v1 (use v2)',
    'Connection pool near limit: 18/20 active',
  ],
  ERROR: [
    'Connection refused: Redis on localhost:6379',
    'ENOENT: /tmp/upload_cache/sess_af31.json not found',
    'JWT verification failed: TokenExpiredError',
    'Worker process crashed with exit code 1',
    'Database transaction deadlock detected, retrying',
    'CORS blocked request from unknown origin',
    'Out of memory: heap limit reached at 2048MB',
  ],
};

const VISIBLE_LINES = 18;

export default function LogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<Record<LogLevel, boolean>>({
    DEBUG: false, INFO: true, WARN: true, ERROR: true,
  });
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(800);
  const nextId = useRef(0);

  // Generate log entries
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      const weights: LogLevel[] = ['DEBUG', 'INFO', 'INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'WARN', 'ERROR'];
      const level = weights[Math.floor(Math.random() * weights.length)];
      const msgs = MESSAGES[level];
      const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const entry: LogEntry = {
        id: nextId.current++,
        time,
        level,
        source,
        msg: msgs[Math.floor(Math.random() * msgs.length)],
      };

      setLogs(prev => {
        const next = [...prev, entry];
        if (next.length > 500) return next.slice(-500);
        return next;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [paused, speed]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) {
      const filtered = logs.filter(l => filters[l.level]);
      setScrollTop(Math.max(0, filtered.length - VISIBLE_LINES));
    }
  }, [logs, autoScroll, filters]);

  const filtered = logs.filter(l => filters[l.level]);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setAutoScroll(false);
      setScrollTop(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setScrollTop(prev => {
        const max = Math.max(0, filtered.length - VISIBLE_LINES);
        const next = Math.min(max, prev + 1);
        if (next >= max) setAutoScroll(true);
        return next;
      });
    } else if (key.pageUp) {
      setAutoScroll(false);
      setScrollTop(prev => Math.max(0, prev - VISIBLE_LINES));
    } else if (key.pageDown) {
      setScrollTop(prev => {
        const max = Math.max(0, filtered.length - VISIBLE_LINES);
        const next = Math.min(max, prev + VISIBLE_LINES);
        if (next >= max) setAutoScroll(true);
        return next;
      });
    } else if (input === 'f') {
      setAutoScroll(true);
    } else if (input === 'p') {
      setPaused(prev => !prev);
    } else if (input === 'c') {
      setLogs([]);
      setScrollTop(0);
    } else if (input === '1') {
      setFilters(prev => ({ ...prev, DEBUG: !prev.DEBUG }));
    } else if (input === '2') {
      setFilters(prev => ({ ...prev, INFO: !prev.INFO }));
    } else if (input === '3') {
      setFilters(prev => ({ ...prev, WARN: !prev.WARN }));
    } else if (input === '4') {
      setFilters(prev => ({ ...prev, ERROR: !prev.ERROR }));
    } else if (input === '+') {
      setSpeed(prev => Math.max(200, prev - 200));
    } else if (input === '-') {
      setSpeed(prev => Math.min(2000, prev + 200));
    }
  });

  const visible = filtered.slice(scrollTop, scrollTop + VISIBLE_LINES);
  const levelCounts: Record<LogLevel, number> = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 };
  logs.forEach(l => levelCounts[l.level]++);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Terminal Log Viewer</Text>
      <Text color="gray">Streaming logs with level filtering. Scroll up pauses auto-scroll.</Text>
      <Box marginTop={1} />

      {/* Filter bar */}
      <Box gap={2}>
        {(Object.keys(filters) as LogLevel[]).map((level, i) => {
          const style = LEVEL_STYLES[level];
          const active = filters[level];
          return (
            <Box key={level} gap={1}>
              <Text color="gray">{i + 1}</Text>
              <Text color={active ? style.color : '#30363d'} bold={active}>
                {active ? '[x]' : '[ ]'} {style.icon} {level}
              </Text>
              <Text color="#30363d">({levelCounts[level]})</Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} />

      {/* Log output */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d">
        {visible.length === 0 ? (
          <Box paddingX={2} paddingY={1}>
            <Text color="gray" dimColor>{logs.length === 0 ? 'Waiting for logs...' : 'No logs match current filters'}</Text>
          </Box>
        ) : (
          visible.map(log => {
            const style = LEVEL_STYLES[log.level];
            return (
              <Box key={log.id} paddingX={1} gap={1}>
                <Text color="#30363d">{log.time}</Text>
                <Text color={style.color} bold>{style.icon} {log.level.padEnd(5)}</Text>
                <Text color="#484f58">[{log.source.padEnd(9)}]</Text>
                <Text color={log.level === 'ERROR' ? '#f85149' : log.level === 'WARN' ? '#d29922' : '#c9d1d9'}>
                  {log.msg}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      {/* Status bar */}
      <Box gap={2} marginTop={1}>
        <Text color={autoScroll ? '#3fb950' : '#d29922'}>
          {autoScroll ? '▼ Auto-scroll' : '⏸ Scrolled up (f=follow)'}
        </Text>
        <Text color="gray">
          {filtered.length}/{logs.length} shown
        </Text>
        <Text color={paused ? '#d29922' : '#3fb950'}>
          {paused ? '⏸ Paused' : '▶ Live'}
        </Text>
        <Text color="gray">
          ~{Math.round(1000 / speed)}/s
        </Text>
        <Text color="gray">+/- speed</Text>
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>1-4=toggle levels, p=pause, c=clear, f=follow, +/-=speed, q=menu</Text>
    </Box>
  );
}
