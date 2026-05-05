import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Ticket } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { createCoupon, getCoupons, toggleCoupon as toggleCouponInDb } from '../../lib/supabaseStore';
import type { Coupon } from '../../types';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: '',
    discount: 0,
    type: 'percentage' as Coupon['type'],
    minOrder: 0,
    maxUses: 100,
    expiresAt: '',
  });

  const loadCoupons = async () => {
    const data = await getCoupons();
    setCoupons(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCoupons();
  }, []);

  const handleCreate = async () => {
    if (!form.code || !form.expiresAt) return;
    await createCoupon({
      ...form,
      isActive: true,
    });
    setForm({ code: '', discount: 0, type: 'percentage', minOrder: 0, maxUses: 100, expiresAt: '' });
    await loadCoupons();
  };

  const handleToggle = async (coupon: Coupon) => {
    await toggleCouponInDb(coupon.id, !coupon.isActive);
    await loadCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>كوبونات الخصم</h1>
          <p className="text-sm text-stone-500 mt-1">{coupons.length} كوبون</p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus size={16} />
          إضافة كوبون
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="الكود" />
          <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} placeholder="الخصم" />
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon['type'] })}>
            <option value="percentage">نسبة %</option>
            <option value="fixed">مبلغ ثابت</option>
          </Select>
          <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} placeholder="أقل طلب" />
          <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })} placeholder="أقصى استخدام" />
          <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </CardContent>
      </Card>

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
                  <button onClick={() => void handleToggle(coupon)}>
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
