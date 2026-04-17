import type { Product, ProductColor, CustomerInfo } from '../types';

const WHATSAPP_NUMBER = '213555123456'; // Replace with actual number

export function generateWhatsAppMessage(
  product: Product,
  selectedSize?: string,
  selectedColor?: ProductColor,
  customerInfo?: Partial<CustomerInfo>
): string {
  const lines = [
    `مرحبا، أريد طلب: *${product.name}*`,
    `السعر: *${product.price.toLocaleString('ar-DZ')}* دج`,
  ];

  if (selectedSize) {
    lines.push(`المقاس: ${selectedSize}`);
  }

  if (selectedColor) {
    lines.push(`اللون: ${selectedColor.nameAr}`);
  }

  if (customerInfo?.wilaya) {
    lines.push(`الولاية: ${customerInfo.wilaya}`);
  }

  if (customerInfo?.commune) {
    lines.push(`البلدية: ${customerInfo.commune}`);
  }

  if (customerInfo?.phone) {
    lines.push(`الهاتف: ${customerInfo.phone}`);
  }

  if (customerInfo?.address) {
    lines.push(`العنوان: ${customerInfo.address}`);
  }

  // Add product image
  if (product.images[0]) {
    lines.push(`\nصورة المنتج: ${product.images[0]}`);
  }

  return lines.join('\n');
}

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

export function openWhatsAppGeneral(): void {
  const message = encodeURIComponent('مرحبا، أريد الاستفسار عن منتجاتكم');
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}
