import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    $id: string;
    name: string;
    price: number;
    imageId?: string;
    quantity: number;
    maxQuantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: any) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find((i) => i.$id === product.$id);

                if (existingItem) {
                    if (existingItem.quantity < existingItem.maxQuantity) {
                        set({
                            items: items.map((i) =>
                                i.$id === product.$id
                                    ? { ...i, quantity: i.quantity + 1 }
                                    : i
                            ),
                        });
                    } else {
                        alert('Max quantity reached for this item');
                    }
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                $id: product.$id,
                                name: product.name,
                                price: product.price,
                                imageId: product.images && product.images.length > 0 ? product.images[0] : product.imageId,
                                quantity: 1,
                                maxQuantity: product.quantity,
                            },
                        ],
                    });
                }
            },
            removeItem: (id) => set({ items: get().items.filter((i) => i.$id !== id) }),
            updateQuantity: (id, quantity) => {
                const items = get().items;
                const item = items.find((i) => i.$id === id);
                if (item) {
                    const newQuantity = Math.max(1, Math.min(quantity, item.maxQuantity));
                    set({
                        items: items.map((i) => (i.$id === id ? { ...i, quantity: newQuantity } : i)),
                    });
                }
            },
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
