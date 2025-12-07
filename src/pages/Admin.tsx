import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Vintage');
    const [size, setSize] = useState('M');
    const [imageId, setImageId] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
        fetchProducts();
    }, [user, authLoading]);

    const fetchProducts = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'products', [
                Query.orderDesc('$createdAt')
            ]);
            setProducts(response.documents);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            // Done
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await databases.createDocument(
                'thrift_store',
                'products',
                ID.unique(),
                {
                    name,
                    description,
                    price: parseFloat(price),
                    category,
                    size,
                    imageId,
                    status: 'available'
                }
            );
            // Reset form
            setName('');
            setDescription('');
            setPrice('');
            setImageId('');
            fetchProducts();
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product');
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Product Form */}
                <div className="bg-white p-6 rounded-lg border h-fit">
                    <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
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
                        <div>
                            <label className="block text-sm font-medium mb-1">Price</label>
                            <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option>Vintage</option>
                                    <option>Streetwear</option>
                                    <option>Accessories</option>
                                </select>
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
                            <label className="block text-sm font-medium mb-1">Image ID (Optional)</label>
                            <Input value={imageId} onChange={e => setImageId(e.target.value)} placeholder="File ID from Storage" />
                        </div>
                        <Button type="submit" className="w-full">Create Product</Button>
                    </form>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Products ({products.length})</h2>
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.$id} className="border-b last:border-0">
                                        <td className="px-4 py-3">{product.name}</td>
                                        <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(product.$id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
