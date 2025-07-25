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
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
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
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onScroll={handleScroll}
        placeholder={placeholder}
        className={cn(
          "relative w-full resize-none bg-transparent p-3 text-transparent caret-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "font-mono text-sm leading-6 min-h-[300px]",
          "selection:bg-primary/20"
        )}
        style={{ 
          zIndex: 2,
          color: isFocused ? 'hsl(var(--foreground))' : 'transparent',
          caretColor: 'hsl(var(--foreground))',
        }}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};