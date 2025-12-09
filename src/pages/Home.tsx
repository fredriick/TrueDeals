import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function Home() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await databases.listDocuments('thrift_store', 'categories', [
                    Query.limit(100),
                    Query.orderAsc('name')
                ]);
                const uniqueCategories = response.documents.map(d => d.name);
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const getCategoryStyle = (index: number) => {
        const styles = [
            { color: 'bg-orange-100', text: 'text-orange-800' },
            { color: 'bg-blue-100', text: 'text-blue-800' },
            { color: 'bg-purple-100', text: 'text-purple-800' },
            { color: 'bg-green-100', text: 'text-green-800' },
            { color: 'bg-pink-100', text: 'text-pink-800' },
            { color: 'bg-yellow-100', text: 'text-yellow-800' },
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-primary text-primary-foreground py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
                        Find Your <span className="text-secondary">Unique</span> Style
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Curated vintage, streetwear, and one-of-a-kind pieces.
                        Sustainable fashion that doesn't cost the earth.
                    </p>
                    <div className="flex justify-center gap-6 pt-4">
                        <Link to="/shop">
                            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 rounded-xl font-bold">
                                Shop Collection
                            </Button>
                        </Link>
                        <Link to="/about">
                            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                                Our Story
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
                    <Link to="/shop" className="text-accent hover:underline font-medium">View All &rarr;</Link>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading categories...</div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map((category, index) => {
                            const style = getCategoryStyle(index);
                            return (
                                <Link to={`/shop?category=${category}`} key={category} className="group cursor-pointer">
                                    <div className={`aspect-[3/2] ${style.color} rounded-xl flex items-center justify-center text-lg font-bold ${style.text} transition-transform duration-300 group-hover:-translate-y-1 shadow-sm group-hover:shadow-md`}>
                                        {category}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">No categories found.</div>
                )}
            </section>

            {/* Newsletter / CTA */}
            <section className="container mx-auto px-4">
                <div className="bg-secondary rounded-3xl p-12 text-center space-y-6">
                    <h2 className="text-4xl font-bold text-secondary-foreground">Join the TrueDeals Club</h2>
                    <p className="text-lg text-secondary-foreground/80 max-w-xl mx-auto">
                        Get early access to new drops and exclusive discounts.
                    </p>
                    <div className="flex max-w-md mx-auto gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary"
                        />
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Subscribe
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
