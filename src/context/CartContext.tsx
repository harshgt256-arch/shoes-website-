"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ShoeProduct } from "@/data/shoes";

export interface CartItem {
  id: string;
  shoeId: string;
  name: string;
  category: string;
  colour: string;
  price: number;
  image: string;
  size: number; // UK / India 6 to 12
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (shoe: ShoeProduct, size: number, quantity?: number) => void;
  removeItem: (shoeId: string, size: number) => void;
  updateQuantity: (shoeId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
  total: number;
  gstAmount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "maison-aurelle-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart to localStorage", e);
    }
  }, [items, isMounted]);

  const addItem = (shoe: ShoeProduct, size: number, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.shoeId === shoe.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `${shoe.id}-${size}`,
        shoeId: shoe.id,
        name: shoe.name,
        category: shoe.type || shoe.category,
        colour: shoe.colour,
        price: shoe.price,
        image: shoe.image,
        size,
        quantity,
      };

      return [...prev, newItem];
    });

    // Automatically reveal the cart drawer so user sees item added
    setIsCartOpen(true);
  };

  const removeItem = (shoeId: string, size: number) => {
    setItems((prev) =>
      prev.filter((item) => !(item.shoeId === shoeId && item.size === size))
    );
  };

  const updateQuantity = (shoeId: string, size: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(shoeId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.shoeId === shoeId && item.size === size) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const { totalItems, subtotal, gstAmount, total } = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // 18% GST is inclusive in total
    // Base = Total / 1.18, GST = Total - Base
    const gstAmount = Math.round(subtotal - subtotal / 1.18);
    const total = subtotal;

    return { totalItems, subtotal, gstAmount, total };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        totalItems,
        subtotal,
        total,
        gstAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
