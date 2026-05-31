# PRD: Shopping Cart

## Feature Overview
Implement a Shopping Cart feature for KitabBazar to allow users to add books to their cart, view the cart summary, adjust quantities, and proceed to checkout. The cart should be persistently stored in the database for logged-in users.

## User Stories
1. As a user, I want to add a book to my shopping cart from the book details page.
2. As a user, I want to view the contents of my shopping cart so I can review my selected books.
3. As a user, I want to update the quantity of a book in my cart or remove it entirely.
4. As a user, I want to see the total price of the items in my cart.

## Acceptance Criteria
- An "Add to Cart" button is visible on book listings.
- Clicking "Add to Cart" updates the cart state globally (e.g., showing a badge on the cart icon in the navigation bar).
- The Cart page (`/cart`) displays a list of added items with their cover image, title, price, and selected quantity.
- Users can increment or decrement the quantity of each item.
- Users can remove an item from the cart.
- Cart subtotal is dynamically calculated and displayed.
- Cart data is persisted using Supabase for authenticated users.

## Technical Implementation Plan
- Create a Supabase table `cart_items` with `user_id`, `book_id`, and `quantity`.
- Develop a global cart state management solution on the client.
- Create UI components: `CartIcon` (with badge), `CartPage`, `CartItem`.
- Integrate Next.js Server Actions to sync cart data with Supabase.

## Files Likely to Change
- `src/components/layout/Header.tsx` (Add cart icon)
- `src/components/cart/CartIcon.tsx` (New)
- `src/components/cart/CartItem.tsx` (New)
- `src/app/cart/page.tsx` (New)
- `supabase/migrations/xxxx_create_cart_items.sql` (New)

## Database/API/UI Changes
- **Database:** New `cart_items` table linked to `users` and `books`.
- **API:** Next.js Server Actions for `addToCart`, `updateCartItem`, `removeCartItem`.
- **UI:** Cart icon in the header, Cart page with item list and checkout summary.

## Browser Verification Steps
1. Navigate to a book listing and click "Add to Cart".
2. Verify the cart icon in the header updates the item count badge.
3. Click the cart icon to navigate to the `/cart` page.
4. Verify the item appears with the correct price and quantity.
5. Change the quantity and verify the subtotal updates.
6. Remove the item and verify the cart is empty.

## Test/Checklist Items
- [ ] Cart icon updates dynamically.
- [ ] Cart state persists across page reloads.
- [ ] Adding an existing item increments its quantity instead of creating a duplicate entry.
- [ ] Supabase RLS policies are properly configured so users can only read/write their own cart items.
