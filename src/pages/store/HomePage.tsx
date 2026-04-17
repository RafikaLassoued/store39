import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, CreditCard, Star, Sparkles } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { useStore } from '../../hooks/useStore';
import { CATEGORIES } from '../../data/seed';

export function HomePage() {
  const products = useStore((s) => s.products);
  const featuredProducts = products.filter((p) => p.featured);
  const newProducts = products.filter((p) => p.isNew);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-1.5 bg-[#c9a84c]/20 text-[#c9a84c] px-4 py-1.5 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
                <Sparkles size={14} />
                مجموعة الخريف الجديدة
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              اكتشفي أناقتك
              <br />
              <span className="text-[#c9a84c]">مع أناقتي</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-white/80 mb-8 leading-relaxed"
            >
              أحدث صيحات الموضة بأسعار تنافسية مع توصيل لجميع الولايات الجزائرية
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-[#8b1a2b] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#7a1525] transition-colors shadow-lg shadow-[#8b1a2b]/30"
              >
                تسوقي الآن
                <ArrowRight size={18} />
              </Link>
              <a
                href="https://wa.me/213555123456"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#20bd5a] transition-colors shadow-lg shadow-[#25D366]/30"
              >
                اطلبي عبر واتساب
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: 'توصيل سريع', desc: 'لجميع الولايات' },
              { icon: Shield, title: 'ضمان الجودة', desc: 'منتجات أصلية 100%' },
              { icon: CreditCard, title: 'الدفع عند الاستلام', desc: 'أو عبر BaridiMob' },
              { icon: Star, title: 'أفضل الأسعار', desc: 'عروض حصرية' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b1a2b]/5 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={18} className="text-[#8b1a2b]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{feature.title}</p>
                  <p className="text-xs text-stone-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>التصنيفات</h2>
            <p className="text-sm text-stone-500 mt-1">تصفحي مجموعاتنا المميزة</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#8b1a2b] hover:underline flex items-center gap-1">
            عرض الكل <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group block text-center"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square mb-2">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {cat.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>المنتجات المميزة</h2>
            <p className="text-sm text-stone-500 mt-1">اختيارات مميزة لكِ</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#8b1a2b] hover:underline flex items-center gap-1">
            عرض الكل <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#8b1a2b] to-[#4a0d15] p-8 sm:p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#c9a84c] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#c9a84c] rounded-full translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative text-center">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              خصم 10% على أول طلب
            </h3>
            <p className="text-white/80 mb-6">استخدمي كود WELCOME10 عند الدفع</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-[#8b1a2b] px-8 py-3 rounded-xl font-semibold hover:bg-stone-50 transition-colors"
            >
              تسوقي الآن
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>وصل حديثاً</h2>
            <p className="text-sm text-stone-500 mt-1">أحدث المنتجات</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
