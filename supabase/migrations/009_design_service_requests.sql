-- Add needs_design flag to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS needs_design BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS design_notes TEXT;

-- Create design_service_requests table for admin tracking
CREATE TABLE IF NOT EXISTS design_service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'jpg', 'png', 'pdf'
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_design_requests_quote_id ON design_service_requests(quote_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_client_id ON design_service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_design_requests_status ON design_service_requests(status);

-- RLS
ALTER TABLE design_service_requests ENABLE ROW LEVEL SECURITY;

-- Clients can view their own requests
CREATE POLICY "Clients can view their design requests" 
ON design_service_requests FOR SELECT 
USING (auth.uid() = client_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all design requests" 
ON design_service_requests FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Admins can update requests
CREATE POLICY "Admins can update design requests" 
ON design_service_requests FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- System can insert requests
CREATE POLICY "System can insert design requests" 
ON design_service_requests FOR INSERT 
WITH CHECK (auth.uid() = client_id);
