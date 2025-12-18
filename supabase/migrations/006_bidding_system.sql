-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
    partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'DZD',
    delivery_days INTEGER NOT NULL,
    proposal_text TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bids_quote_id ON bids(quote_id);
CREATE INDEX IF NOT EXISTS idx_bids_partner_id ON bids(partner_id);

-- Update quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'open', 'bidding_closed', 'ordered')) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS winning_bid_id UUID REFERENCES bids(id);

-- RLS Policies for bids

-- Enable RLS
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Partners can view their own bids
CREATE POLICY "Partners can view their own bids" 
ON bids FOR SELECT 
USING (auth.uid() = partner_id);

-- Partners can insert bids
CREATE POLICY "Partners can create bids" 
ON bids FOR INSERT 
WITH CHECK (auth.uid() = partner_id);

-- Clients can view bids for their quotes
CREATE POLICY "Clients can view bids for their quotes" 
ON bids FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM quotes 
        WHERE quotes.id = bids.quote_id 
        AND quotes.user_id = auth.uid()
    )
);

-- Clients can update bids (to accept them)
CREATE POLICY "Clients can update bids for their quotes" 
ON bids FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM quotes 
        WHERE quotes.id = bids.quote_id 
        AND quotes.user_id = auth.uid()
    )
);
