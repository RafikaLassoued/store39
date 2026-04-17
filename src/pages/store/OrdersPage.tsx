import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, MapPin, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useStore } from '../../hooks/useStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../types';
import { trackDelivery } from '../../lib/delivery';
import type { OrderStatus } from '../../types';

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  in_warehouse: Package,
  in_delivery: Truck,
  delivered: CheckCircle,
  returned: XCircle,
};

export function OrdersPage() {
  const orders = useStore((s) => s.orders);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<Awaited<ReturnType<typeof trackDelivery>> | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;
    setIsTracking(true);
    const result = await trackDelivery(trackingNumber, 'dc-1');
    setTrackingResult(result);
    setIsTracking(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        تتبع الطلب
      </h1>

      {/* Track by Number */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-8">
        <div className="flex gap-3">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="أدخل رقم التتبع..."
            className="flex-1"
          />
          <Button onClick={handleTrack} disabled={isTracking}>
            {isTracking ? 'جاري البحث...' : 'تتبع'}
          </Button>
        </div>

        {trackingResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <h3 className="font-bold text-stone-800 mb-4">نتائج التتبع</h3>
            <div className="space-y-4">
              {trackingResult.history.map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-3 h-3 rounded-full bg-[#8b1a2b] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{item.status}</p>
                    <p className="text-xs text-stone-500">{item.location} • {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Orders List */}
      <h2 className="text-lg font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        طلباتي
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-stone-300 mx-auto mb-4" />
          <p className="text-stone-400">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const StatusIcon = STATUS_ICONS[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-stone-100 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-stone-400">رقم الطلب</span>
                    <p className="font-bold text-stone-800">{order.id}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                    <StatusIcon size={12} />
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-stone-500 mb-3">
                  <div>
                    <span className="text-stone-400">العميل:</span> {order.customer.fullName}
                  </div>
                  <div>
                    <span className="text-stone-400">الولاية:</span> {order.customer.wilaya}
                  </div>
                  <div>
                    <span className="text-stone-400">التوصيل:</span> {order.deliveryCompanyName}
                  </div>
                  <div>
                    <span className="text-stone-400">المصدر:</span>
                    {order.source === 'whatsapp' ? 'واتساب' : 'الموقع'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                  </div>
                  <span className="font-bold text-[#8b1a2b]">
                    {order.total.toLocaleString('ar-DZ')} دج
                  </span>
                </div>

                {order.trackingNumber && (
                  <div className="mt-3 bg-stone-50 rounded-lg px-3 py-2 text-xs">
                    <span className="text-stone-400">رقم التتبع: </span>
                    <span className="font-mono font-semibold text-stone-700">{order.trackingNumber}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
