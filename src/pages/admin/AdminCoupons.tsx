import { motion } from 'framer-motion';
import { Plus, Ticket } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';

export function AdminCoupons() {
  const coupons = useStore((s) => s.coupons);
  const toggleCoupon = useStore((s) => s.toggleCoupon);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>كوبونات الخصم</h1>
          <p className="text-sm text-stone-500 mt-1">{coupons.length} كوبون</p>
        </div>
        <Button size="sm">
          <Plus size={16} />
          إضافة كوبون
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon, i) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={coupon.isActive ? '' : 'opacity-60'}>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8b1a2b]/10 rounded-xl flex items-center justify-center">
                      <Ticket size={18} className="text-[#8b1a2b]" />
                    </div>
                    <div>
                      <span className="font-bold text-stone-800 font-mono">{coupon.code}</span>
                      <p className="text-xs text-stone-500">
                        {coupon.type === 'percentage' ? `خصم ${coupon.discount}%` : `خصم ${coupon.discount.toLocaleString('ar-DZ')} دج`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => toggleCoupon(coupon.id)}>
                    <Badge variant={coupon.isActive ? 'success' : 'danger'}>
                      {coupon.isActive ? 'مفعّل' : 'معطّل'}
                    </Badge>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-500">
                  <div>الحد الأدنى: {coupon.minOrder.toLocaleString('ar-DZ')} دج</div>
                  <div>الاستخدام: {coupon.usedCount}/{coupon.maxUses}</div>
                  <div>تنتهي: {coupon.expiresAt}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
