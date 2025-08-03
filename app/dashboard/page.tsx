// "use client"
// import { SnippetManager } from "@/components/SnippetManager";
// import {createServerSupabaseClient} from "@/integrations/supabase/client";
import { createClient } from '@/integrations/supabase/server'

export default async function DashboardPage() {
    const supabase = await createClient();

    const session = await supabase.auth.getUser();
    console.log(session);
    return <div>lala</div>
}