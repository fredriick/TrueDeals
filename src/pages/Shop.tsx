import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProductCard } from '@/components/ui/ProductCard';
import { Input } from '@/components/ui/Input';
import { useSearchParams } from 'react-router-dom';

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<string[]>([]);

    const categoryParam = searchParams.get('category');
    const [category, setCategory] = useState(categoryParam || 'All');

    useEffect(() => {
        if (categoryParam) {
            setCategory(categoryParam);
        }
    }, [categoryParam]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [category]);

    const fetchCategories = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'categories', [
                Query.limit(100),
                Query.orderAsc('name')
            ]);
            const uniqueCategories = ['All', ...response.documents.map(d => d.name)];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let queries = [
                Query.equal('status', 'available')
            ];

            if (category !== 'All') {
                queries.push(Query.equal('category', category));
            }

            const response = await databases.listDocuments(
                'thrift_store',
                'products',
                queries
            );
            setProducts(response.documents);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        if (newCategory === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', newCategory);
        }
        setSearchParams(searchParams);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Shop</h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                    <select
                        className="border rounded-md px-3 py-2"
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                        {categories.length > 0 ? (
                            categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))
                        ) : (
                            <>
                                <option value="All">All Categories</option>
                                <option value={category}>{category}</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.$id} product={product} />
                    ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                    No products found.
                </div>
            )}
        </div>
    );
}
