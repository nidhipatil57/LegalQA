import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Split lines into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];
  let listBuffer: string[] = [];
  let isNumberedList = false;

  const flushList = (keyPrefix: string) => {
    if (listBuffer.length === 0) return;
    const listItems = listBuffer.map((item, i) => (
      <li key={`${keyPrefix}-item-${i}`} className="flex items-start gap-2 text-xs leading-relaxed text-gray-200">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
        <span>{renderFormattedInline(item)}</span>
      </li>
    ));

    elements.push(
      <ul key={`${keyPrefix}-list`} className="space-y-1.5 my-2.5 pl-1">
        {listItems}
      </ul>
    );
    listBuffer = [];
  };

  const flushCodeBlock = (keyPrefix: string) => {
    if (codeBlockBuffer.length === 0) return;
    elements.push(
      <div key={`${keyPrefix}-code`} className="my-3 p-3.5 rounded-xl bg-[#030712] border border-white/10 font-mono text-xs text-blue-300 overflow-x-auto">
        <pre className="whitespace-pre">{codeBlockBuffer.join('\n')}</pre>
      </div>
    );
    codeBlockBuffer = [];
  };

  lines.forEach((line, index) => {
    const key = `line-${index}`;

    // Code block demarcation
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(key);
        inCodeBlock = false;
      } else {
        flushList(key);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList(key);
      elements.push(
        <h3 key={key} className="text-sm font-bold text-white uppercase tracking-wider mt-4 mb-2 pb-1 border-b border-white/10 flex items-center gap-2">
          {renderFormattedInline(line.replace('### ', ''))}
        </h3>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList(key);
      elements.push(
        <h2 key={key} className="text-base font-extrabold text-white tracking-tight mt-5 mb-2">
          {renderFormattedInline(line.replace('## ', ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('# ')) {
      flushList(key);
      elements.push(
        <h1 key={key} className="text-lg font-extrabold text-white tracking-tight mt-6 mb-3">
          {renderFormattedInline(line.replace('# ', ''))}
        </h1>
      );
      return;
    }

    // Lists
    if (/^[-*]\s+/.test(line.trim())) {
      const itemText = line.trim().replace(/^[-*]\s+/, '');
      listBuffer.push(itemText);
      return;
    }

    if (/^[0-9]+\.\s+/.test(line.trim())) {
      const itemText = line.trim().replace(/^[0-9]+\.\s+/, '');
      listBuffer.push(itemText);
      return;
    }

    // If not a list line, flush list buffer
    flushList(key);

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={key} className="h-2" />);
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key} className="my-2 p-3 border-l-2 border-blue-500 bg-blue-500/5 text-xs text-blue-200 italic rounded-r-lg">
          {renderFormattedInline(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Normal paragraph
    elements.push(
      <p key={key} className="text-xs leading-relaxed text-gray-200 font-light my-1">
        {renderFormattedInline(line)}
      </p>
    );
  });

  // Flush remaining buffers
  flushList('final');
  flushCodeBlock('final');

  return <div className="space-y-1">{elements}</div>;
};

// Inline Formatter for **bold**, *italic*, and `code`
function renderFormattedInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex matches **bold**, *italic*, `code`, and [Citation X]
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[Citation\s+\d+\])/g;
  const matches = [...remaining.matchAll(regex)];

  if (matches.length === 0) {
    return text;
  }

  let lastIndex = 0;
  matches.forEach((match) => {
    const matchText = match[0];
    const matchIndex = match.index || 0;

    if (matchIndex > lastIndex) {
      parts.push(remaining.substring(lastIndex, matchIndex));
    }

    if (matchText.startsWith('**') && matchText.endsWith('**')) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-white">
          {matchText.slice(2, -2)}
        </strong>
      );
    } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic text-gray-300">
          {matchText.slice(1, -1)}
        </em>
      );
    } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
      parts.push(
        <code key={`c-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 font-mono text-[11px]">
          {matchText.slice(1, -1)}
        </code>
      );
    } else if (matchText.startsWith('[Citation')) {
      parts.push(
        <span key={`cit-${keyIdx++}`} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold mx-1">
          {matchText}
        </span>
      );
    }

    lastIndex = matchIndex + matchText.length;
  });

  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  return parts;
}
