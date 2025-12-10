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
                    const items = typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []);
                    return (
                        <div key={order.$id} className="bg-white border rounded-lg p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                                <div>
                                    <p className="text-sm text-slate-500">Order ID: <span className="font-mono text-xs">{order.$id}</span></p>
                                    <p className="text-sm text-slate-500">Date: {new Date(order.$createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${(order.status || 'pending') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-slate-100 text-slate-800'
                                        }`}>
                                        {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{items.length} Item{items.length !== 1 ? 's' : ''}</p>
                                        <p className="text-sm text-slate-500 truncate max-w-md">{order.address}</p>
                                    </div>
                                    <p className="text-xl font-bold">${(order.total || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
