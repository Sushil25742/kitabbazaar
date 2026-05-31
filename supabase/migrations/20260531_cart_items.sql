-- cart_items table
CREATE TABLE cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, book_id)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_items_modtime
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own cart items."
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items."
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items."
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items."
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
