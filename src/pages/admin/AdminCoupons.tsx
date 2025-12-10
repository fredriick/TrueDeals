import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Edit, Tag } from 'lucide-react';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'coupons', [
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]);
            setCoupons(response.documents);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const couponData = {
                code: code.toUpperCase(),
                type,
                value: parseFloat(value),
                minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt || null,
                isActive,
                usageCount: 0
            };

            if (editingId) {
                await databases.updateDocument('thrift_store', 'coupons', editingId, couponData);
            } else {
                await databases.createDocument('thrift_store', 'coupons', ID.unique(), couponData);
            }

            resetForm();
            fetchCoupons();
            alert(editingId ? 'Coupon updated!' : 'Coupon created!');
        } catch (error: any) {
            console.error('Failed to save coupon:', error);
            alert(`Failed to save coupon: ${error.message}`);
        }
    };

    const handleEdit = (coupon: any) => {
        setEditingId(coupon.$id);
        setCode(coupon.code);
        setType(coupon.type);
        setValue(coupon.value.toString());
        setMinPurchase(coupon.minPurchase?.toString() || '');
        setMaxDiscount(coupon.maxDiscount?.toString() || '');
        setUsageLimit(coupon.usageLimit?.toString() || '');
        setExpiresAt(coupon.expiresAt || '');
        setIsActive(coupon.isActive);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        try {
            await databases.deleteDocument('thrift_store', 'coupons', id);
            fetchCoupons();
        } catch (error) {
            console.error('Failed to delete coupon:', error);
        }
    };

    const toggleActive = async (coupon: any) => {
        try {
            await databases.updateDocument('thrift_store', 'coupons', coupon.$id, {
                isActive: !coupon.isActive
            });
            fetchCoupons();
        } catch (error) {
            console.error('Failed to toggle coupon:', error);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setCode('');
        setType('percentage');
        setValue('');
        setMinPurchase('');
        setMaxDiscount('');
        setUsageLimit('');
        setExpiresAt('');
        setIsActive(true);
        setShowForm(false);
    };

    const isExpired = (expiresAt: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Coupon Management</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Coupon'}
                </Button>
            </div>

            {/* Coupon Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg border mb-8">
                    <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                                <Input
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="SAVE20"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type *</label>
                                <select
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    value={type}
                                    onChange={e => setType(e.target.value as 'percentage' | 'fixed')}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                    placeholder={type === 'percentage' ? '20' : '10.00'}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Min Purchase ($)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={minPurchase}
                                    onChange={e => setMinPurchase(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            {type === 'percentage' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount ($)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={maxDiscount}
                                        onChange={e => setMaxDiscount(e.target.value)}
                                        placeholder="Unlimited"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                <Input
                                    type="number"
                                    value={usageLimit}
                                    onChange={e => setUsageLimit(e.target.value)}
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expires At</label>
                                <Input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={e => setExpiresAt(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
                            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="text-left p-4 font-medium">Code</th>
                            <th className="text-left p-4 font-medium">Type</th>
                            <th className="text-left p-4 font-medium">Value</th>
                            <th className="text-left p-4 font-medium">Usage</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500">
                                    No coupons yet. Create one to get started!
                                </td>
                            </tr>
                        ) : (
                            coupons.map(coupon => (
                                <tr key={coupon.$id} className="border-b hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-primary" />
                                            <span className="font-mono font-bold">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 capitalize">{coupon.type}</td>
                                    <td className="p-4">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
                                        {coupon.minPurchase > 0 && (
                                            <div className="text-xs text-slate-500">Min: ${coupon.minPurchase.toFixed(2)}</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {coupon.usageCount || 0}
                                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => toggleActive(coupon)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${coupon.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                            {isExpired(coupon.expiresAt) && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.$id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
