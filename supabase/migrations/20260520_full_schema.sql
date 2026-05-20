-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE book_condition AS ENUM ('New-like', 'Good', 'Fair', 'Old');
CREATE TYPE book_status AS ENUM ('pending_approval', 'approved', 'rejected', 'sold', 'deleted', 'removed');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('eSewa', 'Khalti', 'COD', 'Manual');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'failed', 'refunded');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- 2. Create Tables
-- profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    college_name TEXT,
    location TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    total_books_listed INT DEFAULT 0,
    total_books_sold INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- books
CREATE TABLE books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    subject TEXT,
    class_level TEXT,
    description TEXT,
    condition book_condition NOT NULL,
    original_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    location TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    status book_status DEFAULT 'pending_approval' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- book_images
CREATE TABLE book_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- orders
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE RESTRICT NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    commission_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_price * 0.10) STORED,
    payout_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_price * 0.90) STORED,
    status order_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_buyer_not_seller CHECK (buyer_id != seller_id)
);

-- payments
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE RESTRICT NOT NULL,
    payer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * 0.10) STORED,
    payout_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount * 0.90) STORED,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- messages
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- reviews
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_reviewer_not_reviewee CHECK (reviewer_id != reviewee_id)
);

-- reports
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reported_book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_report_target CHECK (reported_book_id IS NOT NULL OR reported_user_id IS NOT NULL)
);

-- notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- wishlist
CREATE TABLE wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, book_id)
);

-- admin_actions
CREATE TABLE admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    action_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_seller_id ON books(seller_id);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_receiver_id_is_read ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- 4. RLS Helper Function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Additional granular RLS policy creations would be applied here in a production environment using `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)

-- 5. Trigger for Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Trigger for Updating Seller Rating
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET seller_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_seller_rating();
