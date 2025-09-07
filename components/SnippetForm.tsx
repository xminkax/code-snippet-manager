import { useState, useEffect, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Snippet } from "@/lib/types";
import { createSnippetSchema } from "@/lib/validation";
import { getLanguageOptions, getCategoryOptions } from "@/lib/snippetOptions";
import { createSnippet, updateSnippet } from "@/app/actions/snippets";
import { useToast } from "@/hooks/use-toast";

interface SnippetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSnippet?: Snippet | null;
}

export const SnippetForm = ({ open, onOpenChange, editingSnippet }: SnippetFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

  const handleSubmit = async (formData: FormData) => {
    // Clear previous errors
    setErrors({});

    startTransition(async () => {
      try {
        let result;
        
        if (editingSnippet) {
          // Add the snippet ID to the form data for updates
          formData.append('id', editingSnippet.id);
          result = await updateSnippet(formData);
        } else {
          result = await createSnippet(formData);
        }

        if (result?.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

        // Success
        toast({
          title: editingSnippet ? "Snippet updated" : "Snippet created",
          description: editingSnippet 
            ? "Your code snippet has been updated successfully."
            : "Your new code snippet has been saved.",
        });

        // Reset form and close dialog
        setTitle("");
        setDescription("");
        setCode("");
        setLanguage("");
        setCategory("");
        setErrors({});
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving snippet:', error);
        toast({
          title: "Error",
          description: "Failed to save snippet. Please try again.",
          variant: "destructive",
        });
      }
    });
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
        
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
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
              <Select name="language" value={language} onValueChange={setLanguage} required>
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
            <Select name="category" value={category} onValueChange={setCategory} required>
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
              name="description"
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
            <input type="hidden" name="code" value={code} />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving..." : (editingSnippet ? "Update Snippet" : "Create Snippet")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};