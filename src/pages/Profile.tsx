import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ID, Query } from 'appwrite';
import { Package, MapPin, Heart, Settings, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSearchParams } from 'react-router-dom';

type Tab = 'orders' | 'addresses' | 'wishlist' | 'settings';

export default function Profile() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab;
    const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'orders');
    const [loading, setLoading] = useState(true);

    // Orders
    const [orders, setOrders] = useState<any[]>([]);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    // Addresses
    const [addresses, setAddresses] = useState<any[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        isDefault: false
    });

    // Wishlist
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'orders') {
                await fetchOrders();
            } else if (activeTab === 'addresses') {
                await fetchAddresses();
            } else if (activeTab === 'wishlist') {
                await fetchWishlist();
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        const response = await databases.listDocuments('thrift_store', 'orders', [
            Query.equal('userId', user!.$id),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
        ]);
        setOrders(response.documents);
    };

    const fetchAddresses = async () => {
        const response = await databases.listDocuments('thrift_store', 'user_addresses', [
            Query.equal('userId', user!.$id),
            Query.limit(20)
        ]);
        setAddresses(response.documents);
    };

    const fetchWishlist = async () => {
        const response = await databases.listDocuments('thrift_store', 'wishlist', [
            Query.equal('userId', user!.$id),
            Query.limit(50)
        ]);
        setWishlist(response.documents);

        // Fetch product details with error handling
        const results = await Promise.all(
            response.documents.map(async (item) => {
                try {
                    const product = await databases.getDocument('thrift_store', 'products', item.productId);
                    return { status: 'fulfilled', product, wishlistId: item.$id };
                } catch (error) {
                    return { status: 'rejected', wishlistId: item.$id };
                }
            })
        );

        // Filter valid products
        const validItems = results
            .filter((r): r is { status: 'fulfilled', product: any, wishlistId: string } => r.status === 'fulfilled')
            .map(r => r.product);

        setWishlistProducts(validItems);

        // Cleanup orphans (items with deleted products)
        const orphans = results.filter(r => r.status === 'rejected');
        if (orphans.length > 0) {
            console.log(`Cleaning up ${orphans.length} orphaned wishlist items...`);
            await Promise.all(
                orphans.map(orphan =>
                    databases.deleteDocument('thrift_store', 'wishlist', orphan.wishlistId)
                )
            );
            // Update navbar count
            window.dispatchEvent(new Event('wishlistUpdated'));

            // Re-fetch wishlist to ensure state consistency (optional but cleaner)
            const validWishlistDocs = response.documents.filter(doc => !orphans.find(o => o.wishlistId === doc.$id));
            setWishlist(validWishlistDocs);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddressId) {
                await databases.updateDocument('thrift_store', 'user_addresses', editingAddressId, addressForm);
            } else {
                await databases.createDocument('thrift_store', 'user_addresses', ID.unique(), {
                    ...addressForm,
                    userId: user!.$id
                });
            }
            setShowAddressForm(false);
            setEditingAddressId(null);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Failed to save address:', error);
            alert('Failed to save address');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        try {
            await databases.deleteDocument('thrift_store', 'user_addresses', id);
            fetchAddresses();
        } catch (error) {
            console.error('Failed to delete address:', error);
        }
    };

    const handleEditAddress = (address: any) => {
        setEditingAddressId(address.$id);
        setAddressForm({
            name: address.name,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || '',
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
            country: address.country,
            isDefault: address.isDefault
        });
        setShowAddressForm(true);
    };

    const resetAddressForm = () => {
        setAddressForm({
            name: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'USA',
            isDefault: false
        });
    };

    const handleRemoveFromWishlist = async (wishlistId: string) => {
        try {
            await databases.deleteDocument('thrift_store', 'wishlist', wishlistId);
            fetchWishlist();

            // Dispatch event to update navbar count
            window.dispatchEvent(new Event('wishlistUpdated'));
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-slate-100 text-slate-800';
    };

    const tabs = [
        { id: 'orders' as Tab, label: 'Orders', icon: Package },
        { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
        { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
        { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            {/* Tabs */}
            <div className="border-b mb-6">
                <div className="flex gap-8">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-4 px-2 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-primary text-primary font-medium'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : (
                <>
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {orders.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No orders yet. Start shopping!
                                </div>
                            ) : (
                                orders.map(order => {
                                    // Robust item parsing
                                    let items: any[] = [];
                                    try {
                                        if (typeof order.items === 'string') {
                                            items = JSON.parse(order.items);
                                        } else if (Array.isArray(order.items)) {
                                            items = order.items.map((i: any) => typeof i === 'string' ? JSON.parse(i) : i);
                                        }
                                    } catch (e) {
                                        items = [];
                                    }

                                    return (
                                        <div key={order.$id} className="bg-white border rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Order #{order.$id.slice(0, 8)}</p>
                                                    <p className="text-sm text-slate-500">{new Date(order.$createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status || 'pending')}`}>
                                                    {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-lg">${order.total?.toFixed(2)}</p>
                                                    <p className="text-sm text-slate-500">{items.length} items</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setExpandedOrder(expandedOrder === order.$id ? null : order.$id)}
                                                >
                                                    {expandedOrder === order.$id ? 'Hide Details' : 'View Details'}
                                                </Button>
                                            </div>
                                            {expandedOrder === order.$id && (
                                                <div className="mt-4 pt-4 border-t space-y-3">
                                                    {items.map((item: any, index: number) => (
                                                        <div key={index} className="flex gap-3 text-sm">
                                                            <div className="flex-1">
                                                                <p className="font-medium">{item.name}</p>
                                                                <p className="text-slate-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    ))}
                                                    <div className="pt-3 border-t">
                                                        <p className="text-sm text-slate-600"><strong>Shipping Address:</strong> {order.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Saved Addresses</h2>
                                <Button onClick={() => setShowAddressForm(!showAddressForm)}>
                                    {showAddressForm ? 'Cancel' : '+ Add Address'}
                                </Button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleSaveAddress} className="bg-white border rounded-lg p-6 mb-6">
                                    <h3 className="font-bold mb-4">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Address Name</label>
                                            <Input
                                                value={addressForm.name}
                                                onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                                                placeholder="Home, Work, etc."
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Address Line 1</label>
                                            <Input
                                                value={addressForm.addressLine1}
                                                onChange={e => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                                            <Input
                                                value={addressForm.addressLine2}
                                                onChange={e => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">City</label>
                                            <Input
                                                value={addressForm.city}
                                                onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">State</label>
                                            <Input
                                                value={addressForm.state}
                                                onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                            <Input
                                                value={addressForm.zipCode}
                                                onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Country</label>
                                            <Input
                                                value={addressForm.country}
                                                onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button type="submit">Save Address</Button>
                                        <Button type="button" variant="outline" onClick={() => {
                                            setShowAddressForm(false);
                                            setEditingAddressId(null);
                                            resetAddressForm();
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.length === 0 ? (
                                    <div className="col-span-2 text-center py-12 text-slate-500">
                                        No saved addresses. Add one to speed up checkout!
                                    </div>
                                ) : (
                                    addresses.map(address => (
                                        <div key={address.$id} className="bg-white border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold">{address.name}</h3>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditAddress(address)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(address.$id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">{address.addressLine1}</p>
                                            {address.addressLine2 && <p className="text-sm text-slate-600">{address.addressLine2}</p>}
                                            <p className="text-sm text-slate-600">
                                                {address.city}, {address.state} {address.zipCode}
                                            </p>
                                            <p className="text-sm text-slate-600">{address.country}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Wishlist Tab */}
                    {activeTab === 'wishlist' && (
                        <div>
                            {wishlistProducts.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    Your wishlist is empty. Start adding favorites!
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistProducts.map((product, index) => (
                                        <div key={product.$id} className="relative">
                                            <ProductCard product={product} />
                                            <button
                                                onClick={() => handleRemoveFromWishlist(wishlist[index].$id)}
                                                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 z-10"
                                                title="Remove from wishlist"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="bg-white border rounded-lg p-6 max-w-2xl">
                            <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <Input value={user?.name || ''} disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input value={user?.email || ''} disabled />
                                </div>
                                <p className="text-sm text-slate-500">
                                    To update your account information, please contact support.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
