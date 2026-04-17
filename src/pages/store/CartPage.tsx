import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../lib/utils';
import { generateWhatsAppMessage, openWhatsApp } from '../../lib/whatsapp';

export function CartPage() {
  const cart = useStore((s) => s.cart);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const cartTotalVal = useStore((s) => s.cartTotal());
  const cartCountVal = useStore((s) => s.cartCount());
  const couponDiscountVal = useStore((s) => s.couponDiscount());
  const appliedCoupon = useStore((s) => s.appliedCoupon);

  const handleWhatsAppCart = () => {
    const messages = cart.map(
      (item) =>
        `• ${item.product.name} x${item.quantity} - ${(item.product.price * item.quantity).toLocaleString('ar-DZ')} دج`
    );
    const total = (cartTotalVal - couponDiscountVal).toLocaleString('ar-DZ');
    const message = `مرحبا، أريد طلب المنتجات التالية:\n\n${messages.join('\n')}\n\nالمجموع: *${total}* دج`;
    openWhatsApp(message);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-stone-400" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          سلة التسوق فارغة
        </h2>
        <p className="text-stone-500 mb-6">لم تقومي بإضافة أي منتجات بعد</p>
        <Link to="/products">
          <Button size="lg">تصفحي المنتجات</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        سلة التسوق ({cartCountVal} منتج)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor?.hex}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 bg-white rounded-2xl p-4 border border-stone-100"
              >
                {/* Image */}
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`}>
                    <h3 className="font-semibold text-stone-800 mb-1 hover:text-[#8b1a2b] transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    {item.selectedSize && <span>المقاس: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <>
                        <span className="text-stone-300">|</span>
                        <span className="flex items-center gap-1">
                          اللون:
                          <span
                            className="w-3 h-3 rounded-full inline-block border border-stone-200"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.nameAr}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor?.hex,
                            item.quantity - 1
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor?.hex,
                            item.quantity + 1
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-[#8b1a2b]">
                      {formatPrice(item.product.price * item.quantity)} دج
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() =>
                    removeFromCart(item.product.id, item.selectedSize, item.selectedColor?.hex)
                  }
                  className="flex-shrink-0 p-2 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
            <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              ملخص الطلب
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(cartTotalVal)} دج</span>
              </div>
              {couponDiscountVal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>الخصم ({appliedCoupon?.code})</span>
                  <span>-{formatPrice(couponDiscountVal)} دج</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>التوصيل</span>
                <span className="text-stone-400">يحدد عند الدفع</span>
              </div>
              <hr className="border-stone-100" />
              <div className="flex justify-between font-bold text-stone-900 text-base">
                <span>المجموع</span>
                <span className="text-[#8b1a2b]">
                  {formatPrice(cartTotalVal - couponDiscountVal)} دج
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link to="/checkout">
                <Button size="lg" className="w-full">
                  إتمام الطلب
                </Button>
              </Link>
              <Button
                variant="whatsapp"
                size="lg"
                className="w-full"
                onClick={handleWhatsAppCart}
              >
                <MessageCircle size={18} />
                اطلبي عبر واتساب
              </Button>
              <Link
                to="/products"
                className="flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-[#8b1a2b] transition-colors pt-2"
              >
                <ArrowLeft size={14} />
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
