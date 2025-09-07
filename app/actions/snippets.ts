'use server'

import { createClient } from '@/integrations/supabase/server'
import { createSnippetSchema, updateSnippetSchema } from '@/lib/validation'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSnippet(formData: FormData) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    return { error: 'You must be logged in to create snippets.' }
  }

  // Extract form data
  const snippetData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    code: formData.get('code') as string,
    language: formData.get('language') as string,
    category: formData.get('category') as string,
  }

  // Validate the data
  const validationResult = createSnippetSchema.safeParse(snippetData)
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message).join(', ')
    return { error: `Validation Error: ${errors}` }
  }

  try {
    const { data, error } = await supabase
      .from('snippets')
      .insert([{
        ...snippetData,
        user_id: session.user.id,
      }])
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidate the dashboard page to show the new snippet
    revalidatePath('/dashboard')
    
    return { success: true, data }
  } catch (error) {
    console.error('Error creating snippet:', error)
    return { error: 'Failed to create snippet. Please try again.' }
  }
}

export async function updateSnippet(formData: FormData) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    return { error: 'You must be logged in to update snippets.' }
  }

  const snippetId = formData.get('id') as string
  if (!snippetId) {
    return { error: 'Snippet ID is required for updates.' }
  }

  // Extract form data
  const snippetData = {
    id: snippetId,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    code: formData.get('code') as string,
    language: formData.get('language') as string,
    category: formData.get('category') as string,
  };

  console.log('updating snippet:', snippetData);

  // Validate the data
  const validationResult = updateSnippetSchema.safeParse(snippetData)
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message).join(', ')
    return { error: `Validation Error: ${errors}` }
  }

  try {
    const { error } = await supabase
      .from('snippets')
      .update({
        title: snippetData.title,
        description: snippetData.description,
        code: snippetData.code,
        language: snippetData.language,
        category: snippetData.category,
      })
      .eq('id', snippetId)
      .eq('user_id', session.user.id) // Ensure user can only update their own snippets

    if (error) {
      return { error: error.message }
    }

    // Revalidate the dashboard page to show the updated snippet
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating snippet:', error)
    return { error: 'Failed to update snippet. Please try again.' }
  }
}

export async function deleteSnippet(snippetId: string) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.id) {
    return { error: 'You must be logged in to delete snippets.' }
  }

  if (!snippetId) {
    return { error: 'Snippet ID is required for deletion.' }
  }

  try {
    const { error } = await supabase
      .from('snippets')
      .delete()
      .eq('id', snippetId)
      .eq('user_id', session.user.id) // Ensure user can only delete their own snippets

    if (error) {
      return { error: error.message }
    }

    // Revalidate the dashboard page to remove the deleted snippet
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return { error: 'Failed to delete snippet. Please try again.' }
  }
}
