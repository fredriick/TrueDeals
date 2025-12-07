import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    $id: string;
    name: string;
    price: number;
    imageId?: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: any) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const items = get().items;
                if (!items.find((i) => i.$id === item.$id)) {
                    set({ items: [...items, item] });
                }
            },
            removeItem: (id) => set({ items: get().items.filter((i) => i.$id !== id) }),
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((sum, item) => sum + item.price, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
