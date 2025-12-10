import { useCart } from '@/context/useCart';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { AppwriteImage } from '@/components/ui/AppwriteImage';

export default function Cart() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [coupon, setCoupon] = useState<any>(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    const validateCoupon = async () => {
        if (!promoCode.trim()) return;
        setLoading(true);
        setCouponError('');
        try {
            const response = await databases.listDocuments('thrift_store', 'coupons', [
                Query.equal('code', promoCode.toUpperCase()),
                Query.equal('isActive', true)
            ]);

            if (response.documents.length === 0) {
                setCouponError('Invalid or inactive coupon code');
                setCoupon(null);
                setDiscount(0);
                return;
            }

            const foundCoupon = response.documents[0];
            const now = new Date();
            if (new Date(foundCoupon.expiresAt) < now) {
                setCouponError('This coupon has expired');
                setCoupon(null);
                setDiscount(0);
                return;
            }

            if (foundCoupon.usageLimit > 0 && foundCoupon.usageCount >= foundCoupon.usageLimit) {
                setCouponError('This coupon usage limit has been reached');
                setCoupon(null);
                setDiscount(0);
                return;
            }

            const currentTotal = total();
            if (currentTotal < foundCoupon.minPurchase) {
                setCouponError(`Minimum purchase of $${foundCoupon.minPurchase} required`);
                setCoupon(null);
                setDiscount(0);
                return;
            }

            // Calculate discount
            let calculatedDiscount = 0;
            if (foundCoupon.type === 'percentage') {
                calculatedDiscount = currentTotal * (foundCoupon.value / 100);
                if (foundCoupon.maxDiscount > 0) {
                    calculatedDiscount = Math.min(calculatedDiscount, foundCoupon.maxDiscount);
                }
            } else {
                calculatedDiscount = foundCoupon.value;
            }

            // Ensure discount doesn't exceed total
            calculatedDiscount = Math.min(calculatedDiscount, currentTotal);

            setCoupon(foundCoupon);
            setDiscount(calculatedDiscount);
            setCouponError('');
        } catch (error) {
            console.error('Coupon validation error:', error);
            setCouponError('Failed to validate coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!address.trim()) {
            alert('Please enter a shipping address');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Validate stock for all items
            const stockValidation = await Promise.all(
                items.map(async (item) => {
                    const product = await databases.getDocument('thrift_store', 'products', item.$id);
                    return {
                        item,
                        product,
                        available: product.quantity >= item.quantity
                    };
                })
            );

            // Check if any items are out of stock
            const outOfStock = stockValidation.filter(v => !v.available);
            if (outOfStock.length > 0) {
                const itemNames = outOfStock.map(v => v.item.name).join(', ');
                alert(`The following items are out of stock or have insufficient quantity: ${itemNames}. Please update your cart.`);
                setLoading(false);
                return;
            }

            // Step 2: Create order
            await databases.createDocument(
                'thrift_store',
                'orders',
                ID.unique(),
                {
                    userId: user.$id,
                    userEmail: user.email,
                    items: items,
                    total: total() - discount,
                    subtotal: total(),
                    discount: discount,
                    couponCode: coupon ? coupon.code : null,
                    status: 'pending',
                    address: address
                }
            );

            // Update coupon usage if used
            if (coupon) {
                await databases.updateDocument('thrift_store', 'coupons', coupon.$id, {
                    usageCount: coupon.usageCount + 1
                });
            }

            // Step 3: Reduce inventory for each product
            await Promise.all(
                stockValidation.map(async ({ item, product }) => {
                    const newQuantity = product.quantity - item.quantity;
                    await databases.updateDocument('thrift_store', 'products', item.$id, {
                        quantity: newQuantity,
                        status: newQuantity > 0 ? 'available' : 'sold'
                    });
                })
            );

            clearCart();
            alert('Order placed successfully! Your items will be shipped soon.');
            navigate('/admin/orders');
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

                    {discount > 0 && (
                        <div className="flex justify-between mb-4 text-green-600">
                            <span>Discount ({coupon?.code})</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex gap-2 mb-6">
                        <Input
                            placeholder="Promo Code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            disabled={!!coupon}
                        />
                        {coupon ? (
                            <Button variant="outline" onClick={() => {
                                setCoupon(null);
                                setDiscount(0);
                                setPromoCode('');
                            }}>
                                Remove
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={validateCoupon} disabled={loading || !promoCode}>
                                Apply
                            </Button>
                        )}
                    </div>
                    {couponError && <p className="text-red-500 text-sm mb-4">{couponError}</p>}

                    <div className="flex justify-between mb-6 font-bold text-lg border-t pt-4">
                        <span>Total</span>
                        <span>${(total() - discount).toFixed(2)}</span>
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
                                {loading ? 'Processing Payment...' : `Pay $${(total() - discount).toFixed(2)}`}
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
