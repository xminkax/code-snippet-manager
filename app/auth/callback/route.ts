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
                    }
                }
            }
            
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}