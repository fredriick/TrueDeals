import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Models } from 'appwrite';

interface Product extends Models.Document {
    name: string;
    description: string;
    price: number;
    imageId: string;
    category: string;
    size: string;
    status: string;
}

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="group relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {/* Placeholder for image - in real app use Storage to get URL */}
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                    {product.imageId ? 'Image' : 'No Image'}
                </div>
                {product.status !== 'available' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {product.status}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                    <Link to={`/product/${product.$id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
                <p className="text-sm text-slate-500 mt-1">{product.category} • {product.size}</p>
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</p>
                    <Button size="sm" variant="secondary" className="z-10 relative">
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
