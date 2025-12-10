import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

import { useCart } from '@/context/useCart';

export function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const cartItems = useCart((state) => state.items);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchWishlistCount();

            // Listen for wishlist updates
            const handleWishlistUpdate = () => {
                fetchWishlistCount();
            };

            window.addEventListener('wishlistUpdated', handleWishlistUpdate);

            return () => {
                window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
            };
        } else {
            setWishlistCount(0);
        }
    }, [user]);

    const fetchWishlistCount = async () => {
        if (!user) return;
        try {
            const response = await databases.listDocuments('thrift_store', 'wishlist', [
                Query.equal('userId', user.$id),
                Query.limit(100)
            ]);
            setWishlistCount(response.documents.length);
        } catch (error) {
            // Wishlist collection might not exist yet
            console.log('Wishlist not available yet');
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b bg-surface/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md transform -rotate-2">True</span>
                    Deals
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link to="/shop" className="text-sm font-medium hover:text-accent transition-colors">
                        Shop
                    </Link>
                    <Link to="/about" className="text-sm font-medium hover:text-accent transition-colors">
                        About
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/cart" className="relative">
                        <Button variant="ghost" size="icon" className="hover:text-accent">
                            <ShoppingCart className="h-5 w-5" />
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {user && (
                        <Link to="/profile?tab=wishlist" className="relative">
                            <Button variant="ghost" size="icon" className="hover:text-accent">
                                <Heart className="h-5 w-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.email === import.meta.env.VITE_ADMIN_EMAIL && (
                                <Link to="/admin" className="text-sm font-medium hover:text-accent">
                                    Admin
                                </Link>
                            )}
                            <Link to="/profile">
                                <Button variant="ghost" size="icon" className="hover:text-accent">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button onClick={() => logout()} variant="outline" className="border-primary hover:bg-primary hover:text-white">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>

                <button
                    className="md:hidden p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-surface p-4 space-y-4 shadow-lg absolute w-full">
                    <Link to="/shop" className="block text-sm font-medium py-2">Shop</Link>
                    <Link to="/cart" className="block text-sm font-medium py-2">
                        Cart {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && `(${cartItems.reduce((acc, item) => acc + item.quantity, 0)})`}
                    </Link>
                    {user ? (
                        <>
                            <Link to="/profile?tab=wishlist" className="block text-sm font-medium py-2">
                                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                            </Link>
                            <Link to="/profile" className="block text-sm font-medium py-2">Profile</Link>
                            <button onClick={() => logout()} className="block text-sm font-medium text-red-500 py-2">
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 pt-2">
                            <Link to="/login"><Button className="w-full" variant="outline">Login</Button></Link>
                            <Link to="/register"><Button className="w-full bg-primary text-white">Register</Button></Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
