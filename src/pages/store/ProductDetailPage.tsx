import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, Heart, Share2, Star, Truck, Shield, ChevronLeft } from 'lucide-react';
import { ImageGallery } from '../../components/product/ImageGallery';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { formatPrice, getDiscountPercentage } from '../../lib/utils';
import type { ProductColor } from '../../types';
import { generateWhatsAppMessage, openWhatsApp } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/tracking';
import { updateMetaTags, generateProductSchema } from '../../lib/seo';
import { useFavorites } from '../../hooks/useFavorites';

export function ProductDetailPage() {
  const { slug } = useParams();
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const product = products.find((p) => p.slug === slug);
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);
  const isFavorite = useFavorites((s) => s.isFavorite(product?.id ?? ''));

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!product) return;

    trackEvent('view_content', {
      content_name: product.name,
      content_id: product.id,
      value: product.price,
      currency: 'DZD',
    });

    updateMetaTags({
      title: `${product.name} | متجر ملابس`,
      description: product.description,
      image: product.images[0],
      type: 'product',
    });
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-stone-400 text-lg">المنتج غير موجود</p>
        <Link to="/products" className="text-[#8b1a2b] font-semibold mt-4 inline-block">
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor || undefined, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage(product, selectedSize, selectedColor || undefined);
    openWhatsApp(message);
    trackEvent('whatsapp_order_click', {
      content_name: product.name,
      content_id: product.id,
      value: product.price,
      currency: 'DZD',
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-500 mb-6">
        <Link to="/" className="hover:text-[#8b1a2b]">الرئيسية</Link>
        <ChevronLeft size={14} />
        <Link to="/products" className="hover:text-[#8b1a2b]">المنتجات</Link>
        <ChevronLeft size={14} />
        <span className="text-stone-800 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-800">الصور</h2>
              <span className="text-sm text-stone-500">{product.images.length} صورة</span>
            </div>
            <ImageGallery images={product.images} name={product.name} />
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Badges */}
          <div className="flex items-center gap-2">
            {product.isNew && <Badge variant="info">جديد</Badge>}
            {product.oldPrice && (
              <Badge variant="danger">خصم {getDiscountPercentage(product.price, product.oldPrice)}%</Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.round(product.rating) ? 'text-[#c9a84c] fill-[#c9a84c]' : 'text-stone-300'}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">({product.reviewCount} تقييم)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#8b1a2b]">
              {formatPrice(product.price)} دج
            </span>
            {product.oldPrice && (
              <span className="text-lg text-stone-400 line-through">
                {formatPrice(product.oldPrice)} دج
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selection */}
          {product.sizes.length > 0 && product.sizes[0] !== 'One Size' && (
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 block">المقاس</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-11 h-11 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedSize === size
                        ? 'border-[#8b1a2b] bg-[#8b1a2b]/5 text-[#8b1a2b]'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-stone-700 mb-2 block">
                اللون: {selectedColor?.nameAr}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                      selectedColor?.hex === color.hex
                        ? 'border-[#8b1a2b] shadow-md scale-110'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.nameAr}
                  >
                    {selectedColor?.hex === color.hex && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-semibold text-stone-700 mb-2 block">الكمية</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors text-lg font-bold"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold text-stone-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
              {addedToCart ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
            </Button>

            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              onClick={handleWhatsAppOrder}
            >
              <MessageCircle size={18} />
              اطلب الآن عبر واتساب
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => toggleFavorite(product.id)}>
                <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                {isFavorite ? 'تمت الإضافة' : 'المفضلة'}
              </Button>
              <Button variant="outline" size="md" className="flex-1" onClick={() => void handleShare()}>
                <Share2 size={16} />
                مشاركة
              </Button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-stone-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Truck size={18} className="text-[#8b1a2b]" />
              <span className="text-stone-700">توصيل لجميع الولايات 48</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield size={18} className="text-[#8b1a2b]" />
              <span className="text-stone-700">الدفع عند الاستلام أو عبر BaridiMob</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateProductSchema(product) }}
      />

     
    </div>
  );
}
