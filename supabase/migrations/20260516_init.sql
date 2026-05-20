-- KitabBazaar Database Schema

-- 1. Create custom enum types
CREATE TYPE book_condition AS ENUM ('New', 'Like New', 'Good', 'Fair', 'Poor');
CREATE TYPE order_status AS ENUM ('Pending', 'Paid', 'Shipped', 'Completed', 'Cancelled');
CREATE TYPE payment_method AS ENUM ('eSewa', 'Khalti', 'COD', 'Manual');

-- 2. Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    college_name TEXT,
    avatar_url TEXT,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Books Table
CREATE TABLE public.books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    condition book_condition NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    images TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transactions / Orders Table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    book_id UUID REFERENCES public.books(id) ON DELETE RESTRICT NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    price_at_sale DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'Pending' NOT NULL,
    payment_method payment_method NOT NULL,
    payment_receipt_url TEXT, -- For manual verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Row Level Security (RLS) setup

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Books RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active books are viewable by everyone." ON public.books FOR SELECT USING (is_active = true OR auth.uid() = seller_id);
CREATE POLICY "Sellers can insert their own books." ON public.books FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own books." ON public.books FOR UPDATE USING (auth.uid() = seller_id);

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers and Sellers can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can insert new transactions." ON public.transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Buyers and Sellers can update their transaction status." ON public.transactions FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 6. Setup Supabase Storage for Images (assuming a 'book-images' bucket exists)
-- This is pseudo-policy, actual storage policies are created differently but illustrative here
-- CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'book-images');
-- CREATE POLICY "Anyone can upload an image." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-images' AND auth.role() = 'authenticated');
