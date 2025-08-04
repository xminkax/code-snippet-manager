import { z } from "zod";

// Schema for creating a new snippet (without id, createdAt, updatedAt)
export const createSnippetSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .nullable()
    .optional(),
  code: z.string()
    .min(1, "Code is required")
    .max(10000, "Code must be less than 10,000 characters"),
  language: z.string()
    .min(1, "Language is required")
    .max(50, "Language must be less than 50 characters"),
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
});

// Schema for updating a snippet
export const updateSnippetSchema = createSnippetSchema.partial().extend({
  id: z.string().uuid("Invalid snippet ID"),
});

// Type inference from the schema
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>; 