import { useEffect, useState } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Edit, LayoutGrid, List as ListIcon, Search } from 'lucide-react';
import { AppwriteImage } from '@/components/ui/AppwriteImage';

export default function AdminProducts() {
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
    const [salePrice, setSalePrice] = useState('');
    const [onSale, setOnSale] = useState(false);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

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
        }
    };

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
        setSalePrice(product.salePrice ? product.salePrice.toString() : '');
        setOnSale(product.onSale || false);
        setImageFiles(null);
        setExistingImages(product.images || []);
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
        setSalePrice('');
        setOnSale(false);
        setImageFiles(null);
        setExistingImages([]);
        const fileInput = document.getElementById('imageInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            const imageIds: string[] = [];
            if (imageFiles) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    try {
                        const fileUpload = await storage.createFile('products', ID.unique(), file);
                        imageIds.push(fileUpload.$id);
                    } catch (uploadError) {
                        console.error(`Failed to upload file ${i}:`, uploadError);
                    }
                }
            }


            const data: any = {
                name,
                description,
                price: parseFloat(price),
                category,
                size,
                quantity: parseInt(quantity),
                salePrice: onSale ? parseFloat(salePrice) : 0,
                onSale,
                status: parseInt(quantity) > 0 ? 'available' : 'sold'
            };

            if (imageIds.length > 0) {
                data.images = imageIds;
                data.imageId = imageIds[0];
            }

            if (editingId) {
                await databases.updateDocument('thrift_store', 'products', editingId, data);
                setEditingId(null);
            } else {
                await databases.createDocument('thrift_store', 'products', ID.unique(), data);
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

    const handleDeleteImage = async (imageId: string) => {
        if (!confirm('Delete this image?')) return;
        try {
            // Delete from storage
            await storage.deleteFile('products', imageId);

            // Update existing images state
            const updatedImages = existingImages.filter(id => id !== imageId);
            setExistingImages(updatedImages);

            // If editing, update the product document
            if (editingId) {
                await databases.updateDocument('thrift_store', 'products', editingId, {
                    images: updatedImages,
                    imageId: updatedImages[0] || null
                });
                fetchProducts();
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image');
        }
    };

    const handleSetPrimaryImage = async (imageId: string) => {
        if (!editingId) return;
        try {
            // Reorder images array with selected image first
            const reorderedImages = [
                imageId,
                ...existingImages.filter(id => id !== imageId)
            ];

            setExistingImages(reorderedImages);

            await databases.updateDocument('thrift_store', 'products', editingId, {
                images: reorderedImages,
                imageId: imageId
            });

            fetchProducts();
        } catch (error) {
            console.error('Failed to set primary image:', error);
            alert('Failed to set primary image');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Product Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create/Edit Product Form */}
                <div className={`bg-white p-6 rounded-lg border h-fit sticky top-8 ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
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

                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="onSale"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={onSale}
                                    onChange={e => setOnSale(e.target.checked)}
                                />
                                <label htmlFor="onSale" className="font-medium text-sm text-slate-900 cursor-pointer">
                                    Put this product on sale
                                </label>
                            </div>

                            {onSale && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sale Price ($)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={salePrice}
                                        onChange={e => setSalePrice(e.target.value)}
                                        placeholder="0.00"
                                        required={onSale}
                                    />
                                    {price && salePrice && (
                                        <p className="text-xs text-green-600 mt-1">
                                            {((1 - parseFloat(salePrice) / parseFloat(price)) * 100).toFixed(0)}% OFF
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                >
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    Manage categories in the <a href="/admin/categories" className="text-primary hover:underline">Categories page</a>
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

                        {/* Existing Images Gallery (Edit Mode) */}
                        {editingId && existingImages.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Current Images</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {existingImages.map((imageId, index) => (
                                        <div key={imageId} className="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
                                            <AppwriteImage fileId={imageId} alt={`Product image ${index + 1}`} />

                                            {/* Primary Badge */}
                                            {index === 0 && (
                                                <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    Primary
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                {index !== 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimaryImage(imageId)}
                                                        className="bg-white text-slate-700 px-2 py-1 rounded text-xs font-medium hover:bg-slate-100"
                                                        title="Set as primary"
                                                    >
                                                        ★ Primary
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage(imageId)}
                                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-600"
                                                    title="Delete image"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Hover over images to manage them. The first image is the primary image shown on product cards.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {editingId && existingImages.length > 0 ? 'Add More Images' : 'Product Images'}
                            </label>
                            <Input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => setImageFiles(e.target.files)}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {editingId ? 'Upload to add more images' : 'Hold Ctrl/Cmd to select multiple files'}
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
                                            <td className="px-4 py-3">
                                                {product.onSale ? (
                                                    <div>
                                                        <span className="text-red-600 font-bold">${product.salePrice?.toFixed(2)}</span>
                                                        <span className="text-slate-400 text-xs line-through ml-2">${product.price.toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    `$${product.price.toFixed(2)}`
                                                )}
                                            </td>
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
