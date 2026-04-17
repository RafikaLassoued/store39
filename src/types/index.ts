export interface Product {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  sizes: string[];
  colors: ProductColor[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface ProductColor {
  name: string;
  nameAr: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ProductColor;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  status: OrderStatus;
  paymentMethod: 'cod' | 'baridimob';
  deliveryCompanyId: string;
  deliveryCompanyName: string;
  trackingNumber?: string;
  deliveryPrice: number;
  subtotal: number;
  total: number;
  couponCode?: string;
  couponDiscount: number;
  createdAt: string;
  updatedAt: string;
  source: 'website' | 'whatsapp';
}

export type OrderStatus =
  | 'pending'
  | 'in_warehouse'
  | 'in_delivery'
  | 'delivered'
  | 'returned';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  in_warehouse: 'في المستودع',
  in_delivery: 'قيد التوصيل',
  delivered: 'تم التوصيل',
  returned: 'مرتجع',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_warehouse: 'bg-blue-100 text-blue-800',
  in_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800',
};

export interface CustomerInfo {
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'office' | 'commune';
}

export interface Wilaya {
  code: number;
  name: string;
  nameAr: string;
  communes: Commune[];
}

export interface Commune {
  code: number;
  name: string;
  nameAr: string;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  nameAr: string;
  apiKey: string;
  apiUrl: string;
  isActive: boolean;
  logo: string;
}

export interface DeliveryPricing {
  companyId: string;
  wilayaCode: number;
  homePrice: number;
  officePrice: number;
  communePrice: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minOrder: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { product: string; sold: number }[];
}

export interface TrackingEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}
