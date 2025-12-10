import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Edit } from 'lucide-react';

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'categories', [
                Query.orderAsc('name'),
                Query.limit(100)
            ]);
            setCategories(response.documents);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        setLoading(true);
        try {
            if (editingId) {
                // Update existing category
                await databases.updateDocument('thrift_store', 'categories', editingId, {
                    name: categoryName.trim()
                });
            } else {
                // Create new category
                await databases.createDocument('thrift_store', 'categories', ID.unique(), {
                    name: categoryName.trim()
                });
            }

            setCategoryName('');
            setEditingId(null);
            fetchCategories();
        } catch (error: any) {
            console.error('Failed to save category:', error);
            alert(`Failed to save category: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: any) => {
        setEditingId(category.$id);
        setCategoryName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCategoryName('');
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This won't affect existing products using this category.`)) return;

        try {
            await databases.deleteDocument('thrift_store', 'categories', id);
            setCategories(categories.filter(c => c.$id !== id));
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category. It might be in use.');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
                <p className="text-slate-500 mt-1">Manage product categories for your store</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add/Edit Category Form */}
                <div className={`bg-white p-6 rounded-lg border h-fit ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                        {editingId && (
                            <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="text-slate-500">
                                Cancel
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category Name</label>
                            <Input
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                placeholder="e.g., Vintage, Streetwear"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Saving...' : (editingId ? 'Update Category' : 'Create Category')}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Categories are used to organize your products.
                            Deleting a category won't affect existing products.
                        </p>
                    </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="p-4 border-b bg-slate-50">
                            <h2 className="text-lg font-bold">All Categories ({categories.length})</h2>
                        </div>

                        {categories.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="mb-4">
                                    <svg className="h-16 w-16 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium">No categories yet</p>
                                <p className="text-sm mt-1">Create your first category to get started</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {categories.map(category => (
                                    <div key={category.$id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{category.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Created {new Date(category.$createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit category"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.$id, category.name)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-slate-500">Total Categories</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <p className="text-sm text-slate-500">Most Recent</p>
                            <p className="text-lg font-semibold text-slate-900 mt-1 truncate">
                                {categories.length > 0 ? categories[categories.length - 1]?.name : 'None'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
