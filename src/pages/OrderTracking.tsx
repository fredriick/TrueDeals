import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '@/lib/appwrite';
import { orderStatusService } from '@/services/orderStatusService';
import { OrderTimeline, TimelineItem } from '@/components/ui/OrderTimeline';
import { Button } from '@/components/ui/Button';
import { Package, Truck, MapPin, Calendar, ExternalLink } from 'lucide-react';

export default function OrderTracking() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<any>(null);
    const [statusHistory, setStatusHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const orderData = await orderStatusService.getOrderWithHistory(orderId!);
            setOrder(orderData);
            setStatusHistory(orderData.statusHistory || []);
        } catch (err: any) {
            setError('Order not found or you do not have permission to view it.');
        } finally {
            setLoading(false);
        }
    };

    const getTimelineItems = (): TimelineItem[] => {
        const statuses = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
        const currentStatusIndex = statuses.indexOf(order?.status || 'pending');

        return statuses.map((status, index) => {
            const historyEntry = statusHistory.find(h => h.status === status);
            const isCompleted = index <= currentStatusIndex;
            const isActive = index === currentStatusIndex;

            return {
                status: isCompleted ? 'completed' : isActive ? 'active' : 'pending',
                title: status.split('_').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '),
                timestamp: historyEntry?.timestamp,
                details: historyEntry?.notes,
                estimate: !isCompleted && index === currentStatusIndex + 1 && order?.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString()
                    : undefined
            };
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading order details...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Package className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                <p className="text-slate-600 mb-6">{error}</p>
                <Link to="/orders">
                    <Button>View All Orders</Button>
                </Link>
            </div>
        );
    }

    // Parse items safely
    let items: any[] = [];
    try {
        if (typeof order.items === 'string') {
            items = JSON.parse(order.items);
        } else if (Array.isArray(order.items)) {
            items = order.items.map((i: any) => typeof i === 'string' ? JSON.parse(i) : i);
        }
    } catch (e) {
        console.error('Error parsing order items:', e);
    }

    const trackingUrl = order.trackingNumber && order.carrier
        ? orderStatusService.getCarrierTrackingUrl(order.carrier, order.trackingNumber)
        : null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link to="/orders" className="text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to Orders
                </Link>
                <h1 className="text-3xl font-bold">Order Tracking</h1>
                <p className="text-slate-600 mt-2">Order #{order.$id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Timeline */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg border p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-6">Order Status</h2>
                        <OrderTimeline items={getTimelineItems()} />
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-lg border p-6 shadow-sm mt-6">
                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-3 border-t-2 font-bold text-lg">
                                <span>Total</span>
                                <span>${(order.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Tracking Info */}
                    {order.trackingNumber && (
                        <div className="bg-white rounded-lg border p-6 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Tracking Information
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-slate-500">Tracking Number</p>
                                    <p className="font-mono text-sm">{order.trackingNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Carrier</p>
                                    <p className="font-medium">{order.carrier}</p>
                                </div>
                                {trackingUrl && (
                                    <a
                                        href={trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                                    >
                                        Track on {order.carrier} <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div className="bg-white rounded-lg border p-6 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Delivery Address
                        </h3>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{order.address}</p>
                    </div>

                    {/* Estimated Delivery */}
                    {order.estimatedDelivery && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-900">
                                <Calendar className="w-5 h-5" />
                                Estimated Delivery
                            </h3>
                            <p className="text-lg font-semibold text-blue-700">
                                {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Order Date */}
                    <div className="bg-white rounded-lg border p-6 shadow-sm">
                        <h3 className="font-bold mb-2">Order Date</h3>
                        <p className="text-slate-700">
                            {new Date(order.$createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
