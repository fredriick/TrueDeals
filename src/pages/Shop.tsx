import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ProductCard } from '@/components/ui/ProductCard';
import { Input } from '@/components/ui/Input';
import { useSearchParams } from 'react-router-dom';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const categoryParam = searchParams.get('category');
    const [category, setCategory] = useState(categoryParam || 'All');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onSaleOnly, setOnSaleOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);

    const sizes = ['XS', 'S', 'M', 'L', 'XL'];

    useEffect(() => {
        if (categoryParam) {
            setCategory(categoryParam);
        }
    }, [categoryParam]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await databases.listDocuments('thrift_store', 'categories', [
                Query.limit(100),
                Query.orderAsc('name')
            ]);
            const uniqueCategories = ['All', ...response.documents.map(d => d.name)];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(
                'thrift_store',
                'products',
                [Query.limit(1000)]
            );
            setProducts(response.documents);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        if (newCategory === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', newCategory);
        }
        setSearchParams(searchParams);
    };

    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setSelectedSizes([]);
        setInStockOnly(false);
        setOnSaleOnly(false);
        setSortBy('newest');
        searchParams.delete('category');
        setSearchParams(searchParams);
    };

    // Apply all filters
    const filteredProducts = products.filter(product => {
        // Search filter (name + description)
        const matchesSearch = searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = category === 'All' || product.category === category;

        // Price range filter
        const min = minPrice === '' ? 0 : parseFloat(minPrice);
        const max = maxPrice === '' ? Infinity : parseFloat(maxPrice);
        const matchesPrice = product.price >= min && product.price <= max;

        // Size filter
        const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(product.size);

        // Availability filter
        const matchesAvailability = !inStockOnly || product.quantity > 0;

        // Sale filter
        const matchesSale = !onSaleOnly || product.onSale;

        return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesAvailability && matchesSale;
    });

    // Apply sorting
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'newest':
                return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });

    const activeFiltersCount = [
        searchTerm !== '',
        category !== 'All',
        minPrice !== '' || maxPrice !== '',
        selectedSizes.length > 0,
        inStockOnly,
        onSaleOnly
    ].filter(Boolean).length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Shop</h1>
                    <p className="text-slate-500 mt-1">
                        {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />
                    <select
                        className="border rounded-md px-3 py-2 bg-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name">Name: A-Z</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Filters Sidebar */}
                <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
                    <div className="bg-white border rounded-lg p-4 sticky top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg">Filters</h2>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Active Filters Count */}
                        {activeFiltersCount > 0 && (
                            <div className="mb-4 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
                                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                            </div>
                        )}

                        {/* Category Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Price Range</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="text-sm"
                                />
                                <span className="text-slate-400">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Size Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Size</label>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectedSizes.includes(size)
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Availability Filter */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                    className="rounded"
                                />
                                <span className="text-sm font-medium">In Stock Only</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={onSaleOnly}
                                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                                    className="rounded text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm font-medium">On Sale Only</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="text-center py-20">Loading products...</div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500 mb-4">No products found matching your filters.</p>
                            <Button onClick={clearAllFilters} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProducts.map(product => (
                                <ProductCard key={product.$id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
