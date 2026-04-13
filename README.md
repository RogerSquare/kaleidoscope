![CI](https://github.com/RogerSquare/kaleidoscope/actions/workflows/ci.yml/badge.svg)

# Kaleidoscope

> Terminal UI playground — isolated animation patterns and interaction components, each as a self-contained React-in-terminal demo.

**Live demo:** Clone and `npm install && npm run dev` (demos run locally in your terminal)
**Stack:** TypeScript · React · Ink (React renderer for CLIs) · Vitest
**Status:** Active

## What's interesting technically

Each demo is a self-contained React component rendered *directly to the terminal* using Ink — not to a DOM, not to a canvas, to a TTY. The trick is making React's declarative lifecycle cooperate with the ~60-90ms ANSI paint cycle of a real terminal: `useState` diffs translate into cursor-position rewrites, and `useEffect` schedules frame updates at terminal-sane cadence. The structure borrows from how `Claude Code`, `lazygit`, and `btop` render rich TUIs — surfaced here as small, learnable demos instead of a whole application.

*(formerly Terminal UI Showcase)*

An interactive collection of terminal UI demos built with TypeScript, React, and Ink. Each demo isolates a specific animation pattern or interaction component so you can see how it works in the terminal.

## Overview

This project explores the techniques used by modern terminal applications like Claude Code, lazygit, and btop to create rich, responsive interfaces. Every demo is a self-contained React component rendered directly to the terminal using Ink, which brings component-based architecture and hooks to CLI applications.

## Demos

### Animations
- **Claude Spinner** -- Unicode character rotation with variable frame timing and verb cycling
- **Progress Bars** -- Sub-character precision using 9 Unicode block elements for smooth fill
- **Streaming Text** -- Character-by-character reveal simulating LLM token streaming
- **Thinking Indicators** -- Shimmer effects, braille spinners, pulse animations, color waves
- **Loading Skeletons** -- Shimmer placeholders that transition to real content
- **Gradient Text** -- Per-character HSL color interpolation with animated presets

### Interactive Components
- **Selection Menu** -- Arrow key and number shortcut navigation with visual feedback
- **Text Input & Forms** -- Ghost text, cursor control, validation, multi-field tab navigation
- **Checkbox Multi-Select** -- Toggle, select all, invert, select by type
- **Search & Filter** -- Live filtering with match highlighting in results
- **Tab Panels** -- Horizontal tabs with content switching and count badges
- **Modal/Dialog** -- Overlays with focus trapping, stacked dialogs, confirm/cancel
- **Toast Notifications** -- Auto-dismiss with countdown, queue management, four types

### Data Display
- **Diff View** -- Animated line-by-line code diff with add/remove coloring
- **Scrollable List** -- Viewport clipping with scrollbar, 50 items rendered efficiently
- **Data Table** -- Sortable columns, color-coded values, row selection
- **Tree View** -- Expandable folder structure with tree-drawing characters and file icons

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript |
| UI Framework | React 19 |
| Terminal Renderer | Ink 7 |
| Dev Runner | tsx |

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
git clone https://github.com/RogerSquare/kaleidoscope.git
cd kaleidoscope
npm install
```

### Running

```bash
npm run dev
```

This must be run in a real terminal (not piped or embedded). Ink requires raw mode access to stdin for keyboard input.

Navigate the menu with arrow keys or number/letter shortcuts. Press `q` to return from any demo to the main menu.

## Project Structure

```
src/
  app.tsx                        # Main menu and demo launcher
  demos/
    claude-spinner.tsx           # Unicode spinner with variable timing
    progress-bar.tsx             # Sub-character block element bars
    streaming-text.tsx           # Character-by-character text reveal
    select-menu.tsx              # Arrow key selection with feedback
    thinking-indicator.tsx       # Shimmer, braille, pulse animations
    text-input.tsx               # Form fields with ghost text and validation
    diff-view.tsx                # Animated code diff display
    scrollable-list.tsx          # Viewport-clipped list with scrollbar
    modal-dialog.tsx             # Overlay dialogs with focus trapping
    toast-notifications.tsx      # Auto-dismiss notification queue
    tab-panels.tsx               # Horizontal tab navigation
    data-table.tsx               # Sortable column table
    checkbox-select.tsx          # Multi-select with bulk operations
    search-filter.tsx            # Live filter with match highlighting
    tree-view.tsx                # Expandable folder/file hierarchy
    loading-skeleton.tsx         # Shimmer placeholders with transitions
    gradient-text.tsx            # HSL gradient animation and presets
```

## License

MIT
