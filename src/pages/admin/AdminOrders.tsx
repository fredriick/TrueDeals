import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Search, Eye, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { AppwriteImage } from '@/components/ui/AppwriteImage';
import { orderStatusService } from '@/services/orderStatusService';
import { emailService } from '@/services/emailService';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: '', carrier: 'UPS', estimatedDelivery: '' });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchQuery, statusFilter]);

    const fetchOrders = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'orders', [
                Query.orderDesc('$createdAt'),
                Query.limit(1000)
            ]);
            setOrders(response.documents);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => (order.status || 'pending') === statusFilter);
        }

        // Filter by search query (email or order ID)
        if (searchQuery.trim()) {
            filtered = filtered.filter(order =>
                order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.$id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // Use orderStatusService to update status and create history
            await orderStatusService.updateOrderStatus(orderId, newStatus, 'admin', `Status updated to ${newStatus}`);

            // Update local state
            setOrders(orders.map(order =>
                order.$id === orderId ? { ...order, status: newStatus } : order
            ));

            if (selectedOrder?.$id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }

            // Send email notification based on status
            const order = orders.find(o => o.$id === orderId);
            if (order) {
                const emailData = {
                    orderId: order.$id,
                    orderNumber: order.$id.slice(-8).toUpperCase(),
                    customerName: order.userName || 'Customer',
                    customerEmail: order.userEmail,
                    total: order.total,
                    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
                    trackingNumber: order.trackingNumber,
                    carrier: order.carrier,
                    estimatedDelivery: order.estimatedDelivery
                };

                if (newStatus === 'shipped') {
                    await emailService.sendShippingNotification(emailData);
                } else if (newStatus === 'delivered') {
                    await emailService.sendDeliveryConfirmation(emailData);
                } else if (newStatus === 'cancelled') {
                    await emailService.sendCancellationNotification(emailData);
                }
            }

            alert('Order status updated successfully!');
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to update order status');
        }
    };

    const addTrackingInfo = async (orderId: string) => {
        if (!trackingInfo.trackingNumber || !trackingInfo.carrier) {
            alert('Please enter tracking number and carrier');
            return;
        }

        try {
            await orderStatusService.addTrackingInfo(orderId, trackingInfo);

            // Update local state
            setOrders(orders.map(order =>
                order.$id === orderId ? { ...order, ...trackingInfo } : order
            ));

            if (selectedOrder?.$id === orderId) {
                setSelectedOrder({ ...selectedOrder, ...trackingInfo });
            }

            setTrackingInfo({ trackingNumber: '', carrier: 'UPS', estimatedDelivery: '' });
            alert('Tracking information added successfully!');
        } catch (error) {
            console.error('Failed to add tracking info:', error);
            alert('Failed to add tracking information');
        }
    };

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            out_for_delivery: 'bg-pink-100 text-pink-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-slate-100 text-slate-800';
    };

    const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

    if (loading) {
        return <div className="p-8 text-center">Loading orders...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Order Management</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by customer email or order ID..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="border rounded-md px-4 py-2 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-slate-500">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">
                        {orders.filter(o => (o.status || 'pending') === 'pending').length}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">Processing</p>
                    <p className="text-2xl font-bold text-blue-800">
                        {orders.filter(o => o.status === 'processing').length}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">Shipped</p>
                    <p className="text-2xl font-bold text-purple-800">
                        {orders.filter(o => o.status === 'shipped').length}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">Delivered</p>
                    <p className="text-2xl font-bold text-green-800">
                        {orders.filter(o => o.status === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Order ID</th>
                            <th className="px-4 py-3 text-left font-medium">Customer</th>
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-left font-medium">Items</th>
                            <th className="px-4 py-3 text-left font-medium">Total</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.$id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs">{order.$id.slice(0, 8)}...</span>
                                    </td>
                                    <td className="px-4 py-3">{order.userEmail || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        {new Date(order.$createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">{order.items?.length || 0}</td>
                                    <td className="px-4 py-3 font-semibold">${order.total?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="View details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Order Details</h2>
                                <p className="text-sm text-slate-500 font-mono">{selectedOrder.$id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-slate-100 rounded-md"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                    <p><span className="font-medium">Email:</span> {selectedOrder.userEmail || 'N/A'}</p>
                                    <p><span className="font-medium">Shipping Address:</span> {selectedOrder.address}</p>
                                    <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.$createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Order Status</h3>
                                <div className="flex items-center gap-4">
                                    <select
                                        className="border rounded-md px-4 py-2 bg-white"
                                        value={selectedOrder.status || 'pending'}
                                        onChange={(e) => updateOrderStatus(selectedOrder.$id, e.target.value as OrderStatus)}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status || 'pending')}`}>
                                        Current: {(selectedOrder.status || 'pending').split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking Information */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Tracking Information
                                </h3>
                                {selectedOrder.trackingNumber ? (
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
                                        <p><span className="font-medium">Tracking Number:</span> <span className="font-mono">{selectedOrder.trackingNumber}</span></p>
                                        <p><span className="font-medium">Carrier:</span> {selectedOrder.carrier}</p>
                                        {selectedOrder.estimatedDelivery && (
                                            <p><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                        <p className="text-sm text-slate-600">No tracking information added yet</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                                                <Input
                                                    type="text"
                                                    placeholder="1Z999AA10123456784"
                                                    value={trackingInfo.trackingNumber}
                                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Carrier</label>
                                                <select
                                                    className="w-full border rounded-md px-3 py-2 bg-white"
                                                    value={trackingInfo.carrier}
                                                    onChange={(e) => setTrackingInfo({ ...trackingInfo, carrier: e.target.value })}
                                                >
                                                    <option value="UPS">UPS</option>
                                                    <option value="FedEx">FedEx</option>
                                                    <option value="DHL">DHL</option>
                                                    <option value="USPS">USPS</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Estimated Delivery (Optional)</label>
                                            <Input
                                                type="date"
                                                value={trackingInfo.estimatedDelivery}
                                                onChange={(e) => setTrackingInfo({ ...trackingInfo, estimatedDelivery: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            onClick={() => addTrackingInfo(selectedOrder.$id)}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Add Tracking Info
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Payment & Coupon Info */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Payment & Discount</h3>
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
                                    <p><span className="font-medium">Payment Ref:</span> <span className="font-mono">{selectedOrder.paymentReference || 'N/A'}</span></p>
                                    <p><span className="font-medium">Coupon Used:</span> {selectedOrder.couponCode || 'None'}</p>
                                    <p><span className="font-medium">Discount:</span> -${selectedOrder.discount?.toFixed(2) || '0.00'}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                                <div className="space-y-3">
                                    {(() => {
                                        let items: any[] = [];
                                        try {
                                            if (typeof selectedOrder.items === 'string') {
                                                items = JSON.parse(selectedOrder.items);
                                            } else if (Array.isArray(selectedOrder.items)) {
                                                items = selectedOrder.items.map((i: any) => typeof i === 'string' ? JSON.parse(i) : i);
                                            }
                                        } catch (e) {
                                            console.error('Error parsing items', e);
                                        }

                                        return items.map((item: any, index: number) => (
                                            <div key={index} className="flex gap-4 p-3 border rounded-lg">
                                                <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.imageId ? <AppwriteImage fileId={item.imageId} alt={item.name} /> : <span className="text-xs text-slate-400">No Img</span>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                                    <p className="text-sm text-slate-500">Price: ${item.price?.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Order Total */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total</span>
                                    <span>${selectedOrder.total?.toFixed(2) || '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
