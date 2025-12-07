import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProductCard } from '@/components/ui/ProductCard';
import { Input } from '@/components/ui/Input';

export default function Shop() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        fetchProducts();
    }, [category]);

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
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Vintage">Vintage</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Accessories">Accessories</option>
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
