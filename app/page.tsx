
"use client";
import { SnippetManager } from "@/components/SnippetManager";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md space-y-4">
                    <h1 className="text-2xl font-bold text-center">Welcome</h1>
                    <p className="text-center text-muted-foreground mb-4">
                        Please sign in to continue
                    </p>
                    <GoogleSignInButton />
                </div>
            </div>
        );
    }

    return <SnippetManager />;
}