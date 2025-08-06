import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Snippet } from "@/lib/types";
import { createSnippetSchema } from "@/lib/validation";
import { getLanguageOptions, getCategoryOptions } from "@/lib/snippetOptions";

interface SnippetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (snippet: Omit<Snippet, "id" | "createdAt" | "updatedAt">) => void;
  editingSnippet?: Snippet | null;
}

export const SnippetForm = ({ open, onOpenChange, onSave, editingSnippet }: SnippetFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form fields when editingSnippet changes
  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title || "");
      setDescription(editingSnippet.description || "");
      setCode(editingSnippet.code || "");
      setLanguage(editingSnippet.language || "");
      setCategory(editingSnippet.category || "");
      setErrors({});
    } else if (open && !editingSnippet) {
      // Only reset form when opening for new snippet creation
      setTitle("");
      setDescription("");
      setCode("");
      setLanguage("");
      setCategory("");
      setErrors({});
    }
  }, [editingSnippet, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Prepare snippet data
    const snippetData = {
      title: title.trim(),
      description: description.trim() || null,
      code: code.trim(),
      language,
      category,
    };

    // Validate with Zod
    const validationResult = createSnippetSchema.safeParse(snippetData);

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    onSave(snippetData);

    // Reset form
    setTitle("");
    setDescription("");
    setCode("");
    setLanguage("");
    setCategory("");
    setErrors({});
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
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select value={language} onValueChange={setLanguage} required>
                <SelectTrigger className={errors.language ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {getLanguageOptions().map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-sm text-red-500">{errors.language}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {getCategoryOptions().map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language || 'text'}
              placeholder="Enter your code here..."
              className={`min-h-[300px] ${errors.code ? "border-red-500" : ""}`}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
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