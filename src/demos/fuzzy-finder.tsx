// Demo 19: Fuzzy finder / autocomplete
// Non-contiguous character matching with scoring
// Ranked results with match highlighting

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { fuzzyMatch, type FuzzyMatch } from '../lib/utils.js';

// 100+ items dataset
const ITEMS = [
  'src/components/Board.tsx', 'src/components/Sidebar.tsx', 'src/components/TaskCard.tsx',
  'src/components/TaskModal.tsx', 'src/components/Settings.tsx', 'src/components/CreateTaskModal.tsx',
  'src/components/ListView.tsx', 'src/components/TreeView.tsx', 'src/components/ViewSwitcher.tsx',
  'src/components/BulkActionBar.tsx', 'src/components/ProjectProgress.tsx',
  'src/components/PreviewPanel.tsx', 'src/components/DesignStudio.tsx',
  'src/hooks/useTasks.ts', 'src/hooks/useAuth.ts', 'src/hooks/useSocket.ts',
  'src/hooks/useTheme.ts', 'src/hooks/useKeyboard.ts',
  'src/contexts/TaskContext.tsx', 'src/contexts/AuthContext.tsx',
  'src/lib/api.ts', 'src/lib/constants.ts', 'src/lib/utils.ts', 'src/lib/validators.ts',
  'src/App.tsx', 'src/index.ts', 'src/config.ts', 'src/types.ts',
  'backend/server.js', 'backend/db.js',
  'backend/routes/tasks.js', 'backend/routes/auth.js', 'backend/routes/projects.js',
  'backend/routes/services.js', 'backend/routes/agents.js', 'backend/routes/settings.js',
  'backend/routes/chat.js', 'backend/routes/design.js',
  'backend/lib/constants.js', 'backend/lib/authMiddleware.js', 'backend/lib/sanitize.js',
  'backend/lib/logger.js', 'backend/lib/io.js', 'backend/lib/projectRegistry.js',
  'backend/lib/jobQueue.js', 'backend/lib/visionClient.js', 'backend/lib/nsfwClassifier.js',
  'tests/integration/tasks.test.ts', 'tests/integration/auth.test.ts',
  'tests/integration/projects.test.ts', 'tests/integration/services.test.ts',
  'tests/unit/validators.test.ts', 'tests/unit/utils.test.ts',
  'tests/e2e/board.spec.ts', 'tests/e2e/login.spec.ts',
  'tests/setup.ts', 'tests/fixtures/sample-tasks.json',
  'public/index.html', 'public/style.css', 'public/script.js',
  'public/claude-projects.html',
  'package.json', 'package-lock.json', 'tsconfig.json',
  '.gitignore', '.env.example', '.eslintrc.json',
  'docker-compose.yml', 'Dockerfile', 'nginx.conf',
  'README.md', 'CLAUDE.md', 'LICENSE', 'CHANGELOG.md',
  'scripts/build.sh', 'scripts/deploy.sh', 'scripts/seed.js',
  'scripts/migrate.js', 'scripts/backup.sh',
  '.github/workflows/ci.yml', '.github/workflows/release.yml',
  '.github/workflows/deploy.yml', '.github/CODEOWNERS',
  'docs/api.md', 'docs/architecture.md', 'docs/contributing.md',
  'docs/deployment.md', 'docs/security.md',
  'frontend/vite.config.ts', 'frontend/tailwind.config.ts',
  'frontend/postcss.config.js', 'frontend/index.html',
  'data/sample.json', 'data/fixtures.sql', 'data/schema.prisma',
  'infra/terraform/main.tf', 'infra/terraform/variables.tf',
  'infra/kubernetes/deployment.yaml', 'infra/kubernetes/service.yaml',
  'infra/kubernetes/ingress.yaml',
];

function HighlightedPath({ path, matchedIndices, isActive }: { path: string; matchedIndices: number[]; isActive: boolean }) {
  const matchSet = new Set(matchedIndices);
  const parts: React.ReactElement[] = [];

  // Split path into directory and filename
  const lastSlash = path.lastIndexOf('/');
  const dir = lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '';
  const filename = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;

  path.split('').forEach((char, i) => {
    const isMatch = matchSet.has(i);
    const isFilePart = i >= dir.length;
    let color: string;

    if (isMatch) {
      color = '#fdb32a';
    } else if (isFilePart) {
      color = isActive ? 'white' : '#c9d1d9';
    } else {
      color = isActive ? '#8b949e' : '#484f58';
    }

    parts.push(
      <Text key={`c-${i}`} color={color} bold={isMatch} backgroundColor={isMatch ? '#3d2e00' : undefined}>
        {char}
      </Text>
    );
  });

  return <>{parts}</>;
}

const MAX_VISIBLE = 14;

export default function FuzzyFinder() {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query) return ITEMS.slice(0, 30).map(item => ({ item, score: 0, matchedIndices: [] as number[] }));
    const matches: FuzzyMatch[] = [];
    for (const item of ITEMS) {
      const m = fuzzyMatch(query, item);
      if (m) matches.push(m);
    }
    matches.sort((a, b) => b.score - a.score);
    return matches;
  }, [query]);

  // Clamp cursor
  const safeCursor = Math.min(cursor, Math.max(0, results.length - 1));

  useInput((input, key) => {
    if (selected) {
      setSelected(null);
      return;
    }

    if (key.upArrow) {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setCursor(prev => Math.min(results.length - 1, prev + 1));
    } else if (key.return) {
      if (results[safeCursor]) setSelected(results[safeCursor].item);
    } else if (key.escape) {
      if (query) { setQuery(''); setCursorPos(0); setCursor(0); }
    } else if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        setQuery(prev => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
        setCursorPos(prev => prev - 1);
        setCursor(0);
      }
    } else if (key.leftArrow) {
      setCursorPos(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow) {
      setCursorPos(prev => Math.min(query.length, prev + 1));
    } else if (input && !key.ctrl && !key.meta && input !== 'q') {
      setQuery(prev => prev.slice(0, cursorPos) + input + prev.slice(cursorPos));
      setCursorPos(prev => prev + 1);
      setCursor(0);
    }
  });

  if (selected) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="#3fb950">Selected</Text>
        <Box marginTop={1} borderStyle="round" borderColor="#3fb950" paddingX={2} paddingY={1}>
          <Text color="white" bold>{selected}</Text>
        </Box>
        <Box marginTop={1} />
        <Text color="gray" dimColor>Press any key to search again, 'q' to return to menu</Text>
      </Box>
    );
  }

  const visible = results.slice(0, MAX_VISIBLE);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#fdb32a">Fuzzy Finder</Text>
      <Text color="gray">Type to fuzzy-search {ITEMS.length} files. Characters can be non-contiguous.</Text>
      <Box marginTop={1} />

      {/* Search input */}
      <Box borderStyle="round" borderColor={query ? '#fdb32a' : '#30363d'} paddingX={1} width={60}>
        <Text color="#fdb32a">{'>'} </Text>
        {query ? (
          <Text>
            <Text color="white">{query.slice(0, cursorPos)}</Text>
            <Text backgroundColor="white" color="black">{query[cursorPos] || ' '}</Text>
            <Text color="white">{query.slice(cursorPos + 1)}</Text>
          </Text>
        ) : (
          <Text>
            <Text backgroundColor="white" color="black"> </Text>
            <Text color="gray" dimColor>Type to search files...</Text>
          </Text>
        )}
      </Box>

      {/* Result count */}
      <Box marginTop={1} gap={2}>
        <Text color="gray">{results.length}/{ITEMS.length}</Text>
        {query && <Text color="gray" dimColor>fuzzy matching "{query}"</Text>}
      </Box>

      <Box marginTop={1} />

      {/* Results */}
      {visible.length === 0 ? (
        <Text color="gray" dimColor>No matches found.</Text>
      ) : (
        visible.map((result, idx) => {
          const isActive = idx === safeCursor;
          return (
            <Box key={result.item} gap={1}>
              <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
              <HighlightedPath path={result.item} matchedIndices={result.matchedIndices} isActive={isActive} />
              {query && (
                <Text color="#30363d"> {result.score}</Text>
              )}
            </Box>
          );
        })
      )}

      {results.length > MAX_VISIBLE && (
        <Text color="gray" dimColor>  ... {results.length - MAX_VISIBLE} more</Text>
      )}

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu (when search is empty)</Text>
    </Box>
  );
}
