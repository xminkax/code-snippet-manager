'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';

export default function AuthCallback() {
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      debugger;
      if (authError) {
        console.error('Auth error:', authError);
        router.push('/');
        return;
      }

      if (session?.user) {
        // Check if user exists in our users table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select()
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          // Create new user in our users table
          debugger;
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
              }
            ]);

          if (insertError) {
            console.error('Error creating user:', insertError);
          }
        }

        // Redirect to dashboard after successful auth and user creation
        router.push('/dashboard');
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Finalizing Login...</h2>
        <p className="text-muted-foreground">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}