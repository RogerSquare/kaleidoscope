// Demo 22: Mini Dashboard - composed layout
// Combines multiple component patterns into a single screen
// Status bar, service list, sparklines, live log, keybind hints

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

// Sparkline renderer
const SPARK = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
function sparkline(data: number[], color: string): React.ReactElement {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <Text>
      {data.map((v, i) => {
        const idx = Math.min(SPARK.length - 1, Math.floor(((v - min) / range) * SPARK.length));
        return <Text key={`sp-${i}`} color={color}>{SPARK[idx]}</Text>;
      })}
    </Text>
  );
}

interface Service {
  name: string;
  status: 'running' | 'stopped' | 'error';
  cpu: number;
  mem: number;
}

interface LogEntry {
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  msg: string;
}

const LOG_MESSAGES: Record<string, string[]> = {
  INFO: [
    'GET /api/tasks 200 12ms', 'GET /api/projects 200 3ms', 'POST /api/tasks 201 45ms',
    'WebSocket client connected', 'Task status updated: in_progress', 'Cache refreshed (47 entries)',
    'GET /api/services 200 8ms', 'Health check passed', 'Session renewed for user',
  ],
  WARN: [
    'Rate limit: 82/100 requests', 'Slow query: 892ms', 'Disk usage at 78%',
    'Certificate expires in 12 days', 'Memory usage above 70%',
  ],
  ERROR: [
    'Connection refused: Redis on :6379', 'ENOENT: /tmp/cache.json not found',
    'JWT verification failed: token expired', 'Worker process crashed (exit code 1)',
  ],
};

const LEVEL_COLORS: Record<string, string> = { INFO: '#58a6ff', WARN: '#d29922', ERROR: '#f85149' };
const STATUS_ICON: Record<string, { icon: string; color: string }> = {
  running: { icon: '●', color: '#3fb950' },
  stopped: { icon: '○', color: '#8b949e' },
  error: { icon: '✕', color: '#f85149' },
};

export default function MiniDashboard() {
  const [services, setServices] = useState<Service[]>([
    { name: 'API Server', status: 'running', cpu: 12, mem: 256 },
    { name: 'Frontend', status: 'running', cpu: 3, mem: 128 },
    { name: 'Database', status: 'running', cpu: 28, mem: 512 },
    { name: 'Redis', status: 'stopped', cpu: 0, mem: 0 },
    { name: 'Worker', status: 'error', cpu: 0, mem: 0 },
    { name: 'Scheduler', status: 'running', cpu: 5, mem: 64 },
  ]);
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array.from({ length: 24 }, () => Math.random() * 60 + 10));
  const [memHistory, setMemHistory] = useState<number[]>(Array.from({ length: 24 }, () => Math.random() * 300 + 400));
  const [reqHistory, setReqHistory] = useState<number[]>(Array.from({ length: 24 }, () => Math.random() * 80 + 20));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [clock, setClock] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [selectedService, setSelectedService] = useState(0);
  const [focusPane, setFocusPane] = useState<'services' | 'logs'>('services');
  const [uptime, setUptime] = useState(0);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuHistory(prev => [...prev.slice(1), Math.max(2, Math.min(95, prev[prev.length - 1] + (Math.random() - 0.5) * 15))]);
      setMemHistory(prev => [...prev.slice(1), Math.max(200, Math.min(900, prev[prev.length - 1] + (Math.random() - 0.5) * 40))]);
      setReqHistory(prev => [...prev.slice(1), Math.max(5, Math.min(150, prev[prev.length - 1] + (Math.random() - 0.5) * 20))]);

      // Fluctuate service CPU/mem
      setServices(prev => prev.map(s => s.status === 'running' ? {
        ...s,
        cpu: Math.max(1, Math.min(99, s.cpu + Math.round((Math.random() - 0.5) * 8))),
        mem: Math.max(32, s.mem + Math.round((Math.random() - 0.5) * 20)),
      } : s));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Generate log entries
  useEffect(() => {
    const timer = setInterval(() => {
      const levels: Array<'INFO' | 'WARN' | 'ERROR'> = ['INFO', 'INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const msgs = LOG_MESSAGES[level];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs(prev => [...prev.slice(-11), { time, level, msg }]);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if (key.tab) {
      setFocusPane(prev => prev === 'services' ? 'logs' : 'services');
    }
    if (focusPane === 'services') {
      if (key.upArrow || input === 'k') setSelectedService(prev => Math.max(0, prev - 1));
      else if (key.downArrow || input === 'j') setSelectedService(prev => Math.min(services.length - 1, prev + 1));
    }
  });

  const cpuCurrent = Math.round(cpuHistory[cpuHistory.length - 1]);
  const memCurrent = Math.round(memHistory[memHistory.length - 1]);
  const reqCurrent = Math.round(reqHistory[reqHistory.length - 1]);
  const runningCount = services.filter(s => s.status === 'running').length;
  const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;

  return (
    <Box flexDirection="column">
      {/* Top status bar */}
      <Box justifyContent="space-between" paddingX={1} height={1}>
        <Box gap={2}>
          <Text color="#3fb950" bold>● ONLINE</Text>
          <Text color="gray">Services: <Text color="white">{runningCount}/{services.length}</Text></Text>
          <Text color="gray">Uptime: <Text color="white">{uptimeStr}</Text></Text>
        </Box>
        <Box gap={2}>
          <Text color="gray">CPU: <Text color={cpuCurrent > 80 ? '#f85149' : cpuCurrent > 50 ? '#d29922' : '#3fb950'}>{cpuCurrent}%</Text></Text>
          <Text color="gray">MEM: <Text color="white">{memCurrent}MB</Text></Text>
          <Text color="#8b949e">{clock}</Text>
        </Box>
      </Box>

      <Text color="#30363d">{'─'.repeat(76)}</Text>

      {/* Main content area */}
      <Box>
        {/* Left: Services */}
        <Box flexDirection="column" width={30} borderStyle="round" borderColor={focusPane === 'services' ? '#58a6ff' : '#30363d'} paddingX={1}>
          <Text color={focusPane === 'services' ? '#58a6ff' : '#8b949e'} bold>Services</Text>
          <Box marginTop={1} />
          {services.map((s, i) => {
            const isActive = i === selectedService && focusPane === 'services';
            const st = STATUS_ICON[s.status];
            return (
              <Box key={s.name} gap={1}>
                <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
                <Text color={st.color}>{st.icon}</Text>
                <Text color={isActive ? 'white' : 'gray'} bold={isActive}>{s.name.padEnd(12)}</Text>
                {s.status === 'running' && (
                  <Text color="gray" dimColor>{String(s.cpu).padStart(2)}%</Text>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Right column */}
        <Box flexDirection="column" flexGrow={1}>
          {/* Metrics sparklines */}
          <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={1}>
            <Text color="#8b949e" bold>Metrics</Text>
            <Box marginTop={1} />
            <Box gap={1}>
              <Text color="gray">CPU  </Text>
              {sparkline(cpuHistory, '#3fb950')}
              <Text color="white"> {cpuCurrent}%</Text>
            </Box>
            <Box gap={1}>
              <Text color="gray">MEM  </Text>
              {sparkline(memHistory, '#58a6ff')}
              <Text color="white"> {memCurrent}MB</Text>
            </Box>
            <Box gap={1}>
              <Text color="gray">REQ/s</Text>
              {sparkline(reqHistory, '#da7756')}
              <Text color="white"> {reqCurrent}</Text>
            </Box>
          </Box>

          {/* Logs */}
          <Box flexDirection="column" borderStyle="round" borderColor={focusPane === 'logs' ? '#58a6ff' : '#30363d'} paddingX={1} height={10}>
            <Text color={focusPane === 'logs' ? '#58a6ff' : '#8b949e'} bold>Live Logs</Text>
            <Box marginTop={1} />
            {logs.slice(-7).map((log, i) => (
              <Box key={`log-${i}`} gap={1}>
                <Text color="gray" dimColor>{log.time}</Text>
                <Text color={LEVEL_COLORS[log.level]} bold>{log.level.padEnd(5)}</Text>
                <Text color={log.level === 'ERROR' ? '#f85149' : 'gray'}>{log.msg}</Text>
              </Box>
            ))}
            {logs.length === 0 && <Text color="gray" dimColor>Waiting for logs...</Text>}
          </Box>
        </Box>
      </Box>

      {/* Bottom keybind bar */}
      <Text color="#30363d">{'─'.repeat(76)}</Text>
      <Box paddingX={1} gap={2}>
        <Text color="#8b949e"><Text color="#58a6ff">Tab</Text> switch pane</Text>
        <Text color="#8b949e"><Text color="#58a6ff">↑↓</Text> navigate</Text>
        <Text color="#8b949e"><Text color="#58a6ff">q</Text> quit</Text>
        <Box flexGrow={1} />
        <Text color="#30363d">Mini Dashboard</Text>
      </Box>
    </Box>
  );
}
