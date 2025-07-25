import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Code, Filter, Loader2 } from "lucide-react";
import { SnippetCard, Snippet } from "./SnippetCard";
import { SnippetForm } from "./SnippetForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SnippetManager = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch snippets from Supabase on component mount
  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSnippets: Snippet[] = data.map(snippet => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        category: snippet.category,
        createdAt: new Date(snippet.created_at),
        updatedAt: new Date(snippet.updated_at),
      }));

      setSnippets(formattedSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast({
        title: "Error",
        description: "Failed to load snippets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (snippetData: Omit<Snippet, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingSnippet) {
        // Update existing snippet
        const { error } = await supabase
          .from('snippets')
          .update({
            title: snippetData.title,
            description: snippetData.description,
            code: snippetData.code,
            language: snippetData.language,
            category: snippetData.category,
          })
          .eq('id', editingSnippet.id);

        if (error) throw error;

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
        const { data, error } = await supabase
          .from('snippets')
          .insert([{
            title: snippetData.title,
            description: snippetData.description,
            code: snippetData.code,
            language: snippetData.language,
            category: snippetData.category,
          }])
          .select()
          .single();

        if (error) throw error;

        const newSnippet: Snippet = {
          id: data.id,
          title: data.title,
          description: data.description,
          code: data.code,
          language: data.language,
          category: data.category,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setSnippets(prev => [newSnippet, ...prev]);
        toast({
          title: "Snippet created",
          description: "Your new code snippet has been saved.",
        });
      }
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast({
        title: "Error",
        description: "Failed to save snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('snippets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSnippets(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Snippet deleted",
        description: "The code snippet has been removed.",
      });
    } catch (error) {
      console.error('Error deleting snippet:', error);
      toast({
        title: "Error",
        description: "Failed to delete snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewSnippet = () => {
    setEditingSnippet(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 grid-pattern relative">
      <div className="scan-line"></div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-neon rounded border-2 border-primary flex items-center justify-center relative">
              <Code className="h-6 w-6 text-primary-foreground" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }} />
              <div className="absolute inset-0 bg-gradient-neon rounded opacity-50 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold retro-title bg-gradient-retro bg-clip-text text-transparent">
                &gt; CODE_SNIPPETS.EXE
              </h1>
              <p className="retro-subtitle text-secondary">
                [TERMINAL MODE] - Organize and access your code snippets
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button onClick={handleNewSnippet} className="retro-button gap-2 font-terminal text-sm">
              <Plus className="h-4 w-4" />
              [NEW_SNIPPET.CMD]
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }} />
                <Input
                  placeholder="> SEARCH_QUERY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="retro-input pl-9 font-terminal"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="retro-input w-[160px] font-terminal">
                    <Filter className="h-4 w-4 mr-2 text-accent" style={{ filter: 'drop-shadow(0 0 3px currentColor)' }} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="retro-card font-terminal">
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang} className="font-terminal">
                        {lang === "all" ? "[ALL_LANG]" : `[${lang.toUpperCase()}]`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="retro-input w-[160px] font-terminal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="retro-card font-terminal">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-terminal">
                        {cat === "all" ? "[ALL_CAT]" : `[${cat.toUpperCase()}]`}
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
          <div className="retro-card p-4 border-primary">
            <div className="text-3xl font-bold text-primary font-terminal" style={{ textShadow: '0 0 10px currentColor' }}>{snippets.length}</div>
            <div className="text-sm text-secondary font-terminal uppercase tracking-wider">&gt; Total_Snippets</div>
          </div>
          <div className="retro-card p-4 border-secondary">
            <div className="text-3xl font-bold text-secondary font-terminal" style={{ textShadow: '0 0 10px currentColor' }}>{languages.length - 1}</div>
            <div className="text-sm text-accent font-terminal uppercase tracking-wider">&gt; Languages</div>
          </div>
          <div className="retro-card p-4 border-accent">
            <div className="text-3xl font-bold text-accent font-terminal" style={{ textShadow: '0 0 10px currentColor' }}>{categories.length - 1}</div>
            <div className="text-sm text-primary font-terminal uppercase tracking-wider">&gt; Categories</div>
          </div>
        </div>

        {/* Snippets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
            <h3 className="text-lg font-semibold text-primary mb-2 font-terminal uppercase tracking-wider">[LOADING_SNIPPETS.EXE]</h3>
            <p className="text-secondary font-terminal">Please wait while we fetch your code snippets...</p>
          </div>
        ) : filteredSnippets.length === 0 ? (
          <div className="text-center py-12">
            <Code className="h-12 w-12 text-primary mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 10px currentColor)' }} />
            <h3 className="text-lg font-semibold text-primary mb-2 font-terminal uppercase tracking-wider">
              {searchTerm || selectedLanguage !== "all" || selectedCategory !== "all" 
                ? "[NO_MATCH_FOUND]" 
                : "[EMPTY_DATABASE]"}
            </h3>
            <p className="text-secondary mb-4 font-terminal">
              {searchTerm || selectedLanguage !== "all" || selectedCategory !== "all"
                ? "> Try adjusting your search parameters"
                : "> Initialize database with first code snippet"}
            </p>
            {(!searchTerm && selectedLanguage === "all" && selectedCategory === "all") && (
              <Button onClick={handleNewSnippet} className="retro-button gap-2 font-terminal">
                <Plus className="h-4 w-4" />
                [CREATE_FIRST.CMD]
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