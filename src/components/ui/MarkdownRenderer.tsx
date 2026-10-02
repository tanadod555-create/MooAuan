import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

interface TableData {
  headers: string[];
  alignments: Array<'left' | 'center' | 'right'>;
  rows: string[][];
}

type BlockToken =
  | { type: 'header'; level: number; text: string }
  | { type: 'hr' }
  | { type: 'table'; table: TableData }
  | { type: 'list'; items: string[]; ordered: boolean; startNum?: number }
  | { type: 'blockquote'; text: string }
  | { type: 'codeblock'; language?: string; code: string }
  | { type: 'paragraph'; text: string };

/**
 * Tokenizes markdown text into structured semantic blocks (Tables, Headers, Lists, Paragraphs, etc.)
 */
function parseMarkdownBlocks(text: string): BlockToken[] {
  const lines = text.split('\n');
  const tokens: BlockToken[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Codeblock (```...```)
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      tokens.push({
        type: 'codeblock',
        language,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // Markdown Table Detection (| Header 1 | Header 2 | ...)
    if (
      line.startsWith('|') &&
      line.endsWith('|') &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith('|') &&
      lines[i + 1].includes('---')
    ) {
      const headerLine = line;
      const separatorLine = lines[i + 1].trim();

      const parseRow = (rowStr: string): string[] => {
        // Strip leading and trailing pipe and split by pipe
        const cleaned = rowStr.replace(/^\|/, '').replace(/\|$/, '');
        return cleaned.split('|').map((c) => c.trim());
      };

      const headers = parseRow(headerLine);
      const sepCols = parseRow(separatorLine);

      const alignments: Array<'left' | 'center' | 'right'> = sepCols.map((col) => {
        const hasLeft = col.startsWith(':');
        const hasRight = col.endsWith(':');
        if (hasLeft && hasRight) return 'center';
        if (hasRight) return 'right';
        return 'left';
      });

      const rows: string[][] = [];
      i += 2; // Move past header and separator

      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (!nextLine || !nextLine.startsWith('|')) {
          break;
        }
        rows.push(parseRow(nextLine));
        i++;
      }

      tokens.push({
        type: 'table',
        table: {
          headers,
          alignments,
          rows,
        },
      });
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line)) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headers (#, ##, ###, ####, #####, ######)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      tokens.push({ type: 'header', level, text });
      i++;
      continue;
    }

    // Blockquote (> ...)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      tokens.push({
        type: 'blockquote',
        text: quoteLines.join('\n'),
      });
      continue;
    }

    // Unordered List (- , * , • )
    if (/^[\*\-\•]\s+/.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (/^[\*\-\•]\s+/.test(nextLine)) {
          listItems.push(nextLine.replace(/^[\*\-\•]\s+/, ''));
          i++;
        } else if (nextLine.startsWith('  ') && listItems.length > 0) {
          // Indented continuation line
          listItems[listItems.length - 1] += ' ' + nextLine.trim();
          i++;
        } else {
          break;
        }
      }
      tokens.push({
        type: 'list',
        items: listItems,
        ordered: false,
      });
      continue;
    }

    // Ordered List (1. , 2. , etc.)
    if (/^\d+\.\s+/.test(line)) {
      const listItems: string[] = [];
      const matchFirst = line.match(/^(\d+)\.\s+/);
      const startNum = matchFirst ? parseInt(matchFirst[1], 10) : 1;

      while (i < lines.length) {
        const nextLine = lines[i].trim();
        if (/^\d+\.\s+/.test(nextLine)) {
          listItems.push(nextLine.replace(/^\d+\.\s+/, ''));
          i++;
        } else if (nextLine.startsWith('  ') && listItems.length > 0) {
          listItems[listItems.length - 1] += ' ' + nextLine.trim();
          i++;
        } else {
          break;
        }
      }
      tokens.push({
        type: 'list',
        items: listItems,
        ordered: true,
        startNum,
      });
      continue;
    }

    // Regular Paragraph
    tokens.push({
      type: 'paragraph',
      text: line,
    });
    i++;
  }

  return tokens;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and parenthesized notes
 */
function renderInlineFormatting(text: string, isUser = false): React.ReactNode {
  if (!text) return null;

  // Split by inline markdown tokens: `code`, **bold**, *italic*, _italic_
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      // Code
      parts.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-semibold ${
            isUser ? 'bg-white/20 text-white' : 'bg-pink-100 text-rose-700'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      // Bold
      parts.push(
        <strong
          key={match.index}
          className={`font-black ${
            isUser ? 'text-yellow-200' : 'text-rose-600 drop-shadow-2xs'
          }`}
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      // Italic
      const inner = token.slice(1, -1);
      parts.push(
        <em
          key={match.index}
          className={`italic font-medium ${
            isUser ? 'text-white/90' : 'text-slate-600'
          }`}
        >
          {inner}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isUser = false,
  className = '',
}) => {
  if (!content) return null;

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-2 text-xs sm:text-sm leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'header': {
            if (block.level === 1) {
              return (
                <h1
                  key={idx}
                  className={`text-base sm:text-lg font-black mt-3 mb-1.5 pb-1 border-b ${
                    isUser
                      ? 'text-white border-white/30'
                      : 'text-slate-800 border-pink-200/80'
                  }`}
                >
                  {renderInlineFormatting(block.text, isUser)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2
                  key={idx}
                  className={`text-sm sm:text-base font-black mt-3 mb-1.5 pb-1 border-b ${
                    isUser
                      ? 'text-white border-white/20'
                      : 'text-slate-800 border-pink-100'
                  }`}
                >
                  {renderInlineFormatting(block.text, isUser)}
                </h2>
              );
            }
            // Level 3+
            return (
              <h3
                key={idx}
                className={`text-xs sm:text-sm font-black mt-2.5 mb-1 ${
                  isUser ? 'text-yellow-100' : 'text-slate-800'
                }`}
              >
                {renderInlineFormatting(block.text, isUser)}
              </h3>
            );
          }

          case 'hr': {
            return (
              <hr
                key={idx}
                className={`my-2.5 ${
                  isUser ? 'border-white/25' : 'border-pink-200/80'
                }`}
              />
            );
          }

          case 'table': {
            const { headers, alignments, rows } = block.table;
            return (
              <div
                key={idx}
                className="my-3 overflow-x-auto rounded-2xl border border-pink-200/90 shadow-xs bg-white text-slate-800"
              >
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-pink-100/90 via-rose-50/80 to-pink-100/90 text-slate-800 border-b border-pink-200">
                      {headers.map((h, hIdx) => {
                        const align = alignments[hIdx] || 'left';
                        return (
                          <th
                            key={hIdx}
                            className={`px-3 py-2.5 font-black text-slate-800 tracking-wide ${
                              align === 'center'
                                ? 'text-center'
                                : align === 'right'
                                ? 'text-right'
                                : 'text-left'
                            }`}
                          >
                            {renderInlineFormatting(h, false)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-100/70">
                    {rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`transition-colors hover:bg-pink-50/60 ${
                          rIdx % 2 === 1 ? 'bg-pink-50/25' : 'bg-white'
                        }`}
                      >
                        {row.map((cell, cIdx) => {
                          const align = alignments[cIdx] || 'left';
                          return (
                            <td
                              key={cIdx}
                              className={`px-3 py-2 text-slate-700 font-medium ${
                                align === 'center'
                                ? 'text-center'
                                : align === 'right'
                                ? 'text-right'
                                : 'text-left'
                              }`}
                            >
                              {renderInlineFormatting(cell, false)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'list': {
            if (block.ordered) {
              return (
                <ol key={idx} className="space-y-1.5 my-1.5 pl-1">
                  {block.items.map((item, itemIdx) => {
                    const num = (block.startNum || 1) + itemIdx;
                    return (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded-md shrink-0 ${
                            isUser
                              ? 'bg-white/20 text-white'
                              : 'bg-pink-100 text-rose-600'
                          }`}
                        >
                          {num}.
                        </span>
                        <div className="flex-1">
                          {renderInlineFormatting(item, isUser)}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              );
            }

            // Unordered List
            return (
              <ul key={idx} className="space-y-1.5 my-1.5 pl-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2">
                    <span
                      className={`font-black text-sm leading-none mt-1 shrink-0 ${
                        isUser ? 'text-white' : 'text-rose-400'
                      }`}
                    >
                      •
                    </span>
                    <div className="flex-1">
                      {renderInlineFormatting(item, isUser)}
                    </div>
                  </li>
                ))}
              </ul>
            );
          }

          case 'blockquote': {
            return (
              <blockquote
                key={idx}
                className={`border-l-4 pl-3 py-1.5 my-2 rounded-r-xl text-xs italic ${
                  isUser
                    ? 'border-white/60 bg-white/10 text-white/90'
                    : 'border-rose-400 bg-pink-50/60 text-slate-700'
                }`}
              >
                {renderInlineFormatting(block.text, isUser)}
              </blockquote>
            );
          }

          case 'codeblock': {
            return (
              <div
                key={idx}
                className="my-2 p-3 rounded-2xl bg-slate-900 text-pink-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
              >
                <pre>{block.code}</pre>
              </div>
            );
          }

          case 'paragraph':
          default: {
            return (
              <p key={idx} className="my-1">
                {renderInlineFormatting(block.text, isUser)}
              </p>
            );
          }
        }
      })}
    </div>
  );
};
