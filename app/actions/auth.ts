
'use server'

import { createClient } from '@/integrations/supabase/server'
import { cookies } from 'next/headers'

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.url) {
        return { url: data.url }
    }

    return { error: 'No URL returned from Supabase' }
}