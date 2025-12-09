import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { AppwriteImage } from '@/components/ui/AppwriteImage';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link to="/shop" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                <div className="md:col-span-5 space-y-4">
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border">
                        {product.images && product.images.length > 0 ? (
                            <AppwriteImage fileId={selectedImage || product.images[0]} alt={product.name} />
                        ) : product.imageId ? (
                            <AppwriteImage fileId={product.imageId} alt={product.name} />
                        ) : (
                            <span className="text-slate-400 text-xl">No Image</span>
                        )}
                    </div>
                    {/* Thumbnail Gallery */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((imgId: string) => (
                                <button
                                    key={imgId}
                                    onClick={() => setSelectedImage(imgId)}
                                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${(selectedImage === imgId || (!selectedImage && imgId === product.images[0]))
                                        ? 'border-primary'
                                        : 'border-transparent hover:border-slate-300'
                                        }`}
                                >
                                    <AppwriteImage fileId={imgId} alt="Thumbnail" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-7 space-y-6">
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
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-sm font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {product.quantity > 0 ? `In Stock (${product.quantity})` : 'Out of Stock'}
                            </span>
                        </div>
                        {product.quantity > 0 ? (
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
