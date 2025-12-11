import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

export function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await databases.createDocument(
                'thrift_store',
                'newsletter',
                ID.unique(),
                { email }
            );
            setStatus('success');
            setEmail('');
        } catch (error: any) {
            console.error('Newsletter error:', error);
            // Ignore unique constraint errors (already subscribed)
            if (error.code === 409) {
                setStatus('success'); // Treat as success for UX
            } else {
                setStatus('error');
            }
        }
    };

    return (
        <footer className="bg-slate-900 text-slate-300">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md transform -rotate-2">True</span>
                            Deals
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your premier destination for curated vintage fashion and streetwear.
                            Sustainability meets style in every piece we sell.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Shop</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                            <li><Link to="/shop?category=Vintage" className="hover:text-white transition-colors">Vintage Collection</Link></li>
                            <li><Link to="/shop?category=Streetwear" className="hover:text-white transition-colors">Streetwear</Link></li>
                            <li><Link to="/shop?onSale=true" className="hover:text-white transition-colors text-red-400">On Sale</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                            <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Stay in the Loop</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Subscribe for exclusive drops, early access, and special discounts.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                                disabled={status === 'loading' || status === 'success'}
                            >
                                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                            </Button>
                            {status === 'success' && (
                                <p className="text-xs text-green-400 text-center">Thanks for joining the club!</p>
                            )}
                            {status === 'error' && (
                                <p className="text-xs text-red-400 text-center">Something went wrong. Try again.</p>
                            )}
                        </form>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} TrueDeals. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
