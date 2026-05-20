-- 7. Row Level Security (RLS) Policies

-- ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self update, admin all
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles." ON profiles USING (is_admin());

-- Books: Public read approved, seller read/write own, admin all
CREATE POLICY "Approved books are viewable by everyone." ON books FOR SELECT USING (status = 'approved');
CREATE POLICY "Sellers can view their own books regardless of status." ON books FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert own books." ON books FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own books." ON books FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Admins have full access to books." ON books USING (is_admin());

-- Book Images: Public read, seller write own, admin all
CREATE POLICY "Book images are viewable by everyone." ON book_images FOR SELECT USING (true);
CREATE POLICY "Sellers can insert images for their books." ON book_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM books WHERE id = book_images.book_id AND seller_id = auth.uid()));
CREATE POLICY "Sellers can delete images for their books." ON book_images FOR DELETE USING (EXISTS (SELECT 1 FROM books WHERE id = book_images.book_id AND seller_id = auth.uid()));
CREATE POLICY "Admins have full access to book images." ON book_images USING (is_admin());

-- Orders: Buyer and Seller read, Buyer insert, Admin all
CREATE POLICY "Buyers and Sellers can view their orders." ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can insert orders." ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id AND auth.uid() != seller_id);
CREATE POLICY "Admins have full access to orders." ON orders USING (is_admin());

-- Payments: Payer and order Seller read, Payer insert, Admin all
CREATE POLICY "Payers and Sellers can view payments." ON payments FOR SELECT USING (
  auth.uid() = payer_id OR EXISTS (SELECT 1 FROM orders WHERE id = payments.order_id AND seller_id = auth.uid())
);
CREATE POLICY "Payers can insert payments." ON payments FOR INSERT WITH CHECK (auth.uid() = payer_id);
CREATE POLICY "Admins have full access to payments." ON payments USING (is_admin());

-- Messages: Sender and Receiver read/insert
CREATE POLICY "Users can view their messages." ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages." ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update read status of received messages." ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Reviews: Public read, eligible buyers insert, admin all
CREATE POLICY "Reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
CREATE POLICY "Buyers with completed orders can insert reviews." ON reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND 
  EXISTS (SELECT 1 FROM orders WHERE id = reviews.order_id AND buyer_id = auth.uid() AND status = 'completed')
);
CREATE POLICY "Admins have full access to reviews." ON reviews USING (is_admin());

-- Reports: Users can insert, Admin all
CREATE POLICY "Users can insert reports." ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins have full access to reports." ON reports USING (is_admin());

-- Notifications: User read/update own
CREATE POLICY "Users can view own notifications." ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications." ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/Admins can insert notifications." ON notifications FOR INSERT WITH CHECK (true);

-- Wishlist: User full access own
CREATE POLICY "Users manage own wishlist." ON wishlist FOR ALL USING (auth.uid() = user_id);

-- Admin Actions: Admin only
CREATE POLICY "Admins have full access to admin_actions." ON admin_actions USING (is_admin());

-- 8. Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('book-images', 'book-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to book-images" ON storage.objects FOR SELECT USING (bucket_id = 'book-images');
CREATE POLICY "Authenticated users can upload book-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own book-images" ON storage.objects FOR DELETE USING (bucket_id = 'book-images' AND auth.uid() = owner);
