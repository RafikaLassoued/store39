import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, LayoutList } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { useStore } from '../../hooks/useStore';
import { CATEGORIES } from '../../data/seed';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const products = useStore((s) => s.products);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = searchParams.get('category') || '';

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeCategory) {
      const cat = CATEGORIES.find((c) => c.slug === activeCategory);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    switch (sortBy) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [products, activeCategory, sortBy]);

  const setCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          {activeCategory
            ? CATEGORIES.find((c) => c.slug === activeCategory)?.name || 'المنتجات'
            : 'جميع المنتجات'}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          {filteredProducts.length} منتج
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1">
          <button
            onClick={() => setCategory('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !activeCategory
                ? 'bg-[#8b1a2b] text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-[#8b1a2b] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & View */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#8b1a2b]/30"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
            <option value="rating">التقييم</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-stone-400 text-lg">لا توجد منتجات</p>
        </div>
      )}
    </div>
  );
}
