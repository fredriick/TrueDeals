import { useCart } from '@/context/useCart';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useState } from 'react';

export default function Cart() {
    const { items, removeItem, total, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await databases.createDocument(
                'thrift_store',
                'orders',
                ID.unique(),
                {
                    userId: user.$id,
                    items: items.map(i => i.$id), // Storing IDs for now
                    total: total(),
                    status: 'pending',
                    address: 'User Address (Placeholder)' // In real app, ask for address
                }
            );

            // Mark items as sold? In a real app, yes.
            // For now, just clear cart
            clearCart();
            alert('Order placed successfully!');
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Link to="/shop">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.$id} className="flex items-center gap-4 border p-4 rounded-lg bg-white">
                            <div className="h-20 w-20 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">
                                {item.imageId ? 'Img' : 'No Img'}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-slate-500">${item.price.toFixed(2)}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.$id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-lg border h-fit">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-4">
                        <span>Subtotal</span>
                        <span>${total().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-6 font-bold text-lg">
                        <span>Total</span>
                        <span>${total().toFixed(2)}</span>
                    </div>

                    {user ? (
                        <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
                            {loading ? 'Processing...' : 'Checkout'}
                        </Button>
                    ) : (
                        <Link to="/login">
                            <Button className="w-full" size="lg" variant="outline">
                                Login to Checkout
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
