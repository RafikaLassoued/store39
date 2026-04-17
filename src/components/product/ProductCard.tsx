import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import type { Product } from '../../types';
import { formatPrice, getDiscountPercentage } from '../../lib/utils';
import { useStore } from '../../hooks/useStore';
import { Badge } from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addToCart = useStore((s) => s.addToCart);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group block"
      >
        <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[3/4] mb-3">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge variant="info">جديد</Badge>
            )}
            {product.oldPrice && (
              <Badge variant="danger">-{getDiscountPercentage(product.price, product.oldPrice)}%</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, product.sizes[0], product.colors[0]);
              }}
              className="flex-1 bg-white/90 backdrop-blur-sm text-stone-900 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#8b1a2b] hover:text-white transition-colors"
            >
              <ShoppingBag size={14} />
              أضف للسلة
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="px-1">
          <h3 className="text-sm font-semibold text-stone-800 mb-1 line-clamp-1 group-hover:text-[#8b1a2b] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#8b1a2b]">
              {formatPrice(product.price)} دج
            </span>
            {product.oldPrice && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.oldPrice)} دج
              </span>
            )}
          </div>
          {/* Color swatches */}
          <div className="flex items-center gap-1 mt-2">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color.hex}
                className="w-4 h-4 rounded-full border border-stone-200"
                style={{ backgroundColor: color.hex }}
                title={color.nameAr}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[10px] text-stone-400">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
