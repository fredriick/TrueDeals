import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function Orders() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchOrders = async () => {
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'orders',
                [
                    Query.equal('userId', user!.$id),
                    Query.orderDesc('$createdAt')
                ]
            );
            setOrders(response.documents);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mx-auto px-4 py-20 text-center">Loading orders...</div>;

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Please login to view your orders</h1>
                <Link to="/login"><Button>Login</Button></Link>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">No orders found</h1>
                <p className="text-slate-500 mb-8">You haven't placed any orders yet.</p>
                <Link to="/shop"><Button>Start Shopping</Button></Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
            <div className="space-y-4">
                {orders.map((order) => {
                    // Safe parsing helper
                    let items: any[] = [];
                    try {
                        if (typeof order.items === 'string') {
                            items = JSON.parse(order.items);
                        } else if (Array.isArray(order.items)) {
                            items = order.items.map((i: any) => typeof i === 'string' ? JSON.parse(i) : i);
                        }
                    } catch (e) {
                        console.error('Error parsing order items:', e);
                        items = [];
                    }

                    return (
                        <div key={order.$id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between md:items-start mb-4 gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-sm text-slate-500">Order #{order.$id.slice(-8).toUpperCase()}</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${(order.status || 'pending') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                        order.status === 'out_for_delivery' ? 'bg-pink-100 text-pink-800' :
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-slate-100 text-slate-800'
                                            }`}>
                                            {(order.status || 'pending').split('_').map((word: string) =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Ordered on {new Date(order.$createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    {order.trackingNumber && (
                                        <p className="text-sm text-slate-600 mt-2">
                                            <span className="font-medium">Tracking:</span> {order.trackingNumber}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/order-tracking/${order.$id}`}>
                                        <Button variant="outline" size="sm">
                                            Track Order
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex flex-col gap-2 mb-4">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-700">{item.quantity}x {item.name}</span>
                                            <span className="text-slate-500">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center border-t border-dashed pt-2">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500 truncate max-w-md">{order.address}</p>
                                    </div>
                                    <p className="text-xl font-bold ml-4">${(order.total || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
