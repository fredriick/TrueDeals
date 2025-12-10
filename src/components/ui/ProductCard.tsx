import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Models } from 'appwrite';
import { ShoppingBag, Heart } from 'lucide-react';
import { AppwriteImage } from './AppwriteImage';
import { StarRating } from './StarRating';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { useAuth } from '@/context/AuthContext';

interface Product extends Models.Document {
    name: string;
    description: string;
    price: number;
    imageId: string;
    category: string;
    size: string;
    status: string;
    salePrice?: number;
    onSale?: boolean;
}

interface ProductCardProps {
    product: Product;
}

import { useCart } from '@/context/useCart';

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCart((state) => state.addItem);
    const { user } = useAuth();
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistId, setWishlistId] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
        if (user) {
            checkWishlist();
        }
    }, [product.$id, user]);

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

    const checkWishlist = async () => {
        if (!user) return;
        try {
            const response = await databases.listDocuments('thrift_store', 'wishlist', [
                Query.equal('userId', user.$id),
                Query.equal('productId', product.$id)
            ]);
            if (response.documents.length > 0) {
                setIsInWishlist(true);
                setWishlistId(response.documents[0].$id);
            }
        } catch (error) {
            // Wishlist collection might not exist yet, silently fail
        }
    };

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please sign in to add items to your wishlist');
            return;
        }

        try {
            if (isInWishlist && wishlistId) {
                await databases.deleteDocument('thrift_store', 'wishlist', wishlistId);
                setIsInWishlist(false);
                setWishlistId(null);
            } else {
                const doc = await databases.createDocument('thrift_store', 'wishlist', ID.unique(), {
                    userId: user.$id,
                    productId: product.$id
                });
                setIsInWishlist(true);
                setWishlistId(doc.$id);
            }

            // Dispatch event to update navbar count
            window.dispatchEvent(new Event('wishlistUpdated'));
        } catch (error) {
            console.error('Failed to update wishlist:', error);
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

                {/* Sale Badge */}
                {product.onSale && product.quantity > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 animate-pulse">
                        SALE
                    </div>
                )}

                {/* Low Stock Badge (Only if not on sale or if on sale but quantity < 5) */}
                {product.quantity > 0 && product.quantity < 5 && !product.onSale && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        Only {product.quantity} left
                    </div>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform z-10"
                    title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
                    />
                </button>

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
                    <div>
                        {product.onSale && product.salePrice ? (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-black text-red-600">${product.salePrice.toFixed(2)}</p>
                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        {((1 - product.salePrice / product.price) * 100).toFixed(0)}% OFF
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 font-medium line-through decoration-slate-400 decoration-2">${product.price.toFixed(2)}</p>
                            </div>
                        ) : (
                            <p className="text-xl font-black text-primary">${product.price.toFixed(2)}</p>
                        )}
                    </div>
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
