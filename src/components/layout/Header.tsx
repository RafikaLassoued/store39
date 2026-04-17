import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useStore((s) => s.cartCount());
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/orders', label: 'تتبع الطلب' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#8b1a2b] text-white text-xs py-2 text-center font-semibold tracking-wide">
        🚚 توصيل مجاني للطلبات فوق 10,000 دج | استخدم كود WELCOME10 للحصول على خصم 10%
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -mr-2 text-stone-700 hover:text-[#8b1a2b]"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-bl from-[#8b1a2b] to-[#c9a84c] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <span className="text-xl font-bold text-stone-900 hidden sm:block" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                أناقتي
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'text-[#8b1a2b] border-b-2 border-[#8b1a2b] pb-1'
                      : 'text-stone-600 hover:text-[#8b1a2b]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                className="text-sm font-medium text-stone-400 hover:text-[#8b1a2b] transition-colors"
              >
                لوحة التحكم
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-stone-600 hover:text-[#8b1a2b] transition-colors"
              >
                <Search size={20} />
              </button>
              <button className="p-2 text-stone-600 hover:text-[#8b1a2b] transition-colors hidden sm:block">
                <Heart size={20} />
              </button>
              <Link
                to="/cart"
                className="p-2 text-stone-600 hover:text-[#8b1a2b] transition-colors relative"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 bg-[#8b1a2b] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-stone-100 overflow-hidden"
            >
              <div className="max-w-2xl mx-auto px-4 py-3">
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  className="w-full h-10 rounded-xl border border-stone-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b1a2b]/30"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-t border-stone-100 bg-white"
            >
              <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-[#8b1a2b]/5 text-[#8b1a2b]'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-stone-50"
                >
                  لوحة التحكم
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
