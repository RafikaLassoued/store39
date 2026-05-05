import type { Order } from '../types';

const webhookUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL as string | undefined;

const buildGoogleSheetsPayload = (order: Order) => {
  const items = order.items.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    size: item.selectedSize ?? '',
    color: item.selectedColor?.nameAr ?? item.selectedColor?.name ?? '',
    unitPrice: item.product.price,
    totalPrice: item.product.price * item.quantity,
  }));

  return {
    id: order.id,
    customerName: order.customer.fullName,
    customerPhone: order.customer.phone,
    wilaya: order.customer.wilaya,
    commune: order.customer.commune,
    address: order.customer.address,
    deliveryType: order.customer.deliveryType,
    paymentMethod: order.paymentMethod,
    deliveryCompany: order.deliveryCompanyName,
    deliveryPrice: order.deliveryPrice,
    subtotal: order.subtotal,
    couponCode: order.couponCode ?? '',
    couponDiscount: order.couponDiscount,
    total: order.total,
    status: order.status,
    source: order.source,
    createdAt: order.createdAt,
    items,
  };
};

export async function sendOrderToGoogleSheets(order: Order): Promise<void> {
  if (!webhookUrl) {
    console.warn('[Google Sheets] Missing webhook URL. Order sync skipped.', { orderId: order.id });
    return;
  }

  const payload = buildGoogleSheetsPayload(order);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Google Sheets webhook failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    if (responseText) {
      try {
        const json = JSON.parse(responseText);
        if (json && json.success === false) {
          throw new Error(`Google Sheets webhook response error: ${json.error ?? JSON.stringify(json)}`);
        }
      } catch (parseError) {
        console.warn('[Google Sheets] Response was not valid JSON.', { parseError, responseText });
      }
    }

    console.info('[Google Sheets] Order synced successfully.', { orderId: order.id });
  } catch (error) {
    console.error('[Google Sheets] sendOrderToGoogleSheets failed.', {
      orderId: order.id,
      webhookUrl,
      error,
    });
    throw error instanceof Error ? error : new Error('Google Sheets webhook failed with unknown error');
  }
}
