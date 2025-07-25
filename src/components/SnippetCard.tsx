import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Edit, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Snippet {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export const SnippetCard = ({ snippet, onEdit, onDelete }: SnippetCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Code snippet copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy snippet to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="retro-card group relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-gradient-neon"></div>
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-terminal text-lg text-primary font-bold truncate group-hover:text-secondary transition-colors uppercase tracking-wide">
              &gt; {snippet.title}.exe
            </h3>
            {snippet.description && (
              <p className="text-sm text-secondary mt-1 line-clamp-2 font-terminal">
                // {snippet.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs font-terminal uppercase tracking-wider bg-primary text-primary-foreground border-primary">
              [{snippet.language}]
            </Badge>
            <Badge variant="outline" className="text-xs font-terminal uppercase tracking-wider border-accent text-accent">
              [{snippet.category}]
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 relative z-10">
        <div className="relative">
          <SyntaxHighlighter
            language={snippet.language.toLowerCase()}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: 'var(--radius)',
              background: 'hsl(var(--code-bg))',
              border: '2px solid hsl(var(--code-border))',
              fontSize: '0.875rem',
              maxHeight: '200px',
              overflow: 'auto',
              boxShadow: 'inset 0 0 10px hsl(var(--primary) / 0.2)',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'VT323, Courier New, monospace',
                fontSize: '1rem',
              }
            }}
          >
            {snippet.code}
          </SyntaxHighlighter>
          
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity retro-button text-xs font-terminal"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center relative z-10">
        <span className="text-xs text-secondary font-terminal uppercase tracking-wider">
          &gt; {snippet.updatedAt.toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(snippet)}
            className="h-8 w-8 p-0 hover:bg-secondary hover:text-secondary-foreground transition-all hover:shadow-cyan border border-transparent hover:border-secondary"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(snippet.id)}
            className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all hover:shadow-yellow border border-transparent hover:border-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};