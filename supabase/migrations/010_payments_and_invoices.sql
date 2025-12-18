-- Create payments table for escrow system
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'DZD',
    
    -- Payment method
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'ccp', 'baridi_mob', 'satim_card', 'cash')) NOT NULL,
    
    -- Escrow status
    status TEXT CHECK (status IN ('pending', 'held', 'released', 'refunded', 'failed')) DEFAULT 'pending',
    
    -- Payment details
    transaction_id TEXT,
    payment_proof_url TEXT, -- Upload of bank transfer receipt
    
    -- Timing
    paid_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Invoice number (legal requirement)
    invoice_number TEXT UNIQUE NOT NULL,
    
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tva_rate DECIMAL(5, 2) DEFAULT 19.00, -- Algeria TVA 19%
    tva_amount DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Legal info
    company_rc TEXT, -- Registre de Commerce
    company_nif TEXT, -- Numéro d'Identification Fiscale
    article_87_exempt BOOLEAN DEFAULT FALSE, -- Tax exemption
    
    -- PDF
    pdf_url TEXT,
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'issued', 'paid', 'cancelled')) DEFAULT 'draft',
    
    issued_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clients and partners can view their own payments
CREATE POLICY "Users can view their payments" 
ON payments FOR SELECT 
USING (auth.uid() = client_id OR auth.uid() = partner_id);

-- Clients can create payments
CREATE POLICY "Clients can create payments" 
ON payments FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Admins can update payment status
CREATE POLICY "Admins can update payments" 
ON payments FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users in the transaction can view invoices
CREATE POLICY "Users can view their invoices" 
ON invoices FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = invoices.order_id 
        AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
    )
);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    sequence_num INT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year || '%';
    
    RETURN 'INV-' || year || '-' || LPAD(sequence_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
