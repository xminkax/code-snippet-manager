import {useState} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Copy, Edit, Trash2, Check} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {Snippet} from "@/lib/types";

interface SnippetCardProps {
    snippet: Snippet;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
}

export const SnippetCard = ({snippet, onEdit, onDelete}: SnippetCardProps) => {
    const [copied, setCopied] = useState(false);
    const {toast} = useToast();

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
        <Card
            className="bg-gradient-card border-border shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
                            {snippet.title}
                        </h3>
                        {snippet.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {snippet.description}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs font-medium">
                            {snippet.language}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {snippet.category}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="relative">
                    <SyntaxHighlighter
                        language={snippet.language.toLowerCase()}
                        style={oneDark}
                        customStyle={{
                            margin: 0,
                            borderRadius: 'var(--radius)',
                            background: 'hsl(var(--code-bg))',
                            border: '1px solid hsl(var(--code-border))',
                            fontSize: '0.875rem',
                            maxHeight: '200px',
                            overflow: 'auto',
                        }}
                        codeTagProps={{
                            style: {
                                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                            }
                        }}
                    >
                        {snippet.code}
                    </SyntaxHighlighter>

                    <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={copyToClipboard}
                    >
                        {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                    </Button>
                </div>
            </CardContent>

            <CardFooter className="pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
                    {snippet.updatedAt
                        ? new Date(snippet.updatedAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit"})
                        : ""}
        </span>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(snippet)}
                        className="h-8 w-8 p-0 hover:bg-secondary"
                    >
                        <Edit className="h-4 w-4"/>
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(snippet.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};