-- Add shipping information to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_wilaya TEXT,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_status TEXT CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'failed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS courier_service TEXT, -- 'yalidine', 'ecotracks', 'manual'
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Create shipping rates table (wilaya-based)
CREATE TABLE IF NOT EXISTS shipping_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_wilaya TEXT NOT NULL,
    to_wilaya TEXT NOT NULL,
    base_rate DECIMAL(10, 2) NOT NULL, -- Base shipping cost
    weight_additional_rate DECIMAL(10, 2) DEFAULT 0, -- Cost per kg above base weight
    base_weight_kg DECIMAL(5, 2) DEFAULT 1.0, -- Weight included in base rate
    estimated_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for shipping rates lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_shipping_rates_wilaya_pair ON shipping_rates(from_wilaya, to_wilaya);

-- Insert default shipping rates (sample data - adjust as needed)
INSERT INTO shipping_rates (from_wilaya, to_wilaya, base_rate, estimated_days) VALUES
-- Same wilaya
('16', '16', 500, 1), -- Alger to Alger
('31', '31', 500, 1), -- Oran to Oran
('25', '25', 500, 1), -- Constantine to Constantine

-- Cross-country rates (examples)
('16', '31', 1200, 3), -- Alger to Oran
('16', '25', 1200, 3), -- Alger to Constantine
('31', '16', 1200, 3), -- Oran to Alger
('25', '16', 1200, 3), -- Constantine to Alger

-- Regional rates (adjacent wilayas)
('16', '42', 800, 2), -- Alger to Tipaza
('16', '09', 800, 2), -- Alger to Blida
('31', '29', 800, 2)  -- Oran to Mascara
ON CONFLICT (from_wilaya, to_wilaya) DO NOTHING;

-- Create delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);

-- RLS for shipping_rates (public read)
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipping rates" 
ON shipping_rates FOR SELECT 
USING (true);

-- RLS for delivery_tracking
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their delivery tracking" 
ON delivery_tracking FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = delivery_tracking.order_id 
        AND (orders.client_id = auth.uid() OR orders.partner_id = auth.uid())
    )
);
