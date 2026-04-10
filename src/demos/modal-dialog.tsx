// Demo 9: Modal/Dialog overlay system
// Shows info, warning, danger dialogs with focus trapping
// Supports stacked modals and keyboard shortcuts

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

type DialogType = 'info' | 'warning' | 'danger' | 'success';

interface Dialog {
  type: DialogType;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
}

const DIALOG_STYLES: Record<DialogType, { color: string; icon: string; border: string }> = {
  info:    { color: '#58a6ff', icon: 'ℹ', border: 'round' },
  warning: { color: '#d29922', icon: '⚠', border: 'round' },
  danger:  { color: '#f85149', icon: '✕', border: 'double' },
  success: { color: '#3fb950', icon: '✓', border: 'round' },
};

const SAMPLE_DIALOGS: Dialog[] = [
  { type: 'info', title: 'Information', body: 'This operation will create a new branch\nfrom the current HEAD commit.\n\nNo existing work will be affected.', confirmLabel: 'OK' },
  { type: 'warning', title: 'Warning', body: 'You have unsaved changes in 3 files.\nContinuing will discard these changes.\n\nThis action cannot be undone.', confirmLabel: 'Discard', cancelLabel: 'Cancel' },
  { type: 'danger', title: 'Delete Repository', body: 'This will permanently delete the repository\nincluding all commit history, issues, and\npull requests.\n\nType the repo name to confirm.', confirmLabel: 'Delete', cancelLabel: 'Cancel' },
  { type: 'success', title: 'Deployment Complete', body: 'Your application has been successfully\ndeployed to production.\n\nVersion: v2.4.1\nEnvironment: production\nRegion: us-east-1', confirmLabel: 'Done' },
];

function DialogBox({ dialog, onConfirm, onCancel, depth }: { dialog: Dialog; onConfirm: () => void; onCancel?: () => void; depth: number }) {
  const [focusConfirm, setFocusConfirm] = useState(!dialog.cancelLabel);
  const style = DIALOG_STYLES[dialog.type];

  useInput((input, key) => {
    if (key.escape && onCancel) {
      onCancel();
    } else if (key.return) {
      if (focusConfirm) onConfirm();
      else if (onCancel) onCancel();
    } else if (key.leftArrow || key.rightArrow || input === 'h' || input === 'l') {
      if (dialog.cancelLabel) setFocusConfirm(prev => !prev);
    } else if (input === 'y') {
      onConfirm();
    } else if (input === 'n' && onCancel) {
      onCancel();
    }
  });

  const offset = depth * 2;

  return (
    <Box flexDirection="column">
      {/* Dim overlay simulation */}
      {depth === 0 && (
        <Text color="#30363d">{'░'.repeat(50)}</Text>
      )}

      {/* Dialog box */}
      <Box
        flexDirection="column"
        borderStyle={style.border as any}
        borderColor={style.color}
        paddingX={2}
        paddingY={1}
        marginLeft={offset}
        width={46}
      >
        {/* Title bar */}
        <Box gap={1} marginBottom={1}>
          <Text color={style.color} bold>{style.icon}</Text>
          <Text color={style.color} bold>{dialog.title}</Text>
        </Box>

        {/* Body */}
        {dialog.body.split('\n').map((line, i) => (
          <Text key={`line-${i}`} color="white">{line}</Text>
        ))}

        {/* Buttons */}
        <Box marginTop={1} gap={2} justifyContent="flex-end">
          {dialog.cancelLabel && (
            <Text
              color={!focusConfirm ? 'white' : '#8b949e'}
              bold={!focusConfirm}
              backgroundColor={!focusConfirm ? '#30363d' : undefined}
            >
              {!focusConfirm ? ` ${dialog.cancelLabel} ` : ` ${dialog.cancelLabel} `}
            </Text>
          )}
          <Text
            color={focusConfirm ? (dialog.type === 'danger' ? 'white' : 'white') : '#8b949e'}
            bold={focusConfirm}
            backgroundColor={focusConfirm ? style.color : undefined}
          >
            {` ${dialog.confirmLabel} `}
          </Text>
        </Box>
      </Box>

      {depth === 0 && (
        <Text color="#30363d">{'░'.repeat(50)}</Text>
      )}
    </Box>
  );
}

export default function ModalDialog() {
  const [dialogStack, setDialogStack] = useState<number[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  const activeDialog = dialogStack.length > 0 ? dialogStack[dialogStack.length - 1] : null;

  useInput((input) => {
    // Only handle menu input when no dialog is open
    if (activeDialog !== null) return;

    if (input >= '1' && input <= '4') {
      const idx = parseInt(input) - 1;
      setDialogStack([idx]);
      setLastAction('');
    } else if (input === 's') {
      // Demo stacked dialogs
      setDialogStack([0, 1, 2]);
      setLastAction('');
    }
  });

  const handleConfirm = () => {
    const current = SAMPLE_DIALOGS[dialogStack[dialogStack.length - 1]];
    setLastAction(`Confirmed: ${current.title}`);
    setDialogStack(prev => prev.slice(0, -1));
  };

  const handleCancel = () => {
    const current = SAMPLE_DIALOGS[dialogStack[dialogStack.length - 1]];
    setLastAction(`Cancelled: ${current.title}`);
    setDialogStack(prev => prev.slice(0, -1));
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#bc8cff">Modal/Dialog Overlay</Text>
      <Text color="gray">Focus-trapped dialogs with Esc/Enter, arrow keys for button focus</Text>
      <Box marginTop={1} />

      {/* Trigger buttons */}
      {activeDialog === null && (
        <Box flexDirection="column">
          <Text color="gray">Press a number to open a dialog:</Text>
          <Box marginTop={1} />
          <Box gap={1}><Text color="gray">1.</Text><Text color="#58a6ff">Info Dialog</Text><Text color="gray">— simple acknowledgment</Text></Box>
          <Box gap={1}><Text color="gray">2.</Text><Text color="#d29922">Warning Dialog</Text><Text color="gray">— confirm/cancel with consequences</Text></Box>
          <Box gap={1}><Text color="gray">3.</Text><Text color="#f85149">Danger Dialog</Text><Text color="gray">— destructive action confirmation</Text></Box>
          <Box gap={1}><Text color="gray">4.</Text><Text color="#3fb950">Success Dialog</Text><Text color="gray">— completion notification</Text></Box>
          <Box gap={1}><Text color="gray">s.</Text><Text color="#bc8cff">Stacked Dialogs</Text><Text color="gray">— three dialogs deep</Text></Box>

          {lastAction && (
            <Box marginTop={1}>
              <Text color="gray">Last action: </Text>
              <Text color="white" bold>{lastAction}</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog stack */}
      {dialogStack.map((dialogIdx, stackIdx) => {
        // Only render the top dialog as interactive
        if (stackIdx < dialogStack.length - 1) {
          const d = SAMPLE_DIALOGS[dialogIdx];
          const st = DIALOG_STYLES[d.type];
          return (
            <Box key={stackIdx} flexDirection="column" marginLeft={stackIdx * 2} marginTop={stackIdx === 0 ? 1 : 0}>
              <Box borderStyle="round" borderColor="#30363d" paddingX={2} paddingY={1} width={46}>
                <Text color="#30363d">{st.icon} {d.title} (behind)</Text>
              </Box>
            </Box>
          );
        }
        return (
          <Box key={stackIdx} marginTop={stackIdx === 0 ? 1 : 0}>
            <DialogBox
              dialog={SAMPLE_DIALOGS[dialogIdx]}
              onConfirm={handleConfirm}
              onCancel={SAMPLE_DIALOGS[dialogIdx].cancelLabel ? handleCancel : undefined}
              depth={stackIdx}
            />
          </Box>
        );
      })}

      <Box marginTop={1} />
      <Text color="gray" dimColor>
        {activeDialog !== null
          ? 'Enter=confirm  Esc/n=cancel  ←→=switch button  y=yes'
          : "Press 'q' to return to menu"
        }
      </Text>
    </Box>
  );
}
