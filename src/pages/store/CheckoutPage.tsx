import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Building2, MapPin, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../lib/utils';
import { getActiveDeliveryCompanies, getDeliveryPricing } from '../../lib/deliveryCompanies';
import { WILAYAS } from '../../data/seed';
import { trackEvent } from '../../lib/tracking';
import type { CustomerInfo, DeliveryCompany } from '../../types';
import type { Coupon } from '../../types';
import { getCoupons } from '../../lib/supabaseStore';

export function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const cartTotal = useStore((s) => s.cartTotal());
  const addOrder = useStore((s) => s.addOrder);
  const clearCart = useStore((s) => s.clearCart);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    deliveryType: 'home',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'baridimob'>('cod');
  const [deliveryCompanies, setDeliveryCompanies] = useState<DeliveryCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [pricing, setPricing] = useState<Record<string, { homePrice: number; officePrice: number; communePrice: number }>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const selectedWilaya = WILAYAS.find((w) => w.nameAr === customerInfo.wilaya);
  const communes = selectedWilaya?.communes || [];

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companies = await getActiveDeliveryCompanies();
        setDeliveryCompanies(companies);
        if (!selectedCompany && companies.length > 0) {
          setSelectedCompany(companies[0].id);
        }
      } catch (error) {
        console.error('Unable to load delivery companies:', error);
      }
    };

    void loadCompanies();
  }, [selectedCompany]);

  useEffect(() => {
    const loadPricing = async () => {
      if (!selectedCompany || !selectedWilaya) return;
      try {
        const row = await getDeliveryPricing(selectedCompany, selectedWilaya.code);
        if (row) {
          setPricing((prev) => ({
            ...prev,
            [selectedCompany]: {
              homePrice: row.homePrice,
              officePrice: row.officePrice,
              communePrice: row.communePrice,
            },
          }));
        }
      } catch (error) {
        console.error('Unable to load delivery pricing:', error);
      }
    };

    void loadPricing();
  }, [selectedCompany, selectedWilaya]);

  const selectedPricing = selectedCompany ? pricing[selectedCompany] : undefined;
  const deliveryPrice = selectedPricing
    ? selectedPricing[`${customerInfo.deliveryType}Price` as 'homePrice' | 'officePrice' | 'communePrice'] ?? 0
    : 0;

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round((cartTotal * appliedCoupon.discount) / 100)
      : appliedCoupon.discount
    : 0;

  const total = cartTotal - couponDiscount + deliveryPrice;

  const handleApplyCoupon = async () => {
    const coupons = await getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (!coupon) {
      setCouponMessage('كود الخصم غير صالح');
      return;
    }
    if (new Date(coupon.expiresAt) < new Date()) {
      setCouponMessage('انتهت صلاحية هذا الكود');
      return;
    }
    if (coupon.usedCount >= coupon.maxUses) {
      setCouponMessage('تم استخدام هذا الكود الحد الأقصى من المرات');
      return;
    }
    if (cartTotal < coupon.minOrder) {
      setCouponMessage(`الحد الأدنى للطلب ${coupon.minOrder.toLocaleString('ar-DZ')} دج`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponMessage('تم تطبيق الخصم بنجاح!');
    setCouponCode('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Validate customer information
    if (!customerInfo.fullName.trim()) {
      alert('يرجى إدخال الاسم الكامل');
      return;
    }
    if (!customerInfo.phone.trim()) {
      alert('يرجى إدخال رقم الهاتف');
      return;
    }
    if (!customerInfo.wilaya) {
      alert('يرجى اختيار الولاية');
      return;
    }
    if (!customerInfo.commune) {
      alert('يرجى اختيار البلدية');
      return;
    }
    if (!customerInfo.address.trim()) {
      alert('يرجى إدخال العنوان');
      return;
    }
    if (!selectedCompany) {
      alert('يرجى اختيار شركة التوصيل');
      return;
    }

    setIsSubmitting(true);
    trackEvent('initiate_checkout', {
      value: total,
      currency: 'DZD',
      num_items: cart.length,
    });

    try {
      const newOrderId = crypto.randomUUID();
      const displayOrderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const company = deliveryCompanies.find((c) => c.id === selectedCompany);

      const orderToCreate = {
        id: newOrderId,
        items: cart,
        customer: customerInfo,
        status: 'pending' as const,
        paymentMethod,
        deliveryCompanyId: selectedCompany,
        deliveryCompanyName: company?.nameAr || '',
        deliveryPrice,
        subtotal: cartTotal,
        total,
        couponCode: appliedCoupon?.code,
        couponDiscount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'website' as const,
      };

      await addOrder(orderToCreate);

      trackEvent('purchase', {
        order_id: displayOrderId,
        value: total,
        currency: 'DZD',
      });

      clearCart();
      setOrderId(displayOrderId);
      setOrderSuccess(true);
    } catch (error) {
      console.error('Failed to create order:', error);
      let errorMessage = 'خطأ غير معروف';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      } else if (error && typeof error === 'object' && 'error' in error) {
        errorMessage = (error as any).error;
      }
      alert(`حدث خطأ في إنشاء الطلب: ${errorMessage}. يرجى المحاولة مرة أخرى.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          تم تأكيد طلبك بنجاح!
        </h2>
        <p className="text-stone-500 mb-2">رقم الطلب: <span className="font-bold text-[#8b1a2b]">{orderId}</span></p>
        <p className="text-stone-500 mb-8">سيتم التواصل معك قريباً لتأكيد الطلب</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/orders')}>تتبع الطلب</Button>
          <Button variant="outline" onClick={() => navigate('/products')}>متابعة التسوق</Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        إتمام الطلب
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                <User size={18} className="text-[#8b1a2b]" />
                معلومات العميل
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">الاسم الكامل *</label>
                  <Input
                    required
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                    placeholder="أدخلي اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">رقم الهاتف *</label>
                  <Input
                    required
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                <MapPin size={18} className="text-[#8b1a2b]" />
                عنوان التوصيل
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">الولاية *</label>
                  <Select
                    required
                    value={customerInfo.wilaya}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, wilaya: e.target.value, commune: '' })
                    }
                  >
                    <option value="">اختاري الولاية</option>
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.nameAr}>
                        {w.code} - {w.nameAr}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 mb-1 block">البلدية *</label>
                  <Select
                    required
                    value={customerInfo.commune}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, commune: e.target.value })}
                    disabled={!customerInfo.wilaya}
                  >
                    <option value="">اختاري البلدية</option>
                    {communes.map((c) => (
                      <option key={c.code} value={c.nameAr}>
                        {c.nameAr}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-stone-600 mb-1 block">العنوان بالتفصيل *</label>
                  <Input
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="الحي، الشارع، رقم العمارة..."
                  />
                </div>
              </div>

              {/* Delivery Type */}
              <div className="mt-4">
                <label className="text-sm font-medium text-stone-600 mb-2 block">نوع التوصيل</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'home' as const, label: 'للمنزل', icon: Truck, price: selectedPricing?.homePrice ?? 0 },
                    { value: 'office' as const, label: 'المكتب', icon: Building2, price: selectedPricing?.officePrice ?? 0 },
                    { value: 'commune' as const, label: 'البلدية', icon: MapPin, price: selectedPricing?.communePrice ?? 0 },
                  ] as const).map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setCustomerInfo({ ...customerInfo, deliveryType: type.value })
                      }
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        customerInfo.deliveryType === type.value
                          ? 'border-[#8b1a2b] bg-[#8b1a2b]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <type.icon size={20} className={`mx-auto mb-1 ${
                        customerInfo.deliveryType === type.value ? 'text-[#8b1a2b]' : 'text-stone-400'
                      }`} />
                      <span className="text-xs font-semibold block">{type.label}</span>
                      {type.price > 0 && (
                        <span className="text-[10px] text-stone-500">{formatPrice(type.price)} دج</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Company */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                <Truck size={18} className="text-[#8b1a2b]" />
                شركة التوصيل
              </h3>
              <div className="space-y-2">
                {deliveryCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompany(company.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedCompany === company.id
                        ? 'border-[#8b1a2b] bg-[#8b1a2b]/5'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{company.logo}</span>
                      <span className="font-semibold text-stone-800">{company.nameAr}</span>
                    </div>
                    {customerInfo.wilaya && (
                      <span className="text-sm font-bold text-[#8b1a2b]">
                        {formatPrice(
                          pricing[company.id]?.[
                            `${customerInfo.deliveryType}Price` as 'homePrice' | 'officePrice' | 'communePrice'
                          ] ?? 0
                        )} دج
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                <CreditCard size={18} className="text-[#8b1a2b]" />
                طريقة الدفع
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#8b1a2b] bg-[#8b1a2b]/5'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">💵</span>
                  <div className="text-right">
                    <span className="font-semibold text-stone-800 block">الدفع عند الاستلام</span>
                    <span className="text-xs text-stone-500">تدفعين عند استلام الطرد</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('baridimob')}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'baridimob'
                      ? 'border-[#8b1a2b] bg-[#8b1a2b]/5'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">🏦</span>
                  <div className="text-right">
                    <span className="font-semibold text-stone-800 block">BaridiMob</span>
                    <span className="text-xs text-stone-500">تحويل عبر CCP/RIP</span>
                  </div>
                </button>

                {paymentMethod === 'baridimob' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 rounded-xl p-4 text-sm"
                  >
                    <p className="font-semibold text-amber-800 mb-2">تعليمات الدفع عبر BaridiMob:</p>
                    <ul className="space-y-1 text-amber-700 text-xs">
                      <li>• CCP: 001234567890</li>
                      <li>• RIP: 00799901234567890123</li>
                      <li>• الاسم: متجر ملابس للتجارة</li>
                      <li>• أرسلي لقطة الشاشة بعد التحويل عبر واتساب</li>
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
              <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                ملخص الطلب
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-stone-400">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-stone-700">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-stone-100 mb-4" />

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="كود الخصم"
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode}
                  >
                    تطبيق
                  </Button>
                </div>
                {couponMessage && (
                  <p className={`text-xs mt-1 ${couponMessage.includes('نجاح') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMessage}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center justify-between mt-2 bg-emerald-50 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-semibold text-emerald-700">{appliedCoupon.code}</span>
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponMessage(''); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      إزالة
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(cartTotal)} دج</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>الخصم</span>
                    <span>-{formatPrice(couponDiscount)} دج</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>التوصيل</span>
                  <span>{deliveryPrice > 0 ? `${formatPrice(deliveryPrice)} دج` : 'يحدد لاحقاً'}</span>
                </div>
                <hr className="border-stone-100" />
                <div className="flex justify-between font-bold text-stone-900 text-base">
                  <span>المجموع الكلي</span>
                  <span className="text-[#8b1a2b]">{formatPrice(total)} دج</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
