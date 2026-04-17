import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit3 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../types';
import type { OrderStatus } from '../../types';

const ALL_STATUSES: OrderStatus[] = ['pending', 'in_warehouse', 'in_delivery', 'delivered', 'returned'];

export function AdminOrders() {
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>الطلبات</h1>
          <p className="text-sm text-stone-500 mt-1">{orders.length} طلب</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            filterStatus === 'all' ? 'bg-[#8b1a2b] text-white' : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          الكل ({orders.length})
        </button>
        {ALL_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === status ? 'bg-[#8b1a2b] text-white' : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {ORDER_STATUS_LABELS[status]} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filtered.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-stone-800">{order.id}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span className={`text-xs font-semibold ${
                        order.source === 'whatsapp' ? 'text-[#25D366]' : 'text-[#8b1a2b]'
                      }`}>
                        {order.source === 'whatsapp' ? '📱 واتساب' : '🌐 الموقع'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-500">
                      <div>👤 {order.customer.fullName}</div>
                      <div>📍 {order.customer.wilaya} - {order.customer.commune}</div>
                      <div>📞 {order.customer.phone}</div>
                      <div>🚚 {order.deliveryCompanyName}</div>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-2 text-xs text-stone-400">
                        رقم التتبع: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-[#8b1a2b]">
                      {order.total.toLocaleString('ar-DZ')} دج
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="h-9 rounded-lg border border-stone-200 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8b1a2b]/30"
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
