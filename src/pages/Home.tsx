import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/ui/ProductCard';
import { ShatteredText } from '@/components/ui/ShatteredText';

export default function Home() {
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

    useEffect(() => {
        const loadDat = async () => {
            try {
                // Fetch Categories
                const catsResponse = await databases.listDocuments('thrift_store', 'categories', [
                    Query.limit(100),
                    Query.orderAsc('name')
                ]);
                setCategories(catsResponse.documents.map(d => d.name));

                // Fetch Featured Products (Newest 4)
                const productsResponse = await databases.listDocuments('thrift_store', 'products', [
                    Query.limit(4),
                    Query.orderDesc('$createdAt'),
                    Query.equal('status', 'available')
                ]);
                setFeaturedProducts(productsResponse.documents);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDat();
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
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter flex flex-wrap justify-center gap-x-4">
                        <ShatteredText text="Find Your" />
                        <ShatteredText text="Unique" className="text-secondary" />
                        <ShatteredText text="Style" />
                    </h1>
                    <div className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed space-y-2">
                        <div>
                            <ShatteredText
                                text="Curated vintage, streetwear, and one-of-a-kind pieces."
                            />
                        </div>
                        <div>
                            <ShatteredText
                                text="Sustainable fashion that doesn't cost the earth."
                            />
                        </div>
                    </div>
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

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
                    <Link to="/shop" className="text-accent hover:underline font-medium">Shop All &rarr;</Link>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading products...</div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.$id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">No products found.</div>
                )}
            </section>
        </div>
    );
}
