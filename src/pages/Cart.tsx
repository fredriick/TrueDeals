import { useCart } from '@/context/useCart';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { AppwriteImage } from '@/components/ui/AppwriteImage';

export default function Cart() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!address.trim()) {
            alert('Please enter a shipping address');
            return;
        }

        setLoading(true);
        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            await databases.createDocument(
                'thrift_store',
                'orders',
                ID.unique(),
                {
                    userId: user.$id,
                    items: items.map(i => i.$id),
                    total: total(),
                    status: 'pending',
                    address: address
                }
            );

            clearCart();
            alert('Order placed successfully!');
            navigate('/'); // Redirect to home or order history
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
                        <div key={item.$id} className="flex items-center gap-4 border p-4 rounded-lg bg-white shadow-sm">
                            <div className="h-20 w-20 bg-slate-100 rounded overflow-hidden flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                                {item.imageId ? (
                                    <AppwriteImage fileId={item.imageId} alt={item.name} />
                                ) : (
                                    'No Img'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                                <p className="text-slate-500">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.$id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => updateQuantity(item.$id, item.quantity + 1)}
                                    disabled={item.quantity >= item.maxQuantity}
                                >
                                    +
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.$id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-lg border h-fit shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-4">
                        <span>Subtotal</span>
                        <span>${total().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-6 font-bold text-lg border-t pt-4">
                        <span>Total</span>
                        <span>${total().toFixed(2)}</span>
                    </div>

                    {user ? (
                        <form onSubmit={handleCheckout} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                                <textarea
                                    className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                                    placeholder="Enter your full address..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-bold mb-3">Payment Details</h3>
                                <div className="space-y-3">
                                    <Input placeholder="Card Number (Fake)" required pattern="\d{16}" title="Enter 16 digits" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input placeholder="MM/YY" required />
                                        <Input placeholder="CVC" required pattern="\d{3}" title="Enter 3 digits" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    * This is a demo. No real payment is processed.
                                </p>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Processing Payment...' : `Pay $${total().toFixed(2)}`}
                            </Button>
                        </form>
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
