import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem { menuItemId: string; name: string; price: number; quantity: number; specialInstructions: string; imageUrl?: string; }

interface CartState {
    tableId: string | null;
    items: CartItem[];
    setTableId: (tableId: string) => void;
    addItem: (item: Omit<CartItem, 'quantity' | 'specialInstructions'>) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    updateInstructions: (menuItemId: string, instructions: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTax: () => number;
    getServiceCharge: () => number;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            tableId: null,
            items: [],
            setTableId: (tableId) => set({ tableId }),
            addItem: (item) => {
                const items = get().items;
                const existing = items.find((i) => i.menuItemId === item.menuItemId);
                if (existing) set({ items: items.map((i) => i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i) });
                else set({ items: [...items, { ...item, quantity: 1, specialInstructions: '' }] });
            },
            removeItem: (menuItemId) => set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
            updateQuantity: (menuItemId, quantity) => {
                if (quantity <= 0) set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
                else set({ items: get().items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity } : i) });
            },
            updateInstructions: (menuItemId, instructions) => set({ items: get().items.map((i) => i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i) }),
            clearCart: () => set({ items: [] }),
            getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            getTax: () => Math.round(get().getSubtotal() * 0.05 * 100) / 100,
            getServiceCharge: () => Math.round(get().getSubtotal() * 0.05 * 100) / 100,
            getTotal: () => Math.round((get().getSubtotal() + get().getTax() + get().getServiceCharge()) * 100) / 100,
            getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
        }),
        { name: 'cart-storage' }
    )
);
