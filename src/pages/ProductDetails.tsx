import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/useCart';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();

    useEffect(() => {
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            const doc = await databases.getDocument('thrift_store', 'products', productId);
            setProduct(doc);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/shop" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xl">
                    {product.imageId ? 'Image' : 'No Image'}
                </div>

                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                        <p className="text-slate-500 mt-2">{product.category} • {product.size}</p>
                    </div>

                    <div className="text-3xl font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p>{product.description}</p>
                    </div>

                    <div className="pt-6 border-t">
                        {product.status === 'available' ? (
                            <Button size="lg" className="w-full md:w-auto" onClick={() => addItem(product)}>
                                Add to Cart
                            </Button>
                        ) : (
                            <Button size="lg" disabled className="w-full md:w-auto">
                                Sold Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
