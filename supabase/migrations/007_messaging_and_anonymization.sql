-- Create messages table for secure communication
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_quote_id ON messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- RLS Policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages
CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Users can mark their received messages as read
CREATE POLICY "Users can update their received messages" 
ON messages FOR UPDATE 
USING (auth.uid() = receiver_id);

-- Add flags to profiles for contact visibility
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS contact_visible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT;

-- Add partner anonymization fields to partners table
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS masked_name TEXT,
ADD COLUMN IF NOT EXISTS contact_revealed BOOLEAN DEFAULT FALSE;

-- Function to generate masked company name
CREATE OR REPLACE FUNCTION mask_company_name(company_name TEXT)
RETURNS TEXT AS $$
BEGIN
    IF LENGTH(company_name) <= 3 THEN
        RETURN SUBSTRING(company_name FROM 1 FOR 1) || '***';
    ELSE
        RETURN SUBSTRING(company_name FROM 1 FOR 2) || '***' || SUBSTRING(company_name FROM LENGTH(company_name) FOR 1);
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-generate masked name
CREATE OR REPLACE FUNCTION update_masked_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.masked_name := mask_company_name(NEW.company_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_masked_name
    BEFORE INSERT OR UPDATE OF company_name ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_masked_name();
