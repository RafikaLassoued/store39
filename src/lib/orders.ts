import { supabase } from './supabase';
import type { Order } from '../types';

type OrderPayload = {
  items?: Order['items'];
  customer?: Order['customer'];
  paymentMethod?: Order['paymentMethod'];
  deliveryCompanyId?: string;
  deliveryCompanyName?: string;
  trackingNumber?: string;
  deliveryPrice?: number;
  subtotal?: number;
  total?: number;
  couponCode?: string;
  couponDiscount?: number;
  source?: Order['source'];
};

type OrderRow = {
  id: string;
  payload?: OrderPayload | null;
  status: Order['status'];
  created_at: string;
};

function mapOrderRow(row: OrderRow): Order {
  return {
    id: row.id,
    items: row.payload?.items || [],
    customer: row.payload?.customer || ({} as Order['customer']),
    status: row.status,
    paymentMethod: row.payload?.paymentMethod || 'cod',
    deliveryCompanyId: row.payload?.deliveryCompanyId || '',
    deliveryCompanyName: row.payload?.deliveryCompanyName || '',
    trackingNumber: row.payload?.trackingNumber,
    deliveryPrice: row.payload?.deliveryPrice || 0,
    subtotal: row.payload?.subtotal || 0,
    total: row.payload?.total || 0,
    couponCode: row.payload?.couponCode,
    couponDiscount: row.payload?.couponDiscount || 0,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    source: row.payload?.source || 'website',
  };
}

// ✅ Get all orders
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

// ✅ Get order by ID
export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    items: data.payload?.items || [],
    customer: data.payload?.customer || {},
    status: data.status,
    paymentMethod: data.payload?.paymentMethod || 'cod',
    deliveryCompanyId: data.payload?.deliveryCompanyId || '',
    deliveryCompanyName: data.payload?.deliveryCompanyName || '',
    trackingNumber: data.payload?.trackingNumber,
    deliveryPrice: data.payload?.deliveryPrice || 0,
    subtotal: data.payload?.subtotal || 0,
    total: data.payload?.total || 0,
    couponCode: data.payload?.couponCode,
    couponDiscount: data.payload?.couponDiscount || 0,
    createdAt: data.created_at,
    updatedAt: data.created_at,
    source: data.payload?.source || 'website',
  };
}

// ✅ Get orders by customer
export async function getOrdersByCustomer(phone: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('customer_phone', phone)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

// ✅ Get orders by status
export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

// ✅ Create order
export async function createOrder(order: Order): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .insert({
      id: order.id,
      customer_name: order.customer.fullName,
      customer_phone: order.customer.phone,
      payload: {
        items: order.items,
        customer: order.customer,
        paymentMethod: order.paymentMethod,
        deliveryCompanyId: order.deliveryCompanyId,
        deliveryCompanyName: order.deliveryCompanyName,
        trackingNumber: order.trackingNumber,
        deliveryPrice: order.deliveryPrice,
        subtotal: order.subtotal,
        total: order.total,
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount,
        source: order.source,
      },
      status: order.status,
    });

  if (error) throw error;
}

// ✅ Update order status
export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// ✅ Update order tracking number
export async function updateOrderTracking(id: string, trackingNumber: string): Promise<void> {
  // Get current order
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');

  // Update payload with new tracking number
  const { error } = await supabase
    .from('orders')
    .update({
      payload: {
        ...order,
        trackingNumber,
      },
    })
    .eq('id', id);

  if (error) throw error;
}

// ✅ Update order delivery company
export async function updateOrderDelivery(
  id: string,
  deliveryCompanyId: string,
  deliveryCompanyName: string
): Promise<void> {
  const order = await getOrderById(id);
  if (!order) throw new Error('Order not found');

  const { error } = await supabase
    .from('orders')
    .update({
      payload: {
        ...order,
        deliveryCompanyId,
        deliveryCompanyName,
      },
    })
    .eq('id', id);

  if (error) throw error;
}

// ✅ Delete order
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ✅ Search orders
export async function searchOrders(query: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .or(`id.ilike.%${query}%,customer_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as OrderRow[]).map(mapOrderRow);
}

// ✅ Get orders count by status
export async function getOrderCountByStatus(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('orders')
    .select('status');

  if (error) throw error;

  const counts: Record<string, number> = {};
  ((data ?? []) as Array<{ status: Order['status'] }>).forEach((row) => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });

  return counts;
}

// ✅ Get total revenue
export async function getTotalRevenue(): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('payload');

  if (error) throw error;

  return ((data ?? []) as Array<{ payload?: { total?: number | string } | null }>).reduce((sum, row) => {
    return sum + (parseFloat(String(row.payload?.total || 0)) || 0);
  }, 0);
}

// ✅ Get revenue by date range
export async function getRevenueByDateRange(startDate: string, endDate: string): Promise<{date: string; revenue: number}[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, payload')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const revenueMap = new Map<string, number>();
  ((data ?? []) as Array<{ created_at: string; payload?: { total?: number | string } | null }>).
    forEach((row) => {
    const date = new Date(row.created_at).toISOString().split('T')[0];
    const revenue = parseFloat(String(row.payload?.total || 0)) || 0;
    revenueMap.set(date, (revenueMap.get(date) || 0) + revenue);
  });

  return Array.from(revenueMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}
