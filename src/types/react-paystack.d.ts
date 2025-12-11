declare module 'react-paystack' {
    export interface PaystackButtonProps {
        text?: string;
        className?: string;
        children?: React.ReactNode;
        onSuccess?: (reference: any) => void;
        onClose?: () => void;
        reference?: string;
        email: string;
        amount: number;
        publicKey: string;
        firstname?: string;
        lastname?: string;
        phone?: string;
        currency?: string;
        metadata?: any;
    }

    export const PaystackButton: React.FC<PaystackButtonProps>;
    export const usePaystackPayment: (config: any) => (onSuccess?: Function, onClose?: Function) => void;
}
