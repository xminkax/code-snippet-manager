export interface Snippet {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}