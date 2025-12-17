import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get secrets from URL
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId || !secret) {
            setError('Invalid password reset link. Please request a new one.');
        }
    }, [userId, secret]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!userId || !secret) {
            setError('Missing reset token');
            return;
        }

        setLoading(true);

        try {
            await account.updateRecovery(userId, secret, password, password);
            alert('Password updated successfully! Please login with your new password.');
            navigate('/login');
        } catch (err: any) {
            console.error('Password update failed:', err);
            setError(err.message || 'Failed to update password. Link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (error && !userId) {
        return (
            <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={() => navigate('/forgot-password')}>
                    Request New Link
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-center">Set New Password</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Updating Password...' : 'Update Password'}
                </Button>
            </form>
        </div>
    );
}
