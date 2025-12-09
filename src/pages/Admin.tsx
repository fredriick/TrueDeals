import { useEffect, useState } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, LayoutGrid, List as ListIcon, Search } from 'lucide-react';
import { AppwriteImage } from '@/components/ui/AppwriteImage';

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Vintage');
    const [size, setSize] = useState('M');
    const [quantity, setQuantity] = useState('1');
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);

    const [categories, setCategories] = useState<string[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
                return;
            }

            // Check if user is admin
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            if (adminEmail && user.email !== adminEmail) {
                alert('Access Denied: You are not an administrator.');
                navigate('/');
                return;
            }

            fetchProducts();
            fetchCategories();
            fetchOrders();
        }
    }, [user, authLoading]);

    const fetchProducts = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'products', [
                Query.orderDesc('$createdAt')
            ]);
            setProducts(response.documents);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'categories', [
                Query.limit(100),
                Query.orderAsc('name')
            ]);
            setCategories(['All', ...response.documents.map(d => d.name)]);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Fallback to extracting from products if fails (e.g. during migration)
            // But we expect it to work now.
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'orders', [
                Query.limit(1000)
            ]);
            setOrders(response.documents);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };

    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.quantity < 5).length;

    // const uniqueCategories = ['All', ...new Set(products.map(p => p.category))]; // Deprecated

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (product: any) => {
        setEditingId(product.$id);
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setCategory(product.category);
        setSize(product.size);
        setQuantity(product.quantity.toString());
        setImageFiles(null); // Keep existing images unless new ones are uploaded

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Vintage');
        setSize('M');
        setQuantity('1');
        setImageFiles(null);
        const fileInput = document.getElementById('imageInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            const imageIds: string[] = [];
            if (imageFiles) {
                console.log('Uploading images:', imageFiles.length);
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    try {
                        const fileUpload = await storage.createFile(
                            'products',
                            ID.unique(),
                            file
                        );
                        imageIds.push(fileUpload.$id);
                    } catch (uploadError) {
                        console.error(`Failed to upload file ${i}:`, uploadError);
                    }
                }
            }

            // Check if category exists in our list (excluding 'All')
            // Note: categories state includes 'All', so we check if it's in there.
            const existingCategory = categories.find(c => c.toLowerCase() === category.toLowerCase());

            if (!existingCategory && category.trim() !== '') {
                try {
                    await databases.createDocument('thrift_store', 'categories', ID.unique(), {
                        name: category
                    });
                    // Update local state immediately so we don't need to re-fetch
                    setCategories(prev => [...prev, category].sort());
                } catch (catError) {
                    console.error('Failed to create new category:', catError);
                }
            }

            const data: any = {
                name,
                description,
                price: parseFloat(price),
                category,
                size,
                quantity: parseInt(quantity),
                status: parseInt(quantity) > 0 ? 'available' : 'sold'
            };

            if (imageIds.length > 0) {
                data.images = imageIds;
                data.imageId = imageIds[0]; // Backward compatibility
            }

            if (editingId) {
                // Update existing product
                // Note: We are appending new images. To replace, we'd need logic to delete old ones or manage the array explicitly.
                // For simplicity, if new images are uploaded, we append them. 
                // Ideally, we should fetch current product to merge images, but Appwrite update is a PATCH usually? 
                // Actually updateDocument replaces the passed fields. 
                // If we want to keep old images when not uploading new ones, we don't send 'images' key.
                // If we upload new ones, we might want to append or replace. Let's assume replace for now or just add.
                // Let's fetch the current document to merge images if needed, or just rely on what we send.
                // If imageIds is empty, we don't send it, so old images remain.

                if (imageIds.length > 0) {
                    // If user uploaded new images, let's append them to existing ones? 
                    // Or maybe just replace? Let's replace for a "clean slate" feel or append?
                    // Let's just send what we have. If imageIds is empty, we don't include it in data.
                }

                await databases.updateDocument(
                    'thrift_store',
                    'products',
                    editingId,
                    data
                );
                setEditingId(null);
            } else {
                // Create new product
                if (imageIds.length === 0) {
                    // Allow creation without image? Or require it?
                    // data.images = [];
                }
                await databases.createDocument(
                    'thrift_store',
                    'products',
                    ID.unique(),
                    data
                );
            }

            resetForm();
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            alert(`Failed to save product: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await databases.deleteDocument('thrift_store', 'products', id);
            setProducts(products.filter(p => p.$id !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    if (authLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">From {totalOrders} orders</p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Total Orders</p>
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
                    <p className="text-xs text-slate-500 mt-1">All time</p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Total Products</p>
                        <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
                    <p className="text-xs text-slate-500 mt-1">In inventory</p>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-500">Low Stock Alert</p>
                        <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{lowStockProducts}</p>
                    <p className="text-xs text-slate-500 mt-1">Products &lt; 5 units</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create/Edit Product Form */}
                <div className={`bg-white p-6 rounded-lg border h-fit sticky top-24 ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        {editingId && (
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-500">
                                Cancel
                            </Button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                <Input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <Input
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    list="category-options"
                                    placeholder="Select or type category"
                                    required
                                />
                                <datalist id="category-options">
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat} />
                                    ))}
                                </datalist>
                                <p className="text-xs text-slate-500 mt-1">
                                    Type a new name to create a new category.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Size</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={size}
                                    onChange={e => setSize(e.target.value)}
                                >
                                    <option>XS</option>
                                    <option>S</option>
                                    <option>M</option>
                                    <option>L</option>
                                    <option>XL</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Images</label>
                            <Input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => setImageFiles(e.target.files)}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {editingId ? 'Upload to add/replace images' : 'Hold Ctrl/Cmd to select multiple files'}
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={uploading}>
                            {uploading ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
                        </Button>
                    </form>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold">Products ({filteredProducts.length})</h2>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="border rounded-md px-3 py-2 text-sm bg-white"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Category</th>
                                        <th className="px-4 py-3 font-medium">Price</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product.$id} className="border-b last:border-0">
                                            <td className="px-4 py-3 font-medium">{product.name}</td>
                                            <td className="px-4 py-3 text-slate-500">{product.category}</td>
                                            <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.$id)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <div key={product.$id} className="bg-white border rounded-lg overflow-hidden flex flex-col group">
                                    <div className="aspect-square bg-slate-100 relative">
                                        {product.images && product.images.length > 0 ? (
                                            <AppwriteImage fileId={product.images[0]} alt={product.name} />
                                        ) : product.imageId ? (
                                            <AppwriteImage fileId={product.imageId} alt={product.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-white/90 p-1.5 rounded-full text-blue-600 hover:text-blue-800 shadow-sm"
                                            >
                                                <Edit className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.$id)}
                                                className="bg-white/90 p-1.5 rounded-full text-red-500 hover:text-red-700 shadow-sm"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 flex-1 flex flex-col">
                                        <div className="mb-1">
                                            <h3 className="font-bold text-xs truncate" title={product.name}>{product.name}</h3>
                                            <p className="text-[10px] text-slate-500 truncate">{product.category}</p>
                                        </div>
                                        <div className="mt-auto flex justify-between items-end">
                                            <span className="font-bold text-sm text-slate-900">${product.price.toFixed(2)}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                Qty: {product.quantity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
