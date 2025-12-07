import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-slate-900">
                    ThriftStore
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link to="/shop" className="text-sm font-medium hover:text-slate-600">
                        Shop
                    </Link>
                    <Link to="/about" className="text-sm font-medium hover:text-slate-600">
                        About
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/cart">
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/admin" className="text-sm font-medium hover:text-slate-600">
                                Admin
                            </Link>
                            <Link to="/profile">
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button onClick={() => logout()} variant="outline">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Register</Button>
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4">
                    <Link to="/shop" className="block text-sm font-medium">Shop</Link>
                    <Link to="/cart" className="block text-sm font-medium">Cart</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="block text-sm font-medium">Profile</Link>
                            <button onClick={() => logout()} className="block text-sm font-medium text-red-500">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link to="/login"><Button className="w-full" variant="outline">Login</Button></Link>
                            <Link to="/register"><Button className="w-full">Register</Button></Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
