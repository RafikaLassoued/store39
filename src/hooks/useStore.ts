import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductColor, Order, Coupon } from '../types';
import { PRODUCTS, SAMPLE_ORDERS, COUPONS } from '../data/seed';
import { trackEvent } from '../lib/tracking';

interface StoreState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: ProductColor, quantity?: number) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  couponDiscount: () => number;

  // Admin - Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Admin - Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ---- Cart ----
      cart: [],

      addToCart: (product, size, color, quantity = 1) => {
        const existing = get().cart.find(
          (item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor?.hex === color?.hex
        );

        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item.product.id === product.id &&
              item.selectedSize === size &&
              item.selectedColor?.hex === color?.hex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cart: [...get().cart, { product, quantity, selectedSize: size, selectedColor: color }] });
        }

        trackEvent('add_to_cart', {
          content_name: product.name,
          content_id: product.id,
          value: product.price,
          currency: 'DZD',
        });
      },

      removeFromCart: (productId, size, color) => {
        set({
          cart: get().cart.filter(
            (item) =>
              !(item.product.id === productId && item.selectedSize === size && item.selectedColor?.hex === color)
          ),
        });
        trackEvent('remove_from_cart', { content_id: productId });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId && item.selectedSize === size && item.selectedColor?.hex === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      cartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // ---- Orders ----
      orders: SAMPLE_ORDERS,

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
        trackEvent('order_created', {
          order_id: order.id,
          value: order.total,
          currency: 'DZD',
        });
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
          ),
        });
      },

      // ---- Coupon ----
      appliedCoupon: null,

      applyCoupon: (code) => {
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
        );
        if (!coupon) {
          return { success: false, message: 'كود الخصم غير صالح' };
        }
        if (coupon.usedCount >= coupon.maxUses) {
          return { success: false, message: 'تم استخدام هذا الكود الحد الأقصى من المرات' };
        }
        if (new Date(coupon.expiresAt) < new Date()) {
          return { success: false, message: 'انتهت صلاحية هذا الكود' };
        }
        const total = get().cartTotal();
        if (total < coupon.minOrder) {
          return { success: false, message: `الحد الأدنى للطلب ${coupon.minOrder.toLocaleString('ar-DZ')} دج` };
        }
        set({ appliedCoupon: coupon });
        return { success: true, message: 'تم تطبيق الخصم بنجاح!' };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      couponDiscount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const total = get().cartTotal();
        if (coupon.type === 'percentage') {
          return Math.round((total * coupon.discount) / 100);
        }
        return coupon.discount;
      },

      // ---- Admin Products ----
      products: PRODUCTS,

      addProduct: (product) => set({ products: [product, ...get().products] }),

      updateProduct: (id, updates) =>
        set({
          products: get().products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }),

      deleteProduct: (id) =>
        set({ products: get().products.filter((p) => p.id !== id) }),

      // ---- Admin Coupons ----
      coupons: COUPONS,

      addCoupon: (coupon) => set({ coupons: [coupon, ...get().coupons] }),

      toggleCoupon: (id) =>
        set({
          coupons: get().coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        }),
    }),
    {
      name: 'anaqati-store',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        products: state.products,
        coupons: state.coupons,
      }),
    }
  )
);
