-- Catfé TV Database Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create screens table
CREATE TABLE IF NOT EXISTS screens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('snap_purr', 'events', 'today', 'membership', 'reminders', 'adoption', 'thank_you')),
    title TEXT NOT NULL,
    subtitle TEXT,
    body_text TEXT,
    image_url TEXT,
    qr_code_url TEXT,
    duration INTEGER DEFAULT 10 CHECK (duration >= 5 AND duration <= 60),
    priority INTEGER DEFAULT 0 CHECK (priority >= 0 AND priority <= 10),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    schedule JSONB,
    -- Adoption-specific fields
    cat_name TEXT,
    cat_age TEXT,
    cat_gender TEXT CHECK (cat_gender IN ('Male', 'Female', NULL)),
    cat_breed TEXT,
    cat_description TEXT,
    -- Event-specific fields
    event_date TIMESTAMP WITH TIME ZONE,
    event_time TEXT,
    event_location TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    location_name TEXT DEFAULT 'Catfé Santa Clarita',
    default_duration INTEGER DEFAULT 10 CHECK (default_duration >= 5 AND default_duration <= 60),
    snap_purr_frequency INTEGER DEFAULT 5 CHECK (snap_purr_frequency >= 2 AND snap_purr_frequency <= 10),
    latitude DOUBLE PRECISION DEFAULT 34.3917,
    longitude DOUBLE PRECISION DEFAULT -118.5426,
    auto_refresh_interval INTEGER DEFAULT 60 CHECK (auto_refresh_interval >= 30),
    transition_duration DOUBLE PRECISION DEFAULT 1.0 CHECK (transition_duration >= 0.5 AND transition_duration <= 3.0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_screens_updated_at ON screens;
CREATE TRIGGER update_screens_updated_at
    BEFORE UPDATE ON screens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_screens_is_active ON screens(is_active);
CREATE INDEX IF NOT EXISTS idx_screens_sort_order ON screens(sort_order);
CREATE INDEX IF NOT EXISTS idx_screens_type ON screens(type);

-- Enable Row Level Security (RLS)
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for TV app)
CREATE POLICY "Allow public read access to screens"
    ON screens FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to settings"
    ON settings FOR SELECT
    USING (true);

-- Create policies for authenticated write access (for admin app)
-- Note: Configure authentication in Supabase dashboard
CREATE POLICY "Allow authenticated insert on screens"
    ON screens FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on screens"
    ON screens FOR UPDATE
    USING (true);

CREATE POLICY "Allow authenticated delete on screens"
    ON screens FOR DELETE
    USING (true);

CREATE POLICY "Allow authenticated update on settings"
    ON settings FOR UPDATE
    USING (true);

-- Insert sample data
INSERT INTO screens (type, title, subtitle, body_text, qr_code_url, duration, sort_order) VALUES
    ('snap_purr', 'Snap & Purr', 'Share your visit!', 'Take a photo with our cats and share on social media using #CatfeSantaClarita', 'https://instagram.com/catfesantaclarita', 15, 0),
    ('today', 'Today at Catfé', NULL, '• Open 10 AM - 8 PM\n• Happy Hour 3-5 PM\n• New kittens available!', NULL, 10, 1),
    ('membership', 'Become a Member', 'Unlimited visits & perks', 'Get unlimited visits, member discounts, and exclusive events access!', 'https://catfesantaclarita.com/membership', 12, 2),
    ('reminders', 'Friendly Reminders', 'Help us keep our cats happy', '• Wash hands before and after\n• No flash photography\n• Be gentle with the cats\n• Food and drinks in designated areas only', NULL, 10, 3),
    ('thank_you', 'Thank You!', 'For visiting Catfé', 'Your visit helps support local cat rescue organizations. See you next time!', NULL, 8, 4)
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 'Screens table created with ' || COUNT(*) || ' sample records' AS status FROM screens;
SELECT 'Settings table created' AS status FROM settings WHERE id = 1;
