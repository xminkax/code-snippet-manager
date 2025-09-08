"use client"
import { useState, useMemo, useTransition, useOptimistic } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Code, Filter } from "lucide-react";
import { SnippetCard } from "./SnippetCard";
import { SnippetForm } from "./SnippetForm";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/integrations/supabase/client";
import { Snippet } from "@/lib/types";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { deleteSnippet, createSnippet, updateSnippet } from "@/app/actions/snippets";

interface SnippetManagerProps {
    initialSnippets: Snippet[];
    isAuthenticated: boolean;
    initialLanguages: string[];
    initialCategories: string[];
}

type OptimisticAction = 
  | { type: 'add'; snippet: Snippet }
  | { type: 'update'; snippet: Snippet }
  | { type: 'delete'; id: string };

export const SnippetManager = ({
    initialSnippets,
    isAuthenticated,
    initialLanguages,
    initialCategories
}: SnippetManagerProps) => {
    const supabase = createClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const languages = initialLanguages;
    const categories = initialCategories;
    const router = useRouter();

    // useOptimistic for managing optimistic updates
    const [optimisticSnippets, addOptimisticAction] = useOptimistic(
        initialSnippets,
        (state: Snippet[], action: OptimisticAction) => {
            switch (action.type) {
                case 'add':
                    return [action.snippet, ...state];
                case 'update':
                    return state.map(snippet => 
                        snippet.id === action.snippet.id ? action.snippet : snippet
                    );
                case 'delete':
                    return state.filter(snippet => snippet.id !== action.id);
                default:
                    return state;
            }
        }
    );

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
            return;
        }
        toast({ title: "Logged out" });
        router.push("/");
        router.refresh();
    };

    const filteredSnippets = useMemo(() => {
        return optimisticSnippets.filter(snippet => {
            const matchesSearch = searchTerm === "" ||
                snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                snippet.code.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesLanguage = selectedLanguage === "all" || snippet.language === selectedLanguage;
            const matchesCategory = selectedCategory === "all" || snippet.category === selectedCategory;

            return matchesSearch && matchesLanguage && matchesCategory;
        });
    }, [optimisticSnippets, searchTerm, selectedLanguage, selectedCategory]);

    const handleCreateSnippet = async (formData: FormData) => {
        const tempId = crypto.randomUUID();
        const optimisticSnippet: Snippet = {
            id: tempId,
            title: formData.get('title') as string,
            description: formData.get('description') as string || null,
            code: formData.get('code') as string,
            language: formData.get('language') as string,
            category: formData.get('category') as string,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Optimistically add the snippet
        addOptimisticAction({ type: 'add', snippet: optimisticSnippet });

        try {
            const result = await createSnippet(formData);
            if (result?.error) {
                throw new Error(result.error);
            }
            
            toast({
                title: "Snippet created",
                description: "Your new code snippet has been saved.",
            });
            
            return { success: true };
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create snippet",
                variant: "destructive",
            });
            throw error; // This will cause the optimistic update to rollback
        }
    };

    const handleUpdateSnippet = async (formData: FormData, snippet: Snippet) => {
        const optimisticSnippet: Snippet = {
            ...snippet,
            title: formData.get('title') as string,
            description: formData.get('description') as string || null,
            code: formData.get('code') as string,
            language: formData.get('language') as string,
            category: formData.get('category') as string,
            updatedAt: new Date().toISOString(),
        };

        // Optimistically update the snippet
        addOptimisticAction({ type: 'update', snippet: optimisticSnippet });

        try {
            formData.append('id', snippet.id);
            const result = await updateSnippet(formData);
            if (result?.error) {
                throw new Error(result.error);
            }
            
            toast({
                title: "Snippet updated",
                description: "Your code snippet has been updated successfully.",
            });
            
            return { success: true };
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update snippet",
                variant: "destructive",
            });
            throw error; // This will cause the optimistic update to rollback
        }
    };

    const handleEdit = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        // Optimistically remove the snippet
        addOptimisticAction({ type: 'delete', id });

        startTransition(async () => {
            try {
                const result = await deleteSnippet(id);
                
                if (result?.error) {
                    throw new Error(result.error);
                }

                toast({
                    title: "Snippet deleted",
                    description: "The code snippet has been removed.",
                });
            } catch (error) {
                console.error('Error deleting snippet:', error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to delete snippet",
                    variant: "destructive",
                });
                // Note: The optimistic update will automatically rollback on error
            }
        });
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
            {isAuthenticated && (
                <div className="fixed top-4 right-4 z-50">
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            )}

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
                                <Select name="language" value={selectedLanguage} onValueChange={setSelectedLanguage}>
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

                                <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory}>
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
                        <div className="text-2xl font-bold text-card-foreground">{optimisticSnippets.length}</div>
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
                    editingSnippet={editingSnippet}
                    onCreateSnippet={handleCreateSnippet}
                    onUpdateSnippet={handleUpdateSnippet}
                />
            </div>
        </div>
    );
};