import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/integrations/supabase/server'
import { TablesInsert } from '@/integrations/supabase/types'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    let next = '/dashboard';

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // Get the current user after successful authentication
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                 // Check if user already exists in our users table
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .single()
                
                // If user doesn't exist, create them
                if (!existingUser) {
                    const newUser: TablesInsert<'users'> = {
                        id: user.id,
                        email: user.email || '',
                    }
                    
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert(newUser)
                    
                    if (insertError) {
                        console.error('Error creating user:', insertError)
                    } else {
                        console.log('User created in database')
                    }
                } else {
                    console.log('User already exists in database')
                }
            } else {
                console.error('No user found after authentication')
            }

            // Improved redirect logic for production
            const forwardedHost = request.headers.get('x-forwarded-host')
            const host = request.headers.get('host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            let redirectUrl: string
            
            if (isLocalEnv) {
                // Local development
                redirectUrl = `${origin}${next}`
            } else {
                // Production - use the actual domain
                redirectUrl = `https://www.snippetbox.net${next}`
            }
            
            console.log('Redirecting to:', redirectUrl)
            return NextResponse.redirect(redirectUrl)
        } else {
            console.error('Auth error:', error)
        }
    }

    // return the user to an error page with instructions
    console.log('No code provided or auth failed, redirecting to error page')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}