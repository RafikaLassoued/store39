import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Truck, ShoppingCart, Users, Ticket, BarChart3, ArrowRight, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const adminNav = [
  { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/categories', label: 'التصنيفات', icon: Tags },
  { to: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { to: '/admin/delivery', label: 'شركات التوصيل', icon: Truck },
  { to: '/admin/coupons', label: 'كوبونات الخصم', icon: Ticket },
  { to: '/admin/analytics', label: 'الإحصائيات', icon: BarChart3 },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex" dir="rtl">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-stone-900 text-white z-50 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-stone-800">
          <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-bl from-[#8b1a2b] to-[#c9a84c] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">أ</span>
            </div>
            <div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Tajawal, sans-serif' }}>أناقتي</span>
              <span className="text-[10px] text-stone-400 block">لوحة التحكم</span>
            </div>
          </Link>
        </div>

        <nav className="p-3 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive(item.to, item.end)
                  ? 'bg-[#8b1a2b] text-white'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-stone-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <ArrowRight size={18} />
            العودة للمتجر
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:mr-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-stone-100 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-stone-800">لوحة التحكم</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#8b1a2b] rounded-full flex items-center justify-center text-white text-xs font-bold">
              م
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
