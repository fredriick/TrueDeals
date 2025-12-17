import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { AppwriteImage } from '@/components/ui/AppwriteImage';
import { Eye, MousePointerClick, TrendingUp, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAnalytics() {
    const [mostViewed, setMostViewed] = useState<any[]>([]);
    const [mostClicked, setMostClicked] = useState<any[]>([]);
    const [totalStats, setTotalStats] = useState({ totalViews: 0, totalClicks: 0 });
    const [loading, setLoading] = useState(true);
    const [showViewCounts, setShowViewCounts] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        checkViewCountSetting();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [viewed, clicked, stats] = await Promise.all([
                analyticsService.getMostViewedProducts(10),
                analyticsService.getMostClickedProducts(10),
                analyticsService.getTotalStats()
            ]);

            setMostViewed(viewed);
            setMostClicked(clicked);
            setTotalStats(stats);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkViewCountSetting = async () => {
        const shouldShow = await analyticsService.shouldShowViewCounts();
        setShowViewCounts(shouldShow);
    };

    const toggleViewCountVisibility = async () => {
        setUpdating(true);
        try {
            await analyticsService.updateViewCountVisibility(!showViewCounts);
            setShowViewCounts(!showViewCounts);
            alert(`View counts ${!showViewCounts ? 'enabled' : 'disabled'} for customers`);
        } catch (error) {
            console.error('Failed to update setting:', error);
            alert('Failed to update setting');
        } finally {
            setUpdating(false);
        }
    };

    const calculateCTR = () => {
        if (totalStats.totalViews === 0) return 0;
        return ((totalStats.totalClicks / totalStats.totalViews) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Product Analytics</h1>
                    <p className="text-slate-600 mt-1">Track product performance and customer engagement</p>
                </div>

                {/* View Count Toggle */}
                <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-slate-600" />
                        <div className="flex-1">
                            <p className="font-medium text-sm">Show View Counts to Customers</p>
                            <p className="text-xs text-slate-500">Display view counters on product pages</p>
                        </div>
                        <button
                            onClick={toggleViewCountVisibility}
                            disabled={updating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showViewCounts ? 'bg-blue-600' : 'bg-gray-200'
                                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showViewCounts ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Views</p>
                            <p className="text-2xl font-bold">{analyticsService.formatCount(totalStats.totalViews)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MousePointerClick className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Clicks</p>
                            <p className="text-2xl font-bold">{analyticsService.formatCount(totalStats.totalClicks)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Click-Through Rate</p>
                            <p className="text-2xl font-bold">{calculateCTR()}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Viewed Products */}
                <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Eye className="w-5 h-5 text-blue-600" />
                            Most Viewed Products
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Top 10 products by view count</p>
                    </div>
                    <div className="p-6">
                        {mostViewed.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No data available yet</p>
                        ) : (
                            <div className="space-y-4">
                                {mostViewed.map((product, index) => (
                                    <Link
                                        key={product.$id}
                                        to={`/product/${product.$id}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                        </div>
                                        <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                            {product.imageId ? (
                                                <AppwriteImage fileId={product.imageId} alt={product.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.name}</p>
                                            <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-blue-600">
                                                {analyticsService.formatCount(product.viewCount)}
                                            </p>
                                            <p className="text-xs text-slate-500">views</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Most Clicked Products */}
                <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MousePointerClick className="w-5 h-5 text-purple-600" />
                            Most Clicked Products
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Top 10 products by click count</p>
                    </div>
                    <div className="p-6">
                        {mostClicked.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No data available yet</p>
                        ) : (
                            <div className="space-y-4">
                                {mostClicked.map((product, index) => (
                                    <Link
                                        key={product.$id}
                                        to={`/product/${product.$id}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                                        </div>
                                        <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                            {product.imageId ? (
                                                <AppwriteImage fileId={product.imageId} alt={product.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{product.name}</p>
                                            <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-purple-600">
                                                {analyticsService.formatCount(product.clickCount)}
                                            </p>
                                            <p className="text-xs text-slate-500">clicks</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
