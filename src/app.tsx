import React, { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';

import ClaudeSpinner from './demos/claude-spinner.js';
import ProgressBar from './demos/progress-bar.js';
import StreamingText from './demos/streaming-text.js';
import SelectMenu from './demos/select-menu.js';
import ThinkingIndicator from './demos/thinking-indicator.js';
import TextInputDemo from './demos/text-input.js';
import DiffView from './demos/diff-view.js';
import ScrollableList from './demos/scrollable-list.js';
import ModalDialog from './demos/modal-dialog.js';
import ToastNotifications from './demos/toast-notifications.js';
import TabPanels from './demos/tab-panels.js';
import DataTable from './demos/data-table.js';
import CheckboxSelect from './demos/checkbox-select.js';
import SearchFilter from './demos/search-filter.js';
import TreeViewDemo from './demos/tree-view.js';
import LoadingSkeleton from './demos/loading-skeleton.js';
import GradientText from './demos/gradient-text.js';

const DEMOS = [
  { key: '1', label: 'Claude Spinner', desc: 'Unicode character rotation with variable timing', color: '#da7756', component: ClaudeSpinner },
  { key: '2', label: 'Progress Bars', desc: 'Sub-character precision with Unicode block elements', color: '#0078d4', component: ProgressBar },
  { key: '3', label: 'Streaming Text', desc: 'Character-by-character reveal with cursor', color: '#3fb950', component: StreamingText },
  { key: '4', label: 'Selection Menu', desc: 'Arrow keys, numbers, visual feedback', color: '#58a6ff', component: SelectMenu },
  { key: '5', label: 'Thinking Indicators', desc: 'Shimmer effects, braille spinners, pulses', color: '#bc8cff', component: ThinkingIndicator },
  { key: '6', label: 'Text Input & Forms', desc: 'Ghost text, validation, cursor control', color: '#fdb32a', component: TextInputDemo },
  { key: '7', label: 'Diff Display', desc: 'Animated code diff with syntax coloring', color: '#e8945a', component: DiffView },
  { key: '8', label: 'Scrollable List', desc: 'Viewport clipping, scrollbar, 50 items', color: '#58a6ff', component: ScrollableList },
  { key: '9', label: 'Modal/Dialog', desc: 'Overlays, focus trapping, stacked dialogs', color: '#bc8cff', component: ModalDialog },
  { key: '0', label: 'Toast Notifications', desc: 'Auto-dismiss, countdown, queue system', color: '#d29922', component: ToastNotifications },
  { key: 'a', label: 'Tab Panels', desc: 'Horizontal tabs, content switching, badges', color: '#58a6ff', component: TabPanels },
  { key: 'b', label: 'Data Table', desc: 'Sortable columns, color-coded values, row select', color: '#e8945a', component: DataTable },
  { key: 'c', label: 'Checkbox Select', desc: 'Multi-select, toggle all, invert, select by type', color: '#bc8cff', component: CheckboxSelect },
  { key: 'd', label: 'Search & Filter', desc: 'Live filtering, match highlighting, cursor input', color: '#fdb32a', component: SearchFilter },
  { key: 'e', label: 'Tree View', desc: 'Expandable folders, tree lines, file icons', color: '#3fb950', component: TreeViewDemo },
  { key: 'f', label: 'Loading Skeletons', desc: 'Shimmer placeholders, content transition', color: '#da7756', component: LoadingSkeleton },
  { key: 'g', label: 'Gradient & Color', desc: 'HSL interpolation, animated gradients, presets', color: '#ff00ff', component: GradientText },
];

// Animated title characters
const TITLE = 'Terminal UI Showcase';
const SUBTITLE = 'Animations & interactions inspired by Claude Code';

function Menu({ onSelect }: { onSelect: (idx: number) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [titleFrame, setTitleFrame] = useState(0);
  const { exit } = useApp();

  React.useEffect(() => {
    const timer = setInterval(() => setTitleFrame(prev => prev + 1), 100);
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setActiveIdx(prev => Math.max(0, prev - 1));
    } else if (key.downArrow || input === 'j') {
      setActiveIdx(prev => Math.min(DEMOS.length - 1, prev + 1));
    } else if (key.return) {
      onSelect(activeIdx);
    } else if (input === 'q') {
      exit();
    } else if ((input >= '1' && input <= '9') || input === '0') {
      const idx = input === '0' ? 9 : parseInt(input) - 1;
      if (idx < DEMOS.length) onSelect(idx);
    } else {
      // Letter keys for items 11+
      const letterIdx = DEMOS.findIndex(d => d.key === input);
      if (letterIdx >= 0) onSelect(letterIdx);
    }
  });

  // Color wave for title
  const WAVE_COLORS = ['#4a3728', '#6e4938', '#925b48', '#da7756', '#e8945a', '#fdb32a', '#e8945a', '#da7756', '#925b48', '#6e4938'];

  return (
    <Box flexDirection="column" padding={1}>
      {/* Animated title */}
      <Box>
        {TITLE.split('').map((char, i) => {
          const colorIdx = (titleFrame + i) % WAVE_COLORS.length;
          return <Text key={`t-${i}`} bold color={WAVE_COLORS[colorIdx]}>{char}</Text>;
        })}
      </Box>
      <Text color="gray">{SUBTITLE}</Text>
      <Box marginTop={1} />

      <Text color="gray">Select a demo to view:</Text>
      <Box marginTop={1} />

      {DEMOS.map((demo, i) => {
        const isActive = i === activeIdx;
        return (
          <Box key={demo.key} gap={1}>
            <Text color={isActive ? demo.color : 'gray'}>
              {isActive ? '❯' : ' '}
            </Text>
            <Text color="gray" dimColor>{demo.key}.</Text>
            <Text color={isActive ? demo.color : 'white'} bold={isActive}>
              {demo.label}
            </Text>
            {isActive && <Text color="gray" dimColor> — {demo.desc}</Text>}
          </Box>
        );
      })}

      <Box marginTop={1} />
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text color="gray">
          ↑↓/jk navigate  •  Enter or key to select  •  q quit
        </Text>
      </Box>
    </Box>
  );
}

function App() {
  const [activeDemo, setActiveDemo] = useState<number | null>(null);

  useInput((input) => {
    if (input === 'q' && activeDemo !== null) {
      setActiveDemo(null);
    }
  });

  if (activeDemo !== null) {
    const DemoComponent = DEMOS[activeDemo].component;
    return <DemoComponent />;
  }

  return <Menu onSelect={setActiveDemo} />;
}

render(<App />);
