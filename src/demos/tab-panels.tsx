// Demo 11: Tab panel system
// Horizontal tab bar with keyboard navigation
// Different content per tab, count badges, underline indicator

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface Tab {
  label: string;
  badge?: number;
  color: string;
  content: () => React.ReactElement;
}

function OverviewTab() {
  return (
    <Box flexDirection="column" gap={1}>
      <Text color="white" bold>Project Dashboard</Text>
      <Box gap={2}>
        <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={20}>
          <Text color="#3fb950" bold>12</Text>
          <Text color="gray">Services</Text>
        </Box>
        <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={20}>
          <Text color="#58a6ff" bold>47</Text>
          <Text color="gray">Tasks</Text>
        </Box>
        <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={20}>
          <Text color="#d29922" bold>3</Text>
          <Text color="gray">Warnings</Text>
        </Box>
      </Box>
      <Text color="gray">Last deploy: 2 hours ago</Text>
      <Text color="gray">Uptime: 14d 6h 32m</Text>
    </Box>
  );
}

function ServicesTab() {
  const services = [
    { name: 'API Server', status: 'running', port: 3001 },
    { name: 'Frontend', status: 'running', port: 5173 },
    { name: 'Database', status: 'running', port: 5432 },
    { name: 'Redis', status: 'stopped', port: 6379 },
    { name: 'Worker', status: 'error', port: 0 },
  ];
  const statusStyle = { running: { icon: '●', color: '#3fb950' }, stopped: { icon: '○', color: '#8b949e' }, error: { icon: '✕', color: '#f85149' } };

  return (
    <Box flexDirection="column">
      <Text color="white" bold>Registered Services</Text>
      <Box marginTop={1} />
      {services.map((s, i) => {
        const st = statusStyle[s.status as keyof typeof statusStyle];
        return (
          <Box key={i} gap={1}>
            <Text color={st.color}>{st.icon}</Text>
            <Text color="white">{s.name.padEnd(16)}</Text>
            <Text color={st.color}>{s.status.padEnd(10)}</Text>
            <Text color="gray">{s.port ? `:${s.port}` : '—'}</Text>
          </Box>
        );
      })}
    </Box>
  );
}

function LogsTab() {
  const logs = [
    { time: '14:32:01', level: 'INFO', msg: 'GET /api/tasks 200 12ms' },
    { time: '14:32:03', level: 'INFO', msg: 'GET /api/projects 200 3ms' },
    { time: '14:32:15', level: 'WARN', msg: 'Rate limit approaching for 192.168.1.42' },
    { time: '14:32:18', level: 'INFO', msg: 'POST /api/tasks 201 45ms' },
    { time: '14:32:22', level: 'ERROR', msg: 'Connection refused: Redis on port 6379' },
    { time: '14:32:30', level: 'INFO', msg: 'GET /api/services 200 8ms' },
    { time: '14:32:45', level: 'INFO', msg: 'WebSocket client connected: agent-01' },
    { time: '14:33:01', level: 'WARN', msg: 'Slow query: findTasks took 892ms' },
  ];
  const levelColors: Record<string, string> = { INFO: '#58a6ff', WARN: '#d29922', ERROR: '#f85149' };

  return (
    <Box flexDirection="column">
      <Text color="white" bold>Recent Logs</Text>
      <Box marginTop={1} />
      {logs.map((l, i) => (
        <Box key={i} gap={1}>
          <Text color="gray" dimColor>{l.time}</Text>
          <Text color={levelColors[l.level] || 'gray'} bold>{l.level.padEnd(5)}</Text>
          <Text color="white">{l.msg}</Text>
        </Box>
      ))}
    </Box>
  );
}

function SettingsTab() {
  const settings = [
    { key: 'Theme', value: 'Dark', active: true },
    { key: 'Auto-save', value: 'Enabled', active: true },
    { key: 'Notifications', value: 'All', active: true },
    { key: 'Telemetry', value: 'Disabled', active: false },
    { key: 'Debug mode', value: 'Off', active: false },
    { key: 'Log level', value: 'INFO', active: true },
  ];

  return (
    <Box flexDirection="column">
      <Text color="white" bold>Settings</Text>
      <Box marginTop={1} />
      {settings.map((s, i) => (
        <Box key={i} gap={1}>
          <Text color={s.active ? '#3fb950' : '#f85149'}>{s.active ? '●' : '○'}</Text>
          <Text color="gray">{s.key.padEnd(18)}</Text>
          <Text color="white" bold>{s.value}</Text>
        </Box>
      ))}
    </Box>
  );
}

const TABS: Tab[] = [
  { label: 'Overview', color: '#58a6ff', content: OverviewTab },
  { label: 'Services', badge: 5, color: '#3fb950', content: ServicesTab },
  { label: 'Logs', badge: 8, color: '#d29922', content: LogsTab },
  { label: 'Settings', color: '#bc8cff', content: SettingsTab },
];

export default function TabPanels() {
  const [activeTab, setActiveTab] = useState(0);

  useInput((input, key) => {
    if (key.leftArrow || input === 'h') {
      setActiveTab(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow || input === 'l') {
      setActiveTab(prev => Math.min(TABS.length - 1, prev + 1));
    } else if (input >= '1' && input <= String(TABS.length)) {
      setActiveTab(parseInt(input) - 1);
    } else if (key.tab) {
      setActiveTab(prev => (prev + 1) % TABS.length);
    }
  });

  const ActiveContent = TABS[activeTab].content;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#58a6ff">Tab Panel System</Text>
      <Text color="gray">←→/hl to switch tabs, Tab to cycle, 1-{TABS.length} to jump</Text>
      <Box marginTop={1} />

      {/* Tab bar */}
      <Box>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <Box key={i} flexDirection="column">
              <Box gap={1} paddingX={1}>
                <Text
                  color={isActive ? tab.color : '#8b949e'}
                  bold={isActive}
                >
                  {tab.label}
                </Text>
                {tab.badge !== undefined && (
                  <Text
                    color={isActive ? tab.color : '#8b949e'}
                    dimColor={!isActive}
                  >
                    ({tab.badge})
                  </Text>
                )}
              </Box>
              {/* Underline indicator */}
              <Text color={isActive ? tab.color : '#30363d'}>
                {isActive ? '━'.repeat(tab.label.length + (tab.badge !== undefined ? String(tab.badge).length + 3 : 0) + 2) : '─'.repeat(tab.label.length + (tab.badge !== undefined ? String(tab.badge).length + 3 : 0) + 2)}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Tab content */}
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="#30363d"
        paddingX={2}
        paddingY={1}
        marginTop={0}
        minHeight={12}
      >
        <ActiveContent />
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
