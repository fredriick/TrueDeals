import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function About() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-black text-primary mb-6">About TrueDeals</h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Welcome to TrueDeals, your premier destination for curated vintage fashion and unique pre-loved finds.
                    We believe that style shouldn't cost the earth—literally. By giving clothes a second life, we're reducing waste
                    and helping you look amazing for less.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-xl font-bold text-primary mb-2">Sustainable</h3>
                        <p className="text-slate-500">Every purchase helps reduce textile waste and supports a circular economy.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-xl font-bold text-primary mb-2">Curated</h3>
                        <p className="text-slate-500">We hand-pick every item to ensure quality, style, and authenticity.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-xl font-bold text-primary mb-2">Affordable</h3>
                        <p className="text-slate-500">Get high-end brands and vintage gems at a fraction of the original price.</p>
                    </div>
                </div>

                <div className="bg-secondary/20 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-primary mb-4">Join the Movement</h2>
                    <p className="text-slate-600 mb-6">
                        Ready to find your next favorite piece? Browse our latest collection today.
                    </p>
                    <Link to="/shop">
                        <Button size="lg" className="bg-primary text-white hover:bg-accent">
                            Start Thrifting
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
