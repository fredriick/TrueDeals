import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export interface AnalyticsEvent {
    productId: string;
    eventType: 'view' | 'click';
    userId?: string;
    sessionId: string;
    timestamp: string;
}

export interface ProductAnalytics {
    productId: string;
    viewCount: number;
    clickCount: number;
    lastViewedAt?: string;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = ID.unique();
        localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
};

// Track viewed products in session to prevent duplicates
const hasViewedInSession = (productId: string): boolean => {
    const viewed = JSON.parse(localStorage.getItem('viewed_products') || '[]');
    return viewed.includes(productId);
};

const markAsViewed = (productId: string): void => {
    const viewed = JSON.parse(localStorage.getItem('viewed_products') || '[]');
    if (!viewed.includes(productId)) {
        viewed.push(productId);
        localStorage.setItem('viewed_products', JSON.stringify(viewed));
    }
};

export const analyticsService = {
    /**
     * Track product view
     */
    async trackProductView(productId: string, userId?: string): Promise<void> {
        try {
            // Prevent duplicate views in same session
            if (hasViewedInSession(productId)) {
                return;
            }

            const sessionId = getSessionId();

            // Create analytics event
            await databases.createDocument(
                'thrift_store',
                'product_analytics',
                ID.unique(),
                {
                    productId,
                    eventType: 'view',
                    userId: userId || null,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer || null,
                    userAgent: navigator.userAgent
                }
            );

            // Update product view count
            const product = await databases.getDocument('thrift_store', 'products', productId);
            await databases.updateDocument(
                'thrift_store',
                'products',
                productId,
                {
                    viewCount: (product.viewCount || 0) + 1,
                    lastViewedAt: new Date().toISOString()
                }
            );

            // Mark as viewed in session
            markAsViewed(productId);

            console.log(`Tracked view for product ${productId}`);
        } catch (error) {
            console.error('Failed to track product view:', error);
            // Don't throw - analytics should not break the app
        }
    },

    /**
     * Track product click
     */
    async trackProductClick(productId: string, userId?: string): Promise<void> {
        try {
            const sessionId = getSessionId();

            // Create analytics event
            await databases.createDocument(
                'thrift_store',
                'product_analytics',
                ID.unique(),
                {
                    productId,
                    eventType: 'click',
                    userId: userId || null,
                    sessionId,
                    timestamp: new Date().toISOString(),
                    referrer: document.referrer || null,
                    userAgent: navigator.userAgent
                }
            );

            // Update product click count
            const product = await databases.getDocument('thrift_store', 'products', productId);
            await databases.updateDocument(
                'thrift_store',
                'products',
                productId,
                {
                    clickCount: (product.clickCount || 0) + 1
                }
            );

            console.log(`Tracked click for product ${productId}`);
        } catch (error) {
            console.error('Failed to track product click:', error);
            // Don't throw - analytics should not break the app
        }
    },

    /**
     * Get most viewed products
     */
    async getMostViewedProducts(limit: number = 10): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'products',
                [
                    Query.orderDesc('viewCount'),
                    Query.limit(limit),
                    Query.greaterThan('viewCount', 0)
                ]
            );

            return response.documents;
        } catch (error) {
            console.error('Failed to get most viewed products:', error);
            return [];
        }
    },

    /**
     * Get most clicked products
     */
    async getMostClickedProducts(limit: number = 10): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'products',
                [
                    Query.orderDesc('clickCount'),
                    Query.limit(limit),
                    Query.greaterThan('clickCount', 0)
                ]
            );

            return response.documents;
        } catch (error) {
            console.error('Failed to get most clicked products:', error);
            return [];
        }
    },

    /**
     * Get analytics for specific product
     */
    async getProductAnalytics(productId: string): Promise<ProductAnalytics | null> {
        try {
            const product = await databases.getDocument('thrift_store', 'products', productId);

            return {
                productId,
                viewCount: product.viewCount || 0,
                clickCount: product.clickCount || 0,
                lastViewedAt: product.lastViewedAt
            };
        } catch (error) {
            console.error('Failed to get product analytics:', error);
            return null;
        }
    },

    /**
     * Get total analytics stats
     */
    async getTotalStats(): Promise<{ totalViews: number; totalClicks: number }> {
        try {
            // Get all products and sum their counts
            const response = await databases.listDocuments(
                'thrift_store',
                'products',
                [Query.limit(1000)]
            );

            const totalViews = response.documents.reduce((sum, product) => sum + (product.viewCount || 0), 0);
            const totalClicks = response.documents.reduce((sum, product) => sum + (product.clickCount || 0), 0);

            return { totalViews, totalClicks };
        } catch (error) {
            console.error('Failed to get total stats:', error);
            return { totalViews: 0, totalClicks: 0 };
        }
    },

    /**
     * Format view count for display
     */
    formatCount(count: number): string {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count.toString();
    },

    /**
     * Check if view counts should be displayed (admin setting)
     */
    async shouldShowViewCounts(): Promise<boolean> {
        try {
            // Try to get settings from a settings collection
            const settings = await databases.getDocument('thrift_store', 'settings', 'analytics_settings');
            return settings.showViewCounts !== false; // Default to true
        } catch (error) {
            // If settings don't exist, default to true
            return true;
        }
    },

    /**
     * Update view count visibility setting (admin only)
     */
    async updateViewCountVisibility(show: boolean): Promise<void> {
        try {
            // Try to update existing settings
            await databases.updateDocument(
                'thrift_store',
                'settings',
                'analytics_settings',
                { showViewCounts: show }
            );
        } catch (error) {
            // If settings don't exist, create them
            try {
                await databases.createDocument(
                    'thrift_store',
                    'settings',
                    'analytics_settings',
                    { showViewCounts: show }
                );
            } catch (createError) {
                console.error('Failed to update view count visibility:', createError);
            }
        }
    }
};
