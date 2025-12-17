import { useState } from 'react';
import { account, databases } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { ID } from 'appwrite';

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Create Account
            const userId = ID.unique();
            await account.create(userId, email, password, name);

            // 2. Login to get session (required for createVerification)
            await account.createEmailPasswordSession(email, password);

            // 3. Create Profile
            try {
                await databases.createDocument(
                    'thrift_store',
                    'profiles',
                    ID.unique(),
                    {
                        userId: userId,
                    }
                );
            } catch (profileErr) {
                console.error('Failed to create profile:', profileErr);
            }

            // 4. Send Verification Email (requires active session)
            const verificationUrl = `${window.location.origin}/verify`;
            await account.createVerification(verificationUrl);

            // 5. Logout (they must verify before using the account)
            await account.deleteSession('current');

            // 6. Show success message and redirect to login
            alert('Account created! Please check your email to verify your account before logging in.');
            navigate('/login?verified=pending');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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
                        minLength={8}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Register'}
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
}
