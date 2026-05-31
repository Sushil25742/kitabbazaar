'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCartItems } from '@/app/cart/actions';

export type CartItemType = {
  id: string;
  quantity: number;
  books: {
    id: string;
    title: string;
    author: string;
    price: number;
    condition: string;
    book_images: { image_url: string }[];
  };
};

interface CartContextType {
  items: CartItemType[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCartItems();
      setItems(data as unknown as CartItemType[]);
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isLoading, refreshCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
