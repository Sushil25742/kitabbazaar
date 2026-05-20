# KitabBazaar 🇳🇵📚

KitabBazaar is a specialized, mobile-first student-to-student book thrift marketplace designed specifically for Nepal. It allows students to list used textbooks, browse available books, chat with sellers, and securely execute trades, all while the platform guarantees a flat **10% commission** structure.

## ✨ Core Features
- **Role-Based Dashboards:** Distinct dashboards for Buyers, Sellers, and Admins.
- **Robust Marketplace:** Advanced search, category filtering, and sorting capabilities.
- **In-App Messaging:** Real-time buyer-to-seller chat system.
- **Ironclad Escrow & Payments:** Mock integration for eSewa, Khalti, and COD, with an admin-verification barrier.
- **Automated Reputation System:** Reviews automatically calculate the seller's rating using database triggers.
- **Deep Security:** Hardened with PostgreSQL Row Level Security (RLS) preventing all cross-account manipulation.

## 🛠 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Backend/Auth:** Supabase (Auth, Postgres, Storage)
- **Deployment:** Vercel ready

---

## 🚀 Getting Started

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/your-username/kitabbazaar.git
cd kitabbazaar
npm install
\`\`\`

### 2. Environment Variables
Copy the example environment file and fill in your Supabase keys.
\`\`\`bash
cp .env.example .env.local
\`\`\`
*Note: See \`.env.example\` for the required keys.*

### 3. Supabase Setup & Database Migration
1. Create a new project on [Supabase](https://supabase.com/).
2. Retrieve your **Project URL** and **Anon Key** and paste them into \`.env.local\`.
3. Push the schema and RLS policies using the Supabase CLI:
   \`\`\`bash
   # Install CLI if you haven't
   npm install -g supabase
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Push the migrations to create tables, triggers, and RLS
   supabase db push
   \`\`\`
4. **Storage Setup:** The migration automatically creates a \`book-images\` bucket. Verify in the Supabase Dashboard that the bucket exists and is set to **Public**.

### 4. Run Locally
\`\`\`bash
npm run dev
\`\`\`
Visit \`http://localhost:3000\`.

### 5. Build for Production
\`\`\`bash
npm run build
npm start
\`\`\`

---

## 🔒 Security & RLS Policy Guide
The database is extremely strictly governed by **Row Level Security (RLS)** in \`supabase/migrations/20260521_rls_policies.sql\`.
- **Profiles:** Users can only update their own profiles.
- **Orders:** Buyers can insert orders. Only the specific Buyer and Seller tied to an order can read it.
- **Reviews:** A buyer can **only** leave a review if a corresponding \`completed\` order exists.
- **Self-Dealing:** Database constraints strictly prevent a seller from buying their own book.

---

## 💰 Commission & Payout Logic
KitabBazaar uses a flat **10% commission model**. 
This is securely enforced at the **Database Engine Level** using PostgreSQL \`GENERATED ALWAYS\` columns. 
- \`platformCommission\` = \`total_price * 0.10\`
- \`sellerPayout\` = \`total_price * 0.90\`

Because this math happens in the SQL schema natively, it is completely immune to frontend manipulation. If a book sells for Rs. 1000, the database forcefully inserts Rs. 100 as the platform fee and Rs. 900 as the seller payout.

---

## 👨‍💼 Admin Guide
By default, all new users receive the \`user\` role. 
**How to create an Admin:**
1. Sign up normally on the frontend.
2. Open your Supabase Dashboard -> Table Editor -> \`profiles\`.
3. Edit your profile record and change the \`role\` column from \`user\` to \`admin\`.
4. Refresh the KitabBazaar app. You will now have access to the **Admin Dashboard**.

**Admin Responsibilities:**
- **Approve Listings:** Books will not appear in the public marketplace until an admin clicks "Approve".
- **Verify Payments:** When a user selects COD, eSewa, or Khalti, the payment goes to \`Pending\`. Admins must verify the payment to move the Order status to \`Confirmed\`.

---

## 🛍️ Buyer & Seller Flow Guide
1. **List (Seller):** Uploads book details + image. Status becomes \`pending_approval\`.
2. **Approve (Admin):** Admin reviews and approves the listing. Status becomes \`approved\`.
3. **Checkout (Buyer):** Buyer finds the book and completes checkout via Mock eSewa/Khalti/COD. Order becomes \`pending\`.
4. **Verify (Admin):** Admin verifies the external payment. Order becomes \`confirmed\`.
5. **Receive (Buyer):** The buyer meets the seller, receives the physical book, and clicks **Mark Received** in their dashboard. Order becomes \`completed\`. Book becomes \`sold\`.
6. **Review (Buyer):** Buyer can now leave a rating for the seller.

---

## 💳 Payment Placeholder & Future Integration Notes
Currently, eSewa and Khalti are implemented as **frontend placeholders** to complete the database flow.
**To integrate real APIs in the future:**
1. Modify \`src/app/checkout/actions.ts\`.
2. Instead of immediately creating a \`payment\` record and redirecting to \`/dashboard\`, initialize an eSewa/Khalti payment intent using their Node.js SDK.
3. Redirect the buyer to the generated \`epay.esewa.com.np\` URL.
4. Create a Next.js API Route (e.g., \`/api/payments/esewa/callback\`) to capture the success redirect, verify the signature, and automatically update the \`payments\` table status to \`verified\`.

---

## 🌍 Vercel Deployment Guide
1. Push your code to a private GitHub repository.
2. Import the project in Vercel.
3. In the Vercel Environment Variables settings, add:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
4. Click **Deploy**. Vercel will automatically detect the Next.js App Router and compile the project.
