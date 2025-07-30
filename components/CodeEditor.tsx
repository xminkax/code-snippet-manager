import { useState, useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  className?: string;
}

export const CodeEditor = ({ value, onChange, language, placeholder = "Enter your code here...", className }: CodeEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea and highlighter
  const handleScroll = () => {
    if (textareaRef.current && highlighterRef.current) {
      const textarea = textareaRef.current;
      const highlighter = highlighterRef.current.querySelector('pre');
      if (highlighter) {
        highlighter.scrollTop = textarea.scrollTop;
        highlighter.scrollLeft = textarea.scrollLeft;
      }
    }
  };

  // Handle tab key to insert tabs instead of changing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabChar = '  '; // 2 spaces instead of tab for better compatibility

      // Insert tab at cursor position
      const newValue = value.substring(0, start) + tabChar + value.substring(end);
      onChange(newValue);

      // Move cursor to after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabChar.length;
      }, 0);
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(300, textareaRef.current.scrollHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  return (
    <div className={cn("relative border border-input rounded-md overflow-hidden", className)}>
      {/* Syntax highlighter background */}
      <div 
        ref={highlighterRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        <SyntaxHighlighter
          language={language.toLowerCase() || 'text'}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '12px',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            lineHeight: '1.5',
            minHeight: '300px',
            overflow: 'hidden',
            whiteSpace: 'pre',
            wordWrap: 'normal',
            tabSize: 2,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '1.5',
            }
          }}
        >
          {value || ' '}
        </SyntaxHighlighter>
      </div>

      {/* Editable textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onScroll={handleScroll}
        placeholder={placeholder}
        className={cn(
          "relative w-full resize-none bg-transparent min-h-[300px]",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "placeholder:text-muted-foreground"
        )}
        style={{ 
          zIndex: 2,
          color: 'transparent',
          caretColor: 'hsl(var(--foreground))',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '12px',
          margin: 0,
          border: 'none',
          whiteSpace: 'pre',
          wordWrap: 'normal',
          tabSize: 2,
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};