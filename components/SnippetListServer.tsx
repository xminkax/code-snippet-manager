import { createClient } from '@/integrations/supabase/server'

export async function getServerSnippets() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        return {
            snippets: [],
            isAuthenticated: false
        }
    }

    const { data: snippets, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching snippets:', error)
        return {
            snippets: [],
            isAuthenticated: true,
        }
    }

    const formattedSnippets = snippets.map(snippet => ({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        category: snippet.category,
        user_id: snippet.user_id,
        createdAt: new Date(snippet.created_at),
        updatedAt: new Date(snippet.updated_at),
    }))

    // Use a Set to merge default values with existing values from snippets
    const uniqueLanguages = new Set([...snippets.map(s => s.language)])
    const uniqueCategories = new Set([ ...snippets.map(s => s.category)])

    return {
        snippets: formattedSnippets,
        isAuthenticated: true,
        languages: ['all', ...Array.from(uniqueLanguages).sort()],
        categories: ['all', ...Array.from(uniqueCategories).sort()]
    }
}