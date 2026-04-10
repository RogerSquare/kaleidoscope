// Demo 21: Streaming markdown renderer
// Character-by-character streaming that renders Markdown formatting as it appears
// Replicates the Claude Code response streaming experience

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';

const SAMPLE_MD = `# Setting Up Authentication

Here's how to add **JWT authentication** to your Express server. This approach uses \`jsonwebtoken\` for token signing and \`bcryptjs\` for password hashing.

## Install Dependencies

\`\`\`bash
npm install jsonwebtoken bcryptjs
\`\`\`

## Implementation

First, create the **auth middleware** that validates tokens on every request:

\`\`\`javascript
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
\`\`\`

## Key Points

- Always store secrets in **environment variables**, never hardcode them
- Use \`bcryptjs\` with a cost factor of *at least* 10
- Tokens should expire -- set \`expiresIn\` to a reasonable value like \`"1h"\`
- Add rate limiting on the login endpoint to prevent brute force attacks

### Checklist

1. Install dependencies
2. Create auth middleware
3. Add login route with password hashing
4. Protect routes with \`requireAuth\`
5. Set up token refresh flow

> Security is not a feature -- it's a requirement. Every endpoint that modifies state should be authenticated.

That's it! Your API is now protected with JWT auth. See the [documentation](https://jwt.io) for more details.`;

interface RenderedLine {
  elements: React.ReactElement[];
}

function renderMarkdownLine(line: string, inCodeBlock: boolean, codeLang: string): { elements: React.ReactElement[]; newCodeBlock: boolean; newCodeLang: string } {
  const elements: React.ReactElement[] = [];
  let idx = 0;

  // Code block toggle
  if (line.startsWith('```')) {
    if (!inCodeBlock) {
      const lang = line.slice(3).trim();
      return {
        elements: [<Text key="cb" color="#30363d">{'─'.repeat(40)} <Text color="#8b949e">{lang || 'code'}</Text></Text>],
        newCodeBlock: true,
        newCodeLang: lang,
      };
    } else {
      return {
        elements: [<Text key="ce" color="#30363d">{'─'.repeat(40)}</Text>],
        newCodeBlock: false,
        newCodeLang: '',
      };
    }
  }

  // Inside code block
  if (inCodeBlock) {
    return {
      elements: [<Text key="code" color="#e6edf3" backgroundColor="#161b22">  {line}</Text>],
      newCodeBlock: true,
      newCodeLang: codeLang,
    };
  }

  // Heading
  if (line.startsWith('### ')) {
    return { elements: [<Text key="h3" color="#d29922" bold>   {line.slice(4)}</Text>], newCodeBlock: false, newCodeLang: '' };
  }
  if (line.startsWith('## ')) {
    return { elements: [<Text key="h2" color="#58a6ff" bold>  {line.slice(3)}</Text>], newCodeBlock: false, newCodeLang: '' };
  }
  if (line.startsWith('# ')) {
    return { elements: [<Text key="h1" color="#f0f6fc" bold>{line.slice(2)}</Text>], newCodeBlock: false, newCodeLang: '' };
  }

  // Blockquote
  if (line.startsWith('> ')) {
    return {
      elements: [
        <Text key="bq">
          <Text color="#30363d">│ </Text>
          <Text color="#8b949e" italic>{line.slice(2)}</Text>
        </Text>
      ],
      newCodeBlock: false, newCodeLang: '',
    };
  }

  // Ordered list
  const olMatch = line.match(/^(\d+)\.\s(.+)/);
  if (olMatch) {
    const content = parseInline(olMatch[2], `ol-${olMatch[1]}`);
    return {
      elements: [<Text key={`ol-${olMatch[1]}`}><Text color="#d29922">{olMatch[1]}.</Text> {content}</Text>],
      newCodeBlock: false, newCodeLang: '',
    };
  }

  // Unordered list
  if (line.startsWith('- ')) {
    const content = parseInline(line.slice(2), 'ul');
    return {
      elements: [<Text key="ul"><Text color="#3fb950">  -</Text> {content}</Text>],
      newCodeBlock: false, newCodeLang: '',
    };
  }

  // Empty line
  if (line.trim() === '') {
    return { elements: [<Text key="empty"> </Text>], newCodeBlock: false, newCodeLang: '' };
  }

  // Regular paragraph with inline formatting
  return { elements: [parseInline(line, 'p')], newCodeBlock: false, newCodeLang: '' };
}

function parseInline(text: string, keyPrefix: string): React.ReactElement {
  const parts: React.ReactElement[] = [];
  let i = 0;
  let partIdx = 0;

  while (i < text.length) {
    // Inline code
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i) {
        parts.push(<Text key={`${keyPrefix}-${partIdx++}`} color="#e8945a" backgroundColor="#2d1f0f">{text.slice(i + 1, end)}</Text>);
        i = end + 1;
        continue;
      }
    }

    // Bold
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end > i) {
        parts.push(<Text key={`${keyPrefix}-${partIdx++}`} color="white" bold>{text.slice(i + 2, end)}</Text>);
        i = end + 2;
        continue;
      }
    }

    // Italic
    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end > i) {
        parts.push(<Text key={`${keyPrefix}-${partIdx++}`} color="#c9d1d9" italic>{text.slice(i + 1, end)}</Text>);
        i = end + 1;
        continue;
      }
    }

    // Link [text](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i);
      const openParen = text.indexOf('(', closeBracket);
      const closeParen = text.indexOf(')', openParen);
      if (closeBracket > i && openParen === closeBracket + 1 && closeParen > openParen) {
        const linkText = text.slice(i + 1, closeBracket);
        const url = text.slice(openParen + 1, closeParen);
        parts.push(
          <Text key={`${keyPrefix}-${partIdx++}`}>
            <Text color="#58a6ff" underline>{linkText}</Text>
            <Text color="#30363d"> ({url})</Text>
          </Text>
        );
        i = closeParen + 1;
        continue;
      }
    }

    // Plain text - collect until next special char
    let plain = '';
    while (i < text.length && !['`', '*', '['].includes(text[i])) {
      plain += text[i];
      i++;
    }
    if (plain) {
      parts.push(<Text key={`${keyPrefix}-${partIdx++}`} color="#c9d1d9">{plain}</Text>);
    }
  }

  return <Text key={keyPrefix}>{parts}</Text>;
}

export default function MarkdownStream() {
  const [charIdx, setCharIdx] = useState(0);
  const [speed, setSpeed] = useState(8);
  const [paused, setPaused] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const done = charIdx >= SAMPLE_MD.length;
  const visibleText = SAMPLE_MD.slice(0, charIdx);

  // Streaming
  useEffect(() => {
    if (done || paused) return;
    const delay = speed + Math.random() * speed * 0.5;
    const timer = setTimeout(() => setCharIdx(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [charIdx, done, paused, speed]);

  // Cursor blink
  useEffect(() => {
    const timer = setInterval(() => setCursorVisible(prev => !prev), 530);
    return () => clearInterval(timer);
  }, []);

  // Parse visible text into rendered lines
  const rendered = useMemo(() => {
    const lines = visibleText.split('\n');
    const result: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeLang = '';

    lines.forEach((line, i) => {
      const { elements, newCodeBlock, newCodeLang } = renderMarkdownLine(line, inCodeBlock, codeLang);
      inCodeBlock = newCodeBlock;
      codeLang = newCodeLang;
      result.push(<Box key={`line-${i}`}>{elements}</Box>);
    });

    return result;
  }, [visibleText]);

  useInput((input) => {
    if (input === 'p') setPaused(prev => !prev);
    else if (input === '1') setSpeed(25);
    else if (input === '2') setSpeed(8);
    else if (input === '3') setSpeed(2);
    else if (input === 'r') { setCharIdx(0); setPaused(false); }
    else if (input === 'f') setCharIdx(SAMPLE_MD.length);
  });

  const progress = Math.round((charIdx / SAMPLE_MD.length) * 100);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="#bc8cff">Streaming Markdown Renderer</Text>
      <Text color="gray">Renders bold, italic, code, headings, lists, links as they stream in</Text>
      <Box marginTop={1} />

      {/* Controls */}
      <Box gap={2}>
        <Text color={speed === 25 ? '#fdb32a' : 'gray'}>1=slow</Text>
        <Text color={speed === 8 ? '#fdb32a' : 'gray'}>2=medium</Text>
        <Text color={speed === 2 ? '#fdb32a' : 'gray'}>3=fast</Text>
        <Text color="gray">p=pause</Text>
        <Text color="gray">r=restart</Text>
        <Text color="gray">f=full</Text>
        <Text color={paused ? '#d29922' : '#3fb950'}>{paused ? '⏸' : '▶'} {progress}%</Text>
      </Box>

      <Box marginTop={1} />

      {/* Rendered markdown */}
      <Box flexDirection="column" borderStyle="round" borderColor="#30363d" paddingX={1} paddingY={1} width={56}>
        {rendered}
        {!done && <Text color="#da7756">{cursorVisible ? '█' : ' '}</Text>}
      </Box>

      <Box marginTop={1} />
      <Text color="gray" dimColor>Press 'q' to return to menu</Text>
    </Box>
  );
}
