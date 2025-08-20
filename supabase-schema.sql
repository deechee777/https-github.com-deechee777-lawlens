-- LawLens Database Schema
-- Run this in your Supabase SQL Editor

-- Create questions table
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    source_url TEXT,
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'researching')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    stripe_payment_id TEXT,
    stripe_customer_id TEXT,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    payment_type TEXT DEFAULT 'one_time' CHECK (payment_type IN ('one_time', 'subscription')),
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_users table for simple admin authentication
CREATE TABLE admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_public ON questions(is_public);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Add full-text search capabilities
ALTER TABLE questions ADD COLUMN search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION update_questions_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.question_text, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.answer_text, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
CREATE TRIGGER questions_search_vector_update 
    BEFORE INSERT OR UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_questions_search_vector();

-- Create GIN index for full-text search
CREATE INDEX idx_questions_search_vector ON questions USING GIN(search_vector);

-- Update existing records to populate search_vector
UPDATE questions SET question_text = question_text;

-- Create a function for advanced full-text search with ranking
CREATE OR REPLACE FUNCTION search_questions_fulltext(
    search_query text,
    result_limit integer DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    question_text TEXT,
    answer_text TEXT,
    source_url TEXT,
    is_public BOOLEAN,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        q.id,
        q.question_text,
        q.answer_text,
        q.source_url,
        q.is_public,
        q.status,
        q.created_at,
        ts_rank_cd(q.search_vector, plainto_tsquery('english', search_query)) as relevance_score
    FROM questions q
    WHERE q.is_public = true 
        AND q.status = 'answered'
        AND q.search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY relevance_score DESC, q.created_at DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
CREATE INDEX idx_payments_email ON payments(user_email);
CREATE INDEX idx_payments_question_id ON payments(question_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public can read public questions
CREATE POLICY "Public questions are viewable by everyone" 
ON questions FOR SELECT 
USING (is_public = true);

-- Admin can do everything on questions (you'll need to set up proper admin auth)
CREATE POLICY "Admin full access to questions" 
ON questions FOR ALL 
USING (auth.jwt() ->> 'email' = 'your_admin_email@example.com');

-- Users can view their own payments
CREATE POLICY "Users can view own payments" 
ON payments FOR SELECT 
USING (auth.jwt() ->> 'email' = user_email);

-- Admin can view all payments
CREATE POLICY "Admin can view all payments" 
ON payments FOR ALL 
USING (auth.jwt() ->> 'email' = 'your_admin_email@example.com');

-- Only admin can access admin_users table
CREATE POLICY "Only admin can access admin_users" 
ON admin_users FOR ALL 
USING (auth.jwt() ->> 'email' = 'your_admin_email@example.com');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample questions for testing
INSERT INTO questions (question_text, answer_text, source_url, is_public, status) VALUES
(
    'Is it illegal to carry an ice cream cone in your back pocket in Alabama?',
    'This is actually a myth! While there are various claims about this law online, there is no evidence of any Alabama state law or municipal ordinance that specifically prohibits carrying ice cream cones in back pockets. This appears to be an urban legend that has persisted on the internet.',
    'https://www.alabama.gov/portal/secondary.jsp?page=Laws',
    true,
    'answered'
),
(
    'Can I legally own a pet monkey in New York City?',
    'No, it is illegal to own a monkey as a pet in New York City. According to NYC Health Code Article 161.01, it is prohibited to possess, sell, or import non-human primates within the five boroughs. This includes all species of monkeys, apes, and lemurs. Violations can result in fines and the animal being confiscated.',
    'https://www1.nyc.gov/site/doh/about/press/pr2021/health-department-issues-reminder-about-illegal-pets.page',
    true,
    'answered'
),
(
    'What are the weird parking laws in San Francisco?',
    'San Francisco has several unique parking regulations: 1) You must curb your wheels when parking on hills with grades over 3% (facing uphill, turn wheels away from curb; downhill, turn toward curb). 2) Street sweeping is strictly enforced with $76+ tickets. 3) You cannot park within 3 feet of a sidewalk ramp used for wheelchair access. 4) Parking is prohibited on certain streets during commute hours (typically 7-9 AM and 4-6 PM on weekdays).',
    'https://www.sfmta.com/getting-around/drive-park/how-park-legally',
    true,
    'answered'
);

-- Create bad_decisions table for calculator analytics
CREATE TABLE bad_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    decision_text TEXT NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    ai_explanation TEXT NOT NULL,
    share_slug TEXT UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_bad_decisions_share_slug ON bad_decisions(share_slug);
CREATE INDEX idx_bad_decisions_created_at ON bad_decisions(created_at DESC);
CREATE INDEX idx_bad_decisions_risk_score ON bad_decisions(risk_score);

-- Enable Row Level Security
ALTER TABLE bad_decisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - allow public read access for shared results
CREATE POLICY "Bad decisions are publicly readable via share_slug" 
ON bad_decisions FOR SELECT 
USING (share_slug IS NOT NULL);

-- Admin can view all bad decisions for analytics
CREATE POLICY "Admin can view all bad decisions" 
ON bad_decisions FOR ALL 
USING (auth.jwt() ->> 'email' = 'your_admin_email@example.com');

-- Insert admin user (you'll need to hash the password properly in your application)
-- This is just a placeholder - implement proper password hashing in your app
INSERT INTO admin_users (email, password_hash) VALUES
('your_admin_email@example.com', 'hashed_password_here');