import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';

export interface OrderStatus {
    orderId: string;
    status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    timestamp: string;
    updatedBy: string;
    notes?: string;
    location?: string;
}

export interface TrackingInfo {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
}

export const orderStatusService = {
    /**
     * Update order status and create history entry
     */
    async updateOrderStatus(
        orderId: string,
        newStatus: OrderStatus['status'],
        updatedBy: string,
        notes?: string
    ): Promise<void> {
        try {
            // 1. Update the order status
            await databases.updateDocument(
                'thrift_store',
                'orders',
                orderId,
                { status: newStatus }
            );

            // 2. Create status history entry
            await databases.createDocument(
                'thrift_store',
                'order_status_history',
                ID.unique(),
                {
                    orderId,
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    updatedBy,
                    notes: notes || '',
                    notificationSent: false
                }
            );

            console.log(`Order ${orderId} status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update order status:', error);
            throw error;
        }
    },

    /**
     * Get status history for an order
     */
    async getStatusHistory(orderId: string): Promise<OrderStatus[]> {
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'order_status_history',
                [
                    Query.equal('orderId', orderId),
                    Query.orderAsc('timestamp')
                ]
            );

            return response.documents as unknown as OrderStatus[];
        } catch (error) {
            console.error('Failed to fetch status history:', error);
            return [];
        }
    },

    /**
     * Add tracking information to an order
     */
    async addTrackingInfo(
        orderId: string,
        trackingInfo: TrackingInfo
    ): Promise<void> {
        try {
            await databases.updateDocument(
                'thrift_store',
                'orders',
                orderId,
                {
                    trackingNumber: trackingInfo.trackingNumber,
                    carrier: trackingInfo.carrier,
                    estimatedDelivery: trackingInfo.estimatedDelivery || null
                }
            );

            console.log(`Tracking info added to order ${orderId}`);
        } catch (error) {
            console.error('Failed to add tracking info:', error);
            throw error;
        }
    },

    /**
     * Get order with full details including status history
     */
    async getOrderWithHistory(orderId: string): Promise<any> {
        try {
            const order = await databases.getDocument(
                'thrift_store',
                'orders',
                orderId
            );

            const history = await this.getStatusHistory(orderId);

            return {
                ...order,
                statusHistory: history
            };
        } catch (error) {
            console.error('Failed to fetch order with history:', error);
            throw error;
        }
    },

    /**
     * Get carrier tracking URL
     */
    getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
        const carriers: Record<string, string> = {
            'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
            'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
            'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
            'USPS': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        };

        return carriers[carrier] || '#';
    }
};
