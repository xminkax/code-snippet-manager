
"use client";
import { SnippetManager } from "@/components/SnippetManager";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/use-auth";
import { Code, Sparkles, Zap } from "lucide-react";

export default function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full max-w-md space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                <Code className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Code Snippet Manager
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Organize, share, and manage your code snippets with ease
                        </p>
                    </div>

                    {/* Features Card */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-xl">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-1 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <span>Syntax highlighting for 100+ languages</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-1 rounded-md bg-gradient-to-r from-green-400 to-blue-500">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <span>Fast search and organization</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="p-1 rounded-md bg-gradient-to-r from-purple-400 to-pink-500">
                                    <Code className="h-4 w-4 text-white" />
                                </div>
                                <span>Share snippets with your team</span>
                            </div>
                        </div>
                    </div>

                    {/* Sign in section */}
                    <div className="space-y-4 pt-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Sign in to start managing your code snippets
                            </p>
                        </div>
                        <div className="p-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                            <GoogleSignInButton className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white border-0" />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-6">
                        <p className="text-xs text-muted-foreground">
                            Secure authentication powered by Google
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <SnippetManager />;
}