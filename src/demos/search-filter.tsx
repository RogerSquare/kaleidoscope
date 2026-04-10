// Demo 14: Search and filter with match highlighting
// Live filtering as you type, highlighted matches in results

import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

const COMMANDS = [
  { name: '/help', desc: 'Show available commands and usage' },
  { name: '/clear', desc: 'Clear the conversation history' },
  { name: '/compact', desc: 'Compress conversation to save context' },
  { name: '/config', desc: 'Open configuration settings' },
  { name: '/cost', desc: 'Show token usage and cost for this session' },
  { name: '/commit', desc: 'Create a git commit with staged changes' },
  { name: '/diff', desc: 'Show current working directory changes' },
  { name: '/doctor', desc: 'Run diagnostic checks on your setup' },
  { name: '/edit', desc: 'Open a file in your default editor' },
  { name: '/init', desc: 'Initialize a new CLAUDE.md project file' },
  { name: '/login', desc: 'Authenticate with your API key' },
  { name: '/logout', desc: 'Clear stored authentication credentials' },
  { name: '/model', desc: 'Switch the active language model' },
  { name: '/permissions', desc: 'View or modify tool permissions' },
  { name: '/pr', desc: 'Create a pull request from current branch' },
  { name: '/resume', desc: 'Resume a previous conversation session' },
  { name: '/review', desc: 'Review code changes in the working tree' },
  { name: '/search', desc: 'Search files and code in the project' },
  { name: '/status', desc: 'Show git status and branch info' },
  { name: '/terminal', desc: 'Open an embedded terminal session' },
  { name: '/theme', desc: 'Change the color theme' },
  { name: '/undo', desc: 'Undo the last file modification' },
  { name: '/vim', desc: 'Toggle vim keybinding mode' },
];

function HighlightedText({ text, query, baseColor }: { text: string; query: string; baseColor: string }) {
  if (!query) return <Text color={baseColor}>{text}</Text>;

  const parts: React.ReactElement[] = [];
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIdx = 0;

  let searchFrom = 0;
  while (searchFrom < lower.length) {
    const matchIdx = lower.indexOf(lowerQuery, searchFrom);
    if (matchIdx === -1) break;

    // Text before match
    if (matchIdx > lastIdx) {
      parts.push(<Text key={`t-${lastIdx}`} color={baseColor}>{text.slice(lastIdx, matchIdx)}</Text>);
    }
    // Matched text
    parts.push(
      <Text key={`m-${matchIdx}`} color="#fdb32a" bold backgroundColor="#3d2e00">
        {text.slice(matchIdx, matchIdx + query.length)}
      </Text>
    );
    lastIdx = matchIdx + query.length;
    searchFrom = lastIdx;
  }

  // Remaining text
  if (lastIdx < text.length) {
    parts.push(<Text key={`t-${lastIdx}`} color={baseColor}>{text.slice(lastIdx)}</Text>);
  }

  return <>{parts}</>;
}

export default function SearchFilter() {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const filtered = useMemo(() => {
    if (!query) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(cmd =>
      cmd.name.toLowerCase().includes(q) || cmd.desc.toLowerCase().includes(q)
    );
  }, [query]);

  // Clamp cursor when filter changes
  const safeCursor = Math.min(cursor, Math.max(0, filtered.length - 1));
  if (safeCursor !== cursor) setCursor(safeCursor);

  useInput((input, key) => {
    if (key.upArrow) {
      setCursor(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setCursor(prev => Math.min(filtered.length - 1, prev + 1));
    } else if (key.escape) {
      if (query) {
        setQuery('');
        setCursorPos(0);
        setCursor(0);
      }
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

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#fdb32a">Search and Filter</Text>
      <Text color="gray">Type to filter, ↑↓ to navigate results, Esc to clear</Text>
      <Box marginTop={1} />

      {/* Search input */}
      <Box borderStyle="round" borderColor={query ? '#fdb32a' : '#30363d'} paddingX={1} width={56}>
        <Text color="#fdb32a">/ </Text>
        {query ? (
          <Text>
            <Text color="white">{query.slice(0, cursorPos)}</Text>
            <Text backgroundColor="white" color="black">{query[cursorPos] || ' '}</Text>
            <Text color="white">{query.slice(cursorPos + 1)}</Text>
          </Text>
        ) : (
          <Text>
            <Text backgroundColor="white" color="black"> </Text>
            <Text color="gray" dimColor>Type to search commands...</Text>
          </Text>
        )}
      </Box>

      {/* Result count */}
      <Box marginTop={1} gap={2}>
        <Text color="gray">
          {filtered.length}/{COMMANDS.length} commands
        </Text>
        {query && (
          <Text color="gray" dimColor>
            matching "{query}"
          </Text>
        )}
      </Box>

      <Box marginTop={1} />

      {/* Results */}
      {filtered.length === 0 ? (
        <Box paddingY={1}>
          <Text color="gray" dimColor>No commands match your search.</Text>
        </Box>
      ) : (
        filtered.slice(0, 15).map((cmd, idx) => {
          const isActive = idx === safeCursor;
          return (
            <Box key={cmd.name} gap={1}>
              <Text color={isActive ? '#fdb32a' : 'gray'}>{isActive ? '❯' : ' '}</Text>
              <Box width={18}>
                <HighlightedText text={cmd.name} query={query} baseColor={isActive ? '#58a6ff' : '#58a6ff'} />
              </Box>
              <HighlightedText text={cmd.desc} query={query} baseColor={isActive ? 'white' : 'gray'} />
            </Box>
          );
        })
      )}

      {filtered.length > 15 && (
        <Text color="gray" dimColor>  ... and {filtered.length - 15} more</Text>
      )}

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu (when search is empty)</Text>
    </Box>
  );
}
