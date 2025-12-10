import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useCart } from '@/context/useCart';
import { useAuth } from '@/context/AuthContext';
import { AppwriteImage } from '@/components/ui/AppwriteImage';
import { StarRating } from '@/components/ui/StarRating';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { addItem } = useCart();
    const { user } = useAuth();

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [filterRating, setFilterRating] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct(id);
            fetchReviews(id);
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

    const fetchReviews = async (productId: string) => {
        try {
            const response = await databases.listDocuments('thrift_store', 'reviews', [
                Query.equal('productId', productId),
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]);
            setReviews(response.documents);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !id) return;

        setSubmitting(true);
        try {
            await databases.createDocument('thrift_store', 'reviews', ID.unique(), {
                productId: id,
                userId: user.$id,
                userEmail: user.email,
                userName: user.name || user.email.split('@')[0],
                rating,
                title: reviewTitle,
                comment: reviewComment,
                verifiedPurchase: false, // TODO: Check if user actually purchased
                helpful: 0
            });

            // Reset form
            setRating(0);
            setReviewTitle('');
            setReviewComment('');

            // Refresh reviews
            fetchReviews(id);
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const filteredReviews = filterRating
        ? reviews.filter(r => r.rating === filterRating)
        : reviews;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length
    }));

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Link to="/shop" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
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
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((imgId: string) => (
                                <button
                                    key={imgId}
                                    onClick={() => setSelectedImage(imgId)}
                                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${(selectedImage === imgId || (!selectedImage && imgId === product.images[0]))
                                            ? 'border-primary'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <AppwriteImage fileId={imgId} alt={product.name} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-7 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                        <p className="text-slate-500 mt-2">{product.category} • {product.size}</p>
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <StarRating rating={averageRating} readonly size="sm" />
                                <span className="text-sm text-slate-600">
                                    {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-3xl font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <p>{product.description}</p>
                    </div>

                    <div className="pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-sm font-medium ${product.quantity === 0 ? 'text-red-600' :
                                    product.quantity < 5 ? 'text-yellow-600' :
                                        'text-green-600'
                                }`}>
                                {product.quantity === 0 ? 'Out of Stock' :
                                    product.quantity < 5 ? `Only ${product.quantity} left in stock!` :
                                        `In Stock (${product.quantity} available)`}
                            </span>
                        </div>
                        {product.quantity > 0 && product.quantity < 5 && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Low Stock Alert:</strong> Only {product.quantity} item{product.quantity !== 1 ? 's' : ''} remaining. Order soon!
                                </p>
                            </div>
                        )}
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

            {/* Reviews Section */}
            <div className="border-t pt-12">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                {/* Review Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
                        <StarRating rating={averageRating} readonly size="md" />
                        <p className="text-sm text-slate-500 mt-2">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        {ratingDistribution.map(({ star, count }) => (
                            <button
                                key={star}
                                onClick={() => setFilterRating(filterRating === star ? null : star)}
                                className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-50 ${filterRating === star ? 'bg-slate-100' : ''}`}
                            >
                                <span className="text-sm font-medium w-8">{star} ★</span>
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm text-slate-500 w-12">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Write Review Form */}
                {user ? (
                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating *</label>
                                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Title (optional)</label>
                                <Input
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    placeholder="Sum up your experience"
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Review *</label>
                                <textarea
                                    className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Share your thoughts about this product..."
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting || rating === 0}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-6 rounded-lg mb-8 text-center">
                        <p className="text-slate-600">
                            <Link to="/login" className="text-primary hover:underline">Sign in</Link> to write a review
                        </p>
                    </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                    {reviewsLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading reviews...</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            {filterRating ? 'No reviews with this rating' : 'No reviews yet. Be the first to review!'}
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.$id} className="border-b pb-6 last:border-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{review.userName}</span>
                                            {review.verifiedPurchase && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                    <BadgeCheck className="h-3 w-3" />
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <StarRating rating={review.rating} readonly size="sm" />
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {new Date(review.$createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {review.title && (
                                    <h4 className="font-semibold mb-2">{review.title}</h4>
                                )}
                                <p className="text-slate-700">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
