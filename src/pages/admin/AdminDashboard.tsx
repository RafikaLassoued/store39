import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { useStore } from '../../hooks/useStore';

export function AdminDashboard() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);

  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const returnedOrders = orders.filter((o) => o.status === 'returned').length;

  const stats = [
    { title: 'إجمالي الطلبات', value: orders.length, icon: ShoppingCart, color: 'bg-blue-500', change: '+12%' },
    { title: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString('ar-DZ')} دج`, icon: DollarSign, color: 'bg-emerald-500', change: '+8%' },
    { title: 'المنتجات', value: products.length, icon: Package, color: 'bg-purple-500', change: '+3' },
    { title: 'طلبات معلقة', value: pendingOrders, icon: Eye, color: 'bg-amber-500', change: 'بحاجة لمتابعة' },
  ];

  const recentOrders = orders.slice(0, 5);

  // Simple chart data
  const chartData = [65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 72];
  const maxChart = Math.max(...chartData);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>لوحة التحكم</h1>
        <p className="text-sm text-stone-500 mt-1">مرحباً بك في لوحة تحكم أناقتي</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-stone-500">{stat.title}</p>
                  <p className="text-xl font-bold text-stone-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>الإيرادات الشهرية</h3>
            <div className="flex items-end gap-2 h-40">
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#8b1a2b] to-[#c9a84c] rounded-t-md transition-all duration-500"
                    style={{ height: `${(val / maxChart) * 100}%` }}
                  />
                  <span className="text-[9px] text-stone-400">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>حالة الطلبات</h3>
            <div className="space-y-3">
              {[
                { label: 'قيد الانتظار', count: pendingOrders, color: 'bg-amber-500', percentage: orders.length > 0 ? (pendingOrders / orders.length) * 100 : 0 },
                { label: 'تم التوصيل', count: deliveredOrders, color: 'bg-emerald-500', percentage: orders.length > 0 ? (deliveredOrders / orders.length) * 100 : 0 },
                { label: 'مرتجع', count: returnedOrders, color: 'bg-red-500', percentage: orders.length > 0 ? (returnedOrders / orders.length) * 100 : 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-600">{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardContent>
          <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>آخر الطلبات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">رقم الطلب</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">العميل</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">الولاية</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">المبلغ</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">الحالة</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">المصدر</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="py-2 px-3 font-semibold text-stone-800">{order.id}</td>
                    <td className="py-2 px-3 text-stone-600">{order.customer.fullName}</td>
                    <td className="py-2 px-3 text-stone-600">{order.customer.wilaya}</td>
                    <td className="py-2 px-3 font-semibold">{order.total.toLocaleString('ar-DZ')} دج</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'returned' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status === 'delivered' ? 'تم التوصيل' :
                         order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'returned' ? 'مرتجع' :
                         order.status === 'in_warehouse' ? 'في المستودع' : 'قيد التوصيل'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-xs font-semibold ${
                        order.source === 'whatsapp' ? 'text-[#25D366]' : 'text-[#8b1a2b]'
                      }`}>
                        {order.source === 'whatsapp' ? 'واتساب' : 'الموقع'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
