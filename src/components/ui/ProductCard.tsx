import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Models } from 'appwrite';
import { ShoppingBag } from 'lucide-react';
import { AppwriteImage } from './AppwriteImage';
import { StarRating } from './StarRating';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

interface Product extends Models.Document {
    name: string;
    description: string;
    price: number;
    imageId: string;
    category: string;
    size: string;
    status: string;
}

interface ProductCardProps {
    product: Product;
}

import { useCart } from '@/context/useCart';

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCart((state) => state.addItem);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        fetchReviews();
    }, [product.$id]);

    const fetchReviews = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'reviews', [
                Query.equal('productId', product.$id),
                Query.limit(100)
            ]);
            const reviews = response.documents;
            if (reviews.length > 0) {
                const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                setAverageRating(avg);
                setReviewCount(reviews.length);
            }
        } catch (error) {
            // Reviews collection might not exist yet, silently fail
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        addItem(product);
        alert('Added to cart!');
    };

    return (
        <div className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <AppwriteImage fileId={product.images[0]} alt={product.name} />
                ) : product.imageId ? (
                    <AppwriteImage fileId={product.imageId} alt={product.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 font-medium">
                        No Image
                    </div>
                )}

                {/* Out of Stock Badge */}
                {product.quantity === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg">
                            Out of Stock
                        </span>
                    </div>
                )}

                {/* Low Stock Badge */}
                {product.quantity > 0 && product.quantity < 5 && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Only {product.quantity} left
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">{product.category}</p>
                        <h3 className="text-lg font-bold text-primary truncate leading-tight group-hover:text-accent transition-colors">
                            <Link to={`/product/${product.$id}`}>
                                <span aria-hidden="true" className="absolute inset-0" />
                                {product.name}
                            </Link>
                        </h3>
                        {reviewCount > 0 && (
                            <div className="mt-1">
                                <StarRating rating={averageRating} readonly size="sm" showCount count={reviewCount} />
                            </div>
                        )}
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                        {product.size}
                    </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-primary">${product.price.toFixed(2)}</p>
                    <Button
                        size="sm"
                        className="z-10 relative rounded-full h-10 w-10 p-0 bg-primary hover:bg-accent transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={product.quantity === 0}
                        title={product.quantity === 0 ? 'Out of stock' : 'Add to cart'}
                    >
                        <ShoppingBag className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
