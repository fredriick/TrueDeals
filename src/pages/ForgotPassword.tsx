import { useState } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Appwrite will send an email with a link to /reset-password
            const redirectUrl = `${window.location.origin}/reset-password`;
            await account.createRecovery(email, redirectUrl);

            setStatus('success');
            setMessage('Password reset email sent! Please check your inbox.');
            setEmail('');
        } catch (error: any) {
            console.error('Password reset request failed:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

            <p className="text-slate-600 text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {message && (
                <div className={`p-4 rounded-md mb-6 ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        disabled={loading}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Sending Link...' : 'Send Reset Link'}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link to="/login" className="text-blue-600 hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
