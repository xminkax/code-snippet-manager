// app/page.tsx
import { getServerSnippets } from '@/components/SnippetListServer'
import { SnippetManager } from '@/components/SnippetManager'

export default async function HomePage() {
    const { snippets, isAuthenticated, languages, categories } = await getServerSnippets();
    console.log(languages);
    return (
        <SnippetManager
            initialSnippets={snippets}
            isAuthenticated={isAuthenticated}
            initialLanguages={languages}
            initialCategories={categories}
        />
    )
}