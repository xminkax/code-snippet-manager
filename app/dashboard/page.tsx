// app/page.tsx
import { getServerSnippets } from '@/components/SnippetListServer'
import { SnippetManager } from '@/components/SnippetManager'
import { Snippet } from '@/lib/types';

export default async function HomePage() {
    const { snippets, isAuthenticated, languages, categories } = await getServerSnippets();
    console.log(languages);
    return (
        <SnippetManager
            initialSnippets={snippets as Snippet[]}
            isAuthenticated={isAuthenticated}
            initialLanguages={languages || []}
            initialCategories={categories || []}
        />
    )
}