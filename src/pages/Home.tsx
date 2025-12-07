import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h1 className="text-5xl font-bold tracking-tight">
                        Find Hidden Gems
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Discover unique, pre-loved fashion at unbeatable prices. Sustainable style starts here.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/shop">
                            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                                Shop Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Vintage', 'Streetwear', 'Accessories'].map((category) => (
                        <div key={category} className="aspect-[4/3] bg-slate-200 rounded-lg flex items-center justify-center text-2xl font-bold hover:bg-slate-300 transition-colors cursor-pointer">
                            {category}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
