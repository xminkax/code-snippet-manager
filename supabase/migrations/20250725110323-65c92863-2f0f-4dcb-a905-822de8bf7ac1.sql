-- Create users table
CREATE TABLE public.users (
                              id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                              email TEXT NOT NULL UNIQUE,
                              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                              updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create snippets table with user_id
CREATE TABLE public.snippets (
                                 id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                                 title TEXT NOT NULL,
                                 description TEXT,
                                 code TEXT NOT NULL,
                                 language TEXT NOT NULL,
                                 category TEXT NOT NULL,
                                 user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                                 created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for better query performance
CREATE INDEX idx_snippets_user_id ON public.snippets(user_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

-- Create policies for snippets
CREATE POLICY "Users can read their own snippets" ON public.snippets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snippets" ON public.snippets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets" ON public.snippets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets" ON public.snippets
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for users
CREATE POLICY "Users can read their own user data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own user data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create function and trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_snippets_updated_at
    BEFORE UPDATE ON public.snippets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();