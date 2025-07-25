import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Snippet } from "./SnippetCard";

interface SnippetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (snippet: Omit<Snippet, "id" | "createdAt" | "updatedAt">) => void;
  editingSnippet?: Snippet | null;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'php',
  'ruby', 'swift', 'kotlin', 'dart', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
  'scss', 'json', 'xml', 'yaml', 'bash', 'powershell', 'dockerfile', 'nginx'
];

const CATEGORIES = [
  'Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Desktop', 'Algorithm',
  'Data Structure', 'Utility', 'Configuration', 'Testing', 'Documentation'
];

export const SnippetForm = ({ open, onOpenChange, onSave, editingSnippet }: SnippetFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");

  // Update form fields when editingSnippet changes
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title || "");
      setDescription(editingSnippet.description || "");
      setCode(editingSnippet.code || "");
      setLanguage(editingSnippet.language || "");
      setCategory(editingSnippet.category || "");
    } else if (open && !editingSnippet) {
      // Only reset form when opening for new snippet creation
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("");
      setCategory("");
    }
  }, [editingSnippet, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !language || !category) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      code: code.trim(),
      language,
      category,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("");
    setCategory("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
            {editingSnippet ? "Edit Snippet" : "Create New Snippet"}
          </DialogTitle>
          <DialogDescription>
            {editingSnippet ? "Update your existing code snippet." : "Create a new code snippet to save for later use."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter snippet title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select value={language} onValueChange={setLanguage} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language || 'text'}
              placeholder="Enter your code here..."
              className="min-h-[300px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingSnippet ? "Update Snippet" : "Create Snippet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};