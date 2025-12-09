import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ID, Query } from 'appwrite';

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    // Form State
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'profiles',
                [Query.equal('userId', user!.$id)]
            );

            if (response.documents.length > 0) {
                const profile = response.documents[0];
                setProfileId(profile.$id);
                setAddress(profile.address || '');
                setPhone(profile.phone || '');
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (profileId) {
                // Update existing profile
                await databases.updateDocument(
                    'thrift_store',
                    'profiles',
                    profileId,
                    {
                        address,
                        phone
                    }
                );
            } else {
                // Create new profile
                const newProfile = await databases.createDocument(
                    'thrift_store',
                    'profiles',
                    ID.unique(),
                    {
                        userId: user!.$id,
                        address,
                        phone
                    }
                );
                setProfileId(newProfile.$id);
            }
            alert('Profile saved successfully!');
        } catch (error: any) {
            console.error('Failed to save profile:', error);
            alert(`Failed to save profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="mb-6 pb-6 border-b">
                    <h2 className="text-xl font-semibold mb-4">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
                            <div className="font-medium">{user?.name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                            <div className="font-medium">{user?.email}</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                    <div>
                        <label className="block text-sm font-medium mb-1">Shipping Address</label>
                        <textarea
                            className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your full shipping address..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
