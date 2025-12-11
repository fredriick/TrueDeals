import { PaystackButton } from 'react-paystack';
import { Button } from './Button';

interface PaymentButtonProps {
    amount: number; // Amount in USD (will be converted to Kobo/NGN if needed, or treated as NGN)
    email: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    disabled?: boolean;
}

export function PaymentButton({ amount, email, onSuccess, onClose, disabled }: PaymentButtonProps) {
    // Paystack takes amount in Kobo (100 Kobo = 1 Naira).
    // Assuming the store uses USD, we might want to convert or just treat as NGN for this demo.
    // For simplicity in this demo, we'll treat 1 USD = 1000 NGN (approx) for the payment to look realistic in Paystack,
    // OR just pass the value directly if the store is NGN.
    // Let's assume the store is USD and we convert to NGN for Paystack (x1500 current rate approx).
    // amount is in dollars (e.g., 50.00).
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    // Convert USD to Kobo (using a fixed demo rate of 1500 NGN/USD)
    // 1 USD = 1500 NGN = 150,000 Kobo
    const amountInKobo = Math.round(amount * 1500 * 100);

    const componentProps = {
        email,
        amount: amountInKobo,
        publicKey,
        text: `Pay $${amount.toFixed(2)}`,
        onSuccess,
        onClose,
    };

    return (
        <div className="w-full">
            <PaystackButton
                {...componentProps}
                className={`w-full h-11 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            />
        </div>
    );
}
