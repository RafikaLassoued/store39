import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductColor, Order, Coupon, Category } from '../types';
import { trackEvent } from '../lib/tracking';
import * as productsApi from '../lib/products';
import * as categoriesApi from '../lib/categories';
import * as ordersApi from '../lib/orders';
import * as storeApi from '../lib/supabaseStore';

interface StoreState {
  // ========== LOADING STATES ==========
  isLoading: boolean;
  error: string | null;

  // ========== CART ==========
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: ProductColor, quantity?: number) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // ========== ORDERS ==========
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  loadOrders: () => Promise<void>;

  // ========== COUPON ==========
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  couponDiscount: () => number;

  // ========== PRODUCTS ==========
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  loadProducts: () => Promise<void>;

  // ========== COUPONS ==========
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
  loadCoupons: () => Promise<void>;

  // ========== CATEGORIES ==========
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  loadCategories: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // ========== STATES ==========
      isLoading: false,
      error: null,

      // ========== CART ==========
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
          set({
            cart: [
              ...get().cart,
              { product, quantity, selectedSize: size, selectedColor: color },
            ],
          });
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
              !(
                item.product.id === productId &&
                item.selectedSize === size &&
                item.selectedColor?.hex === color
              )
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
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor?.hex === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [], appliedCoupon: null }),

      cartTotal: () =>
        get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      // ========== ORDERS ==========
      orders: [],

      addOrder: async (order) => {
        try {
          set({ isLoading: true, error: null });

          await ordersApi.createOrder(order);

          set({
            orders: [
              {
                ...order,
                createdAt: order.createdAt || new Date().toISOString(),
                updatedAt: order.updatedAt || new Date().toISOString(),
              },
              ...get().orders,
            ],
          });

          trackEvent('order_created', {
            order_id: order.id,
            value: order.total,
            currency: 'DZD',
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'خطأ في إنشاء الطلب',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateOrderStatus: async (orderId, status) => {
        try {
          set({ isLoading: true, error: null });

          await ordersApi.updateOrderStatus(orderId, status);

          set({
            orders: get().orders.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    status,
                    updatedAt: new Date().toISOString(),
                  }
                : order
            ),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'خطأ في تحديث الطلب',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadOrders: async () => {
        try {
          set({ isLoading: true, error: null });

          const orders = await ordersApi.getOrders();

          set({
            orders: (orders || []).map((o: any) => ({
              ...o,
              createdAt: o.createdAt || o.created_at || new Date().toISOString(),
              updatedAt: o.updatedAt || o.updated_at,
            })),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'خطأ في تحميل الطلبات',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // ========== COUPON ==========
      appliedCoupon: null,

      applyCoupon: (code) => {
        const coupon = get().coupons.find(
          (c) =>
            c.code.toUpperCase() === code.toUpperCase() && c.isActive
        );

        if (!coupon) return { success: false, message: 'كود غير صالح' };

        set({ appliedCoupon: coupon });

        return { success: true, message: 'تم التطبيق' };
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      couponDiscount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;

        const total = get().cartTotal();

        return coupon.type === 'percentage'
          ? Math.round((total * coupon.discount) / 100)
          : coupon.discount;
      },

      // ========== PRODUCTS ==========
      products: [],

      addProduct: async (product) => {
        try {
          set({ isLoading: true, error: null });

          const id = await productsApi.createProduct(product);

          set({
            products: [{ ...product, id }, ...get().products],
          });
        } catch (error) {
          set({ error: 'خطأ في إضافة المنتج' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProduct: async (id, updates) => {
        await productsApi.updateProduct(id, updates);

        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        });
      },

      deleteProduct: async (id) => {
        await productsApi.deleteProduct(id);

        set({
          products: get().products.filter((p) => p.id !== id),
        });
      },

      loadProducts: async () => {
        const products = await productsApi.getProducts();
        set({ products });
      },

      // ========== COUPONS ==========
      coupons: [],

      addCoupon: async (coupon) => {
        const id = await storeApi.createCoupon(coupon);

        set({
          coupons: [{ ...coupon, id }, ...get().coupons],
        });
      },

      toggleCoupon: async (id) => {
        const coupon = get().coupons.find((c) => c.id === id);
        if (!coupon) return;

        await storeApi.toggleCoupon(id, !coupon.isActive);

        set({
          coupons: get().coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        });
      },

      loadCoupons: async () => {
        const coupons = await storeApi.getCoupons();
        set({ coupons });
      },

      // ========== CATEGORIES ==========
      categories: [],

      setCategories: (cats) => set({ categories: cats }),

      loadCategories: async () => {
        const categories = await categoriesApi.getCategories();
        set({ categories });
      },
    }),
    {
      name: 'anaqati-store',
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        products: state.products,
        coupons: state.coupons,
        categories: state.categories,
      }),
    }
  )
);