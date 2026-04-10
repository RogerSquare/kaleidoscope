// Demo 6: Text input with ghost text, validation, and multi-field forms
// Shows how Claude Code handles user input with visual feedback

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface Field {
  label: string;
  placeholder: string;
  value: string;
  validator?: (val: string) => string | null;
}

export default function TextInputDemo() {
  const [fields, setFields] = useState<Field[]>([
    { label: 'Project Name', placeholder: 'my-awesome-project', value: '', validator: (v) => v.length < 2 ? 'Must be at least 2 characters' : /[^a-z0-9-]/.test(v) ? 'Only lowercase, numbers, hyphens' : null },
    { label: 'Description', placeholder: 'A brief description...', value: '' },
    { label: 'Author', placeholder: 'your-github-username', value: '' },
  ]);
  const [activeField, setActiveField] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useInput((input, key) => {
    if (submitted) {
      setSubmitted(false);
      setFields(prev => prev.map(f => ({ ...f, value: '' })));
      setActiveField(0);
      setCursorPos(0);
      return;
    }

    if (key.tab || (key.return && activeField < fields.length - 1)) {
      setActiveField(prev => Math.min(fields.length - 1, prev + 1));
      setCursorPos(fields[Math.min(fields.length - 1, activeField + 1)].value.length);
      return;
    }

    if (key.return && activeField === fields.length - 1) {
      setSubmitted(true);
      return;
    }

    if (key.upArrow) {
      setActiveField(prev => Math.max(0, prev - 1));
      setCursorPos(fields[Math.max(0, activeField - 1)].value.length);
      return;
    }

    if (key.downArrow) {
      setActiveField(prev => Math.min(fields.length - 1, prev + 1));
      setCursorPos(fields[Math.min(fields.length - 1, activeField + 1)].value.length);
      return;
    }

    // Text editing
    if (key.backspace || key.delete) {
      setFields(prev => prev.map((f, i) => {
        if (i !== activeField || cursorPos === 0) return f;
        return { ...f, value: f.value.slice(0, cursorPos - 1) + f.value.slice(cursorPos) };
      }));
      setCursorPos(prev => Math.max(0, prev - 1));
    } else if (key.leftArrow) {
      setCursorPos(prev => Math.max(0, prev - 1));
    } else if (key.rightArrow) {
      setCursorPos(prev => Math.min(fields[activeField].value.length, prev + 1));
    } else if (input && !key.ctrl && !key.meta && input !== 'q') {
      setFields(prev => prev.map((f, i) => {
        if (i !== activeField) return f;
        return { ...f, value: f.value.slice(0, cursorPos) + input + f.value.slice(cursorPos) };
      }));
      setCursorPos(prev => prev + input.length);
    }
  });

  if (submitted) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="#3fb950">Form Submitted!</Text>
        <Box marginTop={1} />
        {fields.map(f => (
          <Box key={f.label} gap={1}>
            <Text color="gray">{f.label}:</Text>
            <Text color="white" bold>{f.value || '(empty)'}</Text>
          </Box>
        ))}
        <Box marginTop={1} />
        <Text color="gray" dimColor>Press any key to reset, 'q' to return to menu</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#fdb32a">Text Input & Forms</Text>
      <Text color="gray">Tab/Enter to next field, arrows to navigate, type to edit</Text>
      <Box marginTop={1} />

      {fields.map((field, i) => {
        const isActive = i === activeField;
        const error = field.validator && field.value ? field.validator(field.value) : null;
        const displayVal = field.value || '';
        const ghost = !field.value ? field.placeholder : '';

        return (
          <Box key={field.label} flexDirection="column" marginBottom={1}>
            <Box gap={1}>
              <Text color={isActive ? '#fdb32a' : 'gray'}>
                {isActive ? '❯' : ' '}
              </Text>
              <Text color={isActive ? 'white' : 'gray'} bold={isActive}>
                {field.label}
              </Text>
              {error && <Text color="#f85149"> {error}</Text>}
            </Box>
            <Box marginLeft={2}>
              <Text color="gray">  </Text>
              {isActive ? (
                <Text>
                  <Text color="white">{displayVal.slice(0, cursorPos)}</Text>
                  <Text backgroundColor="white" color="black">
                    {displayVal[cursorPos] || (ghost ? ghost[0] || ' ' : ' ')}
                  </Text>
                  <Text color="white">{displayVal.slice(cursorPos + 1)}</Text>
                  {!displayVal && ghost && (
                    <Text color="gray" dimColor>{ghost.slice(1)}</Text>
                  )}
                </Text>
              ) : (
                <Text color={displayVal ? 'white' : 'gray'} dimColor={!displayVal}>
                  {displayVal || ghost}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}

      <Box marginTop={1} />
      <Text color="gray" dimColor>
        {activeField === fields.length - 1 ? 'Press Enter to submit' : 'Press Tab or Enter for next field'}
      </Text>
      <Text color="gray" dimColor>Press 'q' to return to menu (when field is empty)</Text>
    </Box>
  );
}
