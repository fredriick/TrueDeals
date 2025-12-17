import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const { checkUser } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationWarning, setShowVerificationWarning] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setShowVerificationWarning(false);

        try {
            await account.createEmailPasswordSession(email, password);

            // Check if email is verified
            const user = await account.get();
            if (!user.emailVerification) {
                setShowVerificationWarning(true);
                setError('Please verify your email before logging in. Check your inbox for the verification link.');
                await account.deleteSession('current'); // Log them out
                setLoading(false);
                return;
            }

            await checkUser();
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendingVerification(true);
        try {
            const verificationUrl = `${window.location.origin}/verify`;
            await account.createVerification(verificationUrl);
            alert('Verification email sent! Please check your inbox.');
        } catch (err: any) {
            setError('Failed to resend verification email. Please try again.');
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>

                {showVerificationWarning && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={handleResendVerification}
                        disabled={resendingVerification}
                    >
                        {resendingVerification ? 'Sending...' : 'Resend Verification Email'}
                    </Button>
                )}
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
}
