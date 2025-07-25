import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Code, Filter } from "lucide-react";
import { SnippetCard, Snippet } from "./SnippetCard";
import { SnippetForm } from "./SnippetForm";
import { useToast } from "@/hooks/use-toast";

// Sample data
const SAMPLE_SNIPPETS: Snippet[] = [
  {
    id: "1",
    title: "React useState Hook",
    description: "Basic useState hook example with counter",
    code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
    language: "javascript",
    category: "Frontend",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Python List Comprehension",
    description: "Filter and transform lists efficiently",
    code: `# Filter even numbers and square them
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squared_evens = [x**2 for x in numbers if x % 2 == 0]
print(squared_evens)  # [4, 16, 36, 64, 100]

# Create dictionary from two lists
keys = ['a', 'b', 'c']
values = [1, 2, 3]
result = {k: v for k, v in zip(keys, values)}`,
    language: "python",
    category: "Algorithm",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    title: "CSS Flexbox Center",
    description: "Perfect centering with flexbox",
    code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.centered-content {
  /* Your content styles */
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
    language: "css",
    category: "Frontend",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
];

export const SnippetManager = () => {
  const [snippets, setSnippets] = useState<Snippet[]>(SAMPLE_SNIPPETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const { toast } = useToast();

  const languages = useMemo(() => {
    const langs = Array.from(new Set(snippets.map(s => s.language))).sort();
    return ["all", ...langs];
  }, [snippets]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(snippets.map(s => s.category))).sort();
    return ["all", ...cats];
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    return snippets.filter(snippet => {
      const matchesSearch = searchTerm === "" || 
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
      const matchesCategory = selectedCategory === "all" || snippet.category === selectedCategory;
      
      return matchesSearch && matchesLanguage && matchesCategory;
    });
  }, [snippets, searchTerm, selectedLanguage, selectedCategory]);

  const handleSave = (snippetData: Omit<Snippet, "id" | "createdAt" | "updatedAt">) => {
    if (editingSnippet) {
      // Update existing snippet
      setSnippets(prev => prev.map(s => 
        s.id === editingSnippet.id 
          ? { ...s, ...snippetData, updatedAt: new Date() }
          : s
      ));
      toast({
        title: "Snippet updated",
        description: "Your code snippet has been updated successfully.",
      });
      setEditingSnippet(null);
    } else {
      // Create new snippet
      const newSnippet: Snippet = {
        id: Date.now().toString(),
        ...snippetData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSnippets(prev => [newSnippet, ...prev]);
      toast({
        title: "Snippet created",
        description: "Your new code snippet has been saved.",
      });
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Snippet deleted",
      description: "The code snippet has been removed.",
    });
  };

  const handleNewSnippet = () => {
    setEditingSnippet(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Code Snippet Manager
              </h1>
              <p className="text-muted-foreground">
                Organize and access your code snippets efficiently
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button onClick={handleNewSnippet} className="gap-2">
              <Plus className="h-4 w-4" />
              New Snippet
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search snippets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang === "all" ? "All Languages" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-card-foreground">{snippets.length}</div>
            <div className="text-sm text-muted-foreground">Total Snippets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-card-foreground">{languages.length - 1}</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-card-foreground">{categories.length - 1}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>

        {/* Snippets Grid */}
        {filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {searchTerm || selectedLanguage !== "all" || selectedCategory !== "all" 
                ? "No snippets found" 
                : "No snippets yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedLanguage !== "all" || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first code snippet to get started"}
            </p>
            {(!searchTerm && selectedLanguage === "all" && selectedCategory === "all") && (
              <Button onClick={handleNewSnippet} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Snippet
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSnippets.map(snippet => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <SnippetForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSave={handleSave}
          editingSnippet={editingSnippet}
        />
      </div>
    </div>
  );
};