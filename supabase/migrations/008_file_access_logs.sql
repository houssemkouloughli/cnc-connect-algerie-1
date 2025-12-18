-- Create file access logs table
CREATE TABLE IF NOT EXISTS file_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_path TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'url_generated', 'downloaded', 'viewed'
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_file_access_logs_file_path ON file_access_logs(file_path);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_user_id ON file_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_file_access_logs_created_at ON file_access_logs(created_at DESC);

-- RLS
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs" 
ON file_access_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- System can insert logs
CREATE POLICY "System can insert logs" 
ON file_access_logs FOR INSERT 
WITH CHECK (true);
