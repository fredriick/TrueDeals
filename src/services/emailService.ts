/**
 * Email notification service for order updates
 * Uses Appwrite's built-in email functionality
 */

export interface OrderEmailData {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
}

export const emailService = {
    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(orderData: OrderEmailData): Promise<void> {
        try {
            const subject = `Order Confirmation - #${orderData.orderNumber}`;
            const body = this.generateOrderConfirmationEmail(orderData);

            // In production, integrate with Appwrite Functions or external email service
            console.log('Sending order confirmation email:', {
                to: orderData.customerEmail,
                subject,
                body
            });

            // TODO: Implement actual email sending via Appwrite Functions
            // For now, we'll log it. In production, you'd call:
            // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({ to, subject, body }) });

        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
        }
    },

    /**
     * Send shipping notification email
     */
    async sendShippingNotification(orderData: OrderEmailData): Promise<void> {
        try {
            const subject = `Your Order Has Shipped - #${orderData.orderNumber}`;
            const body = this.generateShippingEmail(orderData);

            console.log('Sending shipping notification email:', {
                to: orderData.customerEmail,
                subject,
                body
            });

            // TODO: Implement actual email sending

        } catch (error) {
            console.error('Failed to send shipping notification:', error);
        }
    },

    /**
     * Send delivery confirmation email
     */
    async sendDeliveryConfirmation(orderData: OrderEmailData): Promise<void> {
        try {
            const subject = `Your Order Has Been Delivered - #${orderData.orderNumber}`;
            const body = this.generateDeliveryEmail(orderData);

            console.log('Sending delivery confirmation email:', {
                to: orderData.customerEmail,
                subject,
                body
            });

            // TODO: Implement actual email sending

        } catch (error) {
            console.error('Failed to send delivery confirmation:', error);
        }
    },

    /**
     * Send order cancellation email
     */
    async sendCancellationNotification(orderData: OrderEmailData): Promise<void> {
        try {
            const subject = `Order Cancelled - #${orderData.orderNumber}`;
            const body = this.generateCancellationEmail(orderData);

            console.log('Sending cancellation notification email:', {
                to: orderData.customerEmail,
                subject,
                body
            });

            // TODO: Implement actual email sending

        } catch (error) {
            console.error('Failed to send cancellation notification:', error);
        }
    },

    /**
     * Generate order confirmation email HTML
     */
    generateOrderConfirmationEmail(orderData: OrderEmailData): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Order Confirmation</h1>
                <p>Hi ${orderData.customerName},</p>
                <p>Thank you for your order! We've received your order and will process it shortly.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Order #${orderData.orderNumber}</h2>
                    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
                    
                    <h3>Items:</h3>
                    <ul>
                        ${orderData.items.map(item => `
                            <li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>
                        `).join('')}
                    </ul>
                    
                    <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">
                        Total: $${orderData.total.toFixed(2)}
                    </p>
                </div>
                
                <p>We'll send you another email when your order ships.</p>
                <p>Thanks for shopping with TrueDeals!</p>
            </div>
        `;
    },

    /**
     * Generate shipping notification email HTML
     */
    generateShippingEmail(orderData: OrderEmailData): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Your Order Has Shipped! 📦</h1>
                <p>Hi ${orderData.customerName},</p>
                <p>Great news! Your order is on its way.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Order #${orderData.orderNumber}</h2>
                    
                    ${orderData.trackingNumber ? `
                        <div style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                            <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                            <p><strong>Carrier:</strong> ${orderData.carrier}</p>
                            ${orderData.estimatedDelivery ? `
                                <p><strong>Estimated Delivery:</strong> ${new Date(orderData.estimatedDelivery).toLocaleDateString()}</p>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <h3>Items:</h3>
                    <ul>
                        ${orderData.items.map(item => `
                            <li>${item.quantity}x ${item.name}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <p>You can track your package using the tracking number above.</p>
                <p>Thanks for shopping with TrueDeals!</p>
            </div>
        `;
    },

    /**
     * Generate delivery confirmation email HTML
     */
    generateDeliveryEmail(orderData: OrderEmailData): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Order Delivered! ✅</h1>
                <p>Hi ${orderData.customerName},</p>
                <p>Your order has been successfully delivered!</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Order #${orderData.orderNumber}</h2>
                    <p>We hope you love your purchase!</p>
                </div>
                
                <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
                <p>Thanks for shopping with TrueDeals!</p>
            </div>
        `;
    },

    /**
     * Generate cancellation email HTML
     */
    generateCancellationEmail(orderData: OrderEmailData): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ef4444;">Order Cancelled</h1>
                <p>Hi ${orderData.customerName},</p>
                <p>Your order has been cancelled as requested.</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Order #${orderData.orderNumber}</h2>
                    <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
                    <p>If you were charged, a refund will be processed within 5-7 business days.</p>
                </div>
                
                <p>If you have any questions, please contact our support team.</p>
                <p>We hope to see you again soon!</p>
            </div>
        `;
    }
};
