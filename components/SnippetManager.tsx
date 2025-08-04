"use client"
import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Plus, Search, Code, Filter} from "lucide-react";
import {SnippetCard} from "./SnippetCard";
import {SnippetForm} from "./SnippetForm";
import {useToast} from "@/hooks/use-toast";
import {createClient} from "@/integrations/supabase/client";
import { Snippet } from "@/lib/types";
import { createSnippetSchema, updateSnippetSchema, CreateSnippetInput } from "@/lib/validation";

interface SnippetManagerProps {
    initialSnippets: Snippet[];
    isAuthenticated: boolean;
    initialLanguages: string[];
    initialCategories: string[];
}

export const SnippetManager = ({
                                   initialSnippets,
                                   isAuthenticated,
                                   initialLanguages,
                                   initialCategories
                               }: SnippetManagerProps) => {
    const supabase = createClient();
    const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const {toast} = useToast();

    const languages = initialLanguages;
    const categories = initialCategories;

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
            // Validate snippet data with Zod
            const validationResult = editingSnippet 
                ? updateSnippetSchema.safeParse({ ...snippetData, id: editingSnippet.id })
                : createSnippetSchema.safeParse(snippetData);

            if (!validationResult.success) {
                const errors = validationResult.error.errors.map(err => err.message).join(', ');
                toast({
                    title: "Validation Error",
                    description: errors,
                    variant: "destructive",
                });
                return;
            }

            const {data: {session}} = await supabase.auth.getSession();
            if (!session?.user?.id) {
                toast({
                    title: "Error",
                    description: "You must be logged in to save snippets.",
                    variant: "destructive",
                });
                return;
            }

            if (editingSnippet) {
                const {error} = await supabase
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
                        ? {...s, ...snippetData, updatedAt: new Date().toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit"})}
                        : s
                ));
                toast({
                    title: "Snippet updated",
                    description: "Your code snippet has been updated successfully.",
                });
                setEditingSnippet(null);
            } else {
                const {data, error} = await supabase
                    .from('snippets')
                    .insert([{
                        title: snippetData.title,
                        description: snippetData.description,
                        code: snippetData.code,
                        language: snippetData.language,
                        category: snippetData.category,
                        user_id: session.user.id,
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
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                
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
            const {error} = await supabase
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

    const EmptyState = () => (
        <div className="text-center py-12">
            <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
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
                <Button
                    onClick={handleNewSnippet}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                    <Plus className="h-4 w-4"/>
                    Create First Snippet
                </Button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Code className="h-5 w-5 text-primary-foreground"/>
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
                        <Button
                            onClick={handleNewSnippet}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            <Plus className="h-4 w-4"/>
                            New Snippet
                        </Button>

                        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                            <div className="relative flex-1 max-w-md">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
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
                                        <SelectValue defaultValue="all">
                                            {selectedLanguage === "all" ? "All Languages" : selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                                        </SelectValue>
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
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue defaultValue="all">
                                            {selectedCategory === "all" ? "All Categories" : selectedCategory}
                                        </SelectValue>

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
                    <EmptyState/>
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