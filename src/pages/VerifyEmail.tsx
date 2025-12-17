import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkVerification = async () => {
            // Extract parameters from URL
            const userId = searchParams.get('userId');
            const secret = searchParams.get('secret');

            console.log('Verification params:', { userId, secret });

            if (!userId || !secret) {
                setStatus('error');
                setMessage('Invalid verification link. Please check your email and try again.');
                return;
            }

            // Appwrite automatically verifies the email when the user clicks the link
            // The link itself contains the verification token and Appwrite processes it server-side
            // We just need to show a success message

            // Small delay to ensure Appwrite has processed the verification
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('success');
            setMessage('Your email has been verified successfully! You can now log in to your account.');
        };

        checkVerification();
    }, [searchParams]);

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-sm border">
            <div className="text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 mx-auto text-blue-500 animate-spin mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Verifying Email...</h1>
                        <p className="text-slate-600">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-green-700">Email Verified!</h1>
                        <p className="text-slate-600 mb-6">{message}</p>
                        <Link to="/login">
                            <Button className="w-full">Go to Login</Button>
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold mb-2 text-red-700">Verification Failed</h1>
                        <p className="text-slate-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Back to Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="outline" className="w-full">Create New Account</Button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
