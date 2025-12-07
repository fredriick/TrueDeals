import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function Home() {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Vintage', color: 'bg-orange-100', text: 'text-orange-800' },
                        { name: 'Streetwear', color: 'bg-blue-100', text: 'text-blue-800' },
                        { name: 'Accessories', color: 'bg-purple-100', text: 'text-purple-800' }
                    ].map((cat) => (
                        <Link to={`/shop?category=${cat.name}`} key={cat.name} className="group cursor-pointer">
                            <div className={`aspect-[4/3] ${cat.color} rounded-2xl flex items-center justify-center text-3xl font-black ${cat.text} transition-transform duration-300 group-hover:-translate-y-2 shadow-sm group-hover:shadow-xl`}>
                                {cat.name}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="container mx-auto px-4">
                <div className="bg-secondary rounded-3xl p-12 text-center space-y-6">
                    <h2 className="text-4xl font-bold text-secondary-foreground">Join the Thrift Club</h2>
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
