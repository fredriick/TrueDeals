import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, FolderOpen, Menu, X } from 'lucide-react';

export function AdminLayout() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
                return;
            }

            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            if (adminEmail && user.email !== adminEmail) {
                alert('Access Denied: You are not an administrator.');
                navigate('/');
                return;
            }
        }
    }, [user, authLoading, navigate]);

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    ];

    if (authLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo/Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <Link to="/" className="text-xl font-black text-primary flex items-center gap-2">
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md transform -rotate-2">True</span>
                            Deals
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-md"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>

                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                                <p className="text-xs text-slate-500">Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-md"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link to="/" className="text-lg font-black text-primary flex items-center gap-2">
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md transform -rotate-2 text-sm">True</span>
                        Deals
                    </Link>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
