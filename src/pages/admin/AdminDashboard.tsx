import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { DollarSign, ShoppingBag, Package, AlertTriangle, Plus, Tag } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        lowStock: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Orders for Revenue & Count
                const ordersResponse = await databases.listDocuments('thrift_store', 'orders', [
                    Query.limit(100), // Limit for performance in demo
                    Query.orderDesc('$createdAt')
                ]);

                const totalRevenue = ordersResponse.documents.reduce((sum, order) => sum + (order.total || 0), 0);

                // 2. Fetch Products for Count & Low Stock
                const productsResponse = await databases.listDocuments('thrift_store', 'products', [
                    Query.limit(100)
                ]);

                const lowStockCount = productsResponse.documents.filter((p: any) => p.quantity < 5).length;

                setStats({
                    revenue: totalRevenue,
                    orders: ordersResponse.total,
                    products: productsResponse.total,
                    lowStock: lowStockCount
                });

                setRecentOrders(ordersResponse.documents.slice(0, 5));

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                        <h3 className="text-2xl font-black text-slate-900">${stats.revenue.toFixed(2)}</h3>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <DollarSign className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Orders</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.orders}</h3>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Products</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.products}</h3>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Package className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alert</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.lowStock}</h3>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-lg">Recent Orders</h2>
                        <Link to="/admin/orders">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Order ID</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.$id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{order.$id.substring(0, 8)}</td>
                                        <td className="px-6 py-4 font-medium">{order.userEmail}</td>
                                        <td className="px-6 py-4">${order.total?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize
                                                ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(order.$createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-fit">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="font-bold text-lg">Quick Actions</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link to="/admin/products">
                            <Button className="w-full justify-start gap-2" size="lg">
                                <Plus className="h-5 w-5" />
                                Add New Product
                            </Button>
                        </Link>
                        <Link to="/admin/coupons">
                            <Button variant="outline" className="w-full justify-start gap-2" size="lg">
                                <Tag className="h-5 w-5" />
                                Create Coupon
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
