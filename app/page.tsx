// app/page.tsx
import { getServerSnippets } from '@/components/SnippetListServer'
import { SnippetManager } from '@/components/SnippetManager'

export default async function HomePage() {
    const { snippets, isAuthenticated } = await getServerSnippets();

    return (
        <SnippetManager 
            initialSnippets={snippets} 
            isAuthenticated={isAuthenticated} 
        />
    )
}