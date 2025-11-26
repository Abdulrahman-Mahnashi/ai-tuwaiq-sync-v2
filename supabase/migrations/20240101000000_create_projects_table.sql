-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bootcamp TEXT,
    technologies TEXT[],
    team_members TEXT[],
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    similarity_score FLOAT,
    keywords TEXT[],
    full_text_search TSVECTOR
);

-- Create index for full text search
CREATE INDEX IF NOT EXISTS projects_full_text_search_idx ON public.projects USING GIN (full_text_search);

-- Create index for similarity search
CREATE INDEX IF NOT EXISTS projects_similarity_idx ON public.projects (similarity_score);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update full_text_search
CREATE OR REPLACE FUNCTION update_projects_full_text_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_text_search := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.bootcamp::text, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update full_text_search
CREATE TRIGGER update_projects_full_text_search_trigger
    BEFORE INSERT OR UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_projects_full_text_search();

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on projects" ON public.projects
    FOR ALL USING (true) WITH CHECK (true);

-- Create similarity_results table to store comparison results
CREATE TABLE IF NOT EXISTS public.similarity_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    input_idea TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    similarity_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS similarity_results_project_id_idx ON public.similarity_results (project_id);
CREATE INDEX IF NOT EXISTS similarity_results_score_idx ON public.similarity_results (similarity_score DESC);

-- Enable Row Level Security for similarity_results
ALTER TABLE public.similarity_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on similarity_results" ON public.similarity_results
    FOR ALL USING (true) WITH CHECK (true);

