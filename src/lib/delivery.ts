import type { DeliveryPricing, DeliveryCompany } from '../types';
import { DELIVERY_COMPANIES } from '../data/seed';

// Simulated delivery pricing based on wilaya zones
const ZONE_PRICES: Record<string, { home: number; office: number; commune: number }> = {
  'الجزائر': { home: 400, office: 300, commune: 350 },
  'وهران': { home: 500, office: 350, commune: 400 },
  'قسنطينة': { home: 500, office: 350, commune: 400 },
  'سطيف': { home: 550, office: 400, commune: 450 },
  'البليدة': { home: 400, office: 300, commune: 350 },
  'تيزي وزو': { home: 450, office: 350, commune: 400 },
  'بجاية': { home: 500, office: 350, commune: 400 },
  'عنابة': { home: 550, office: 400, commune: 450 },
  'باتنة': { home: 600, office: 450, commune: 500 },
  'تلمسان': { home: 600, office: 450, commune: 500 },
  default: { home: 700, office: 500, commune: 550 },
};

export function calculateDeliveryPrice(
  wilayaName: string,
  deliveryType: 'home' | 'office' | 'commune',
  companyId?: string
): number {
  const company = companyId
    ? DELIVERY_COMPANIES.find((c) => c.id === companyId)
    : null;

  if (company && !company.isActive) {
    return -1; // Company not active
  }

  const zonePrice = ZONE_PRICES[wilayaName] || ZONE_PRICES['default'];
  let price = zonePrice[deliveryType];

  // Company-specific adjustments
  if (company?.id === 'dc-2') {
    price = Math.round(price * 1.1); // ZR Express is slightly more expensive
  }

  return price;
}

export function getDeliveryPricingForWilaya(
  wilayaName: string
): { home: number; office: number; commune: number }[] {
  const zonePrice = ZONE_PRICES[wilayaName] || ZONE_PRICES['default'];
  return DELIVERY_COMPANIES.filter((c) => c.isActive).map((company) => {
    const multiplier = company.id === 'dc-2' ? 1.1 : 1;
    return {
      home: Math.round(zonePrice.home * multiplier),
      office: Math.round(zonePrice.office * multiplier),
      commune: Math.round(zonePrice.commune * multiplier),
    };
  });
}

// Simulated API call to create a delivery order
export async function createDeliveryOrder(orderData: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  commune: string;
  address: string;
  deliveryType: 'home' | 'office' | 'commune';
  companyId: string;
  products: string;
  amount: number;
}): Promise<{ success: boolean; trackingNumber: string }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const company = DELIVERY_COMPANIES.find((c) => c.id === orderData.companyId);
  const prefix = company?.name === 'Yalidine' ? 'YAL' : 'ZR';

  return {
    success: true,
    trackingNumber: `${prefix}-${Date.now()}`,
  };
}

// Simulated API call to track delivery
export async function trackDelivery(
  trackingNumber: string,
  companyId: string
): Promise<{
  status: string;
  history: { date: string; status: string; location: string }[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    status: 'in_delivery',
    history: [
      { date: '2024-01-28 09:00', status: 'تم الاستلام من التاجر', location: 'الجزائر' },
      { date: '2024-01-28 14:00', status: 'في المستودع', location: 'الجزائر' },
      { date: '2024-01-29 08:00', status: 'قيد التوصيل', location: 'وهران' },
    ],
  };
}

export function getActiveDeliveryCompanies(): DeliveryCompany[] {
  return DELIVERY_COMPANIES.filter((c) => c.isActive);
}
