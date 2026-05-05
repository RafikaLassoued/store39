import { supabase } from './supabase';
import type { DeliveryCompany, DeliveryPricing } from '../types';

type DeliveryCompanyRow = {
  id: string;
  name: string;
  name_ar: string;
  api_key: string;
  api_url: string;
  is_active: boolean;
  logo: string;
};

type DeliveryPricingRow = {
  company_id: string;
  wilaya_code: number;
  home_price: number;
  office_price: number;
  commune_price: number;
};

// ============ DELIVERY COMPANIES ============

// ✅ Get all delivery companies
export async function getDeliveryCompanies(): Promise<DeliveryCompany[]> {
  const { data, error } = await supabase
    .from('delivery_companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: DeliveryCompanyRow) => ({
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    apiKey: row.api_key,
    apiUrl: row.api_url,
    isActive: row.is_active,
    logo: row.logo,
  }));
}

// ✅ Get active delivery companies
export async function getActiveDeliveryCompanies(): Promise<DeliveryCompany[]> {
  const { data, error } = await supabase
    .from('delivery_companies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: DeliveryCompanyRow) => ({
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    apiKey: row.api_key,
    apiUrl: row.api_url,
    isActive: row.is_active,
    logo: row.logo,
  }));
}

// ✅ Get delivery company by ID
export async function getDeliveryCompanyById(id: string): Promise<DeliveryCompany | null> {
  const { data, error } = await supabase
    .from('delivery_companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    nameAr: data.name_ar,
    apiKey: data.api_key,
    apiUrl: data.api_url,
    isActive: data.is_active,
    logo: data.logo,
  };
}

// ✅ Create delivery company
export async function createDeliveryCompany(company: Omit<DeliveryCompany, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .from('delivery_companies')
    .insert({
      name: company.name,
      name_ar: company.nameAr,
      api_key: company.apiKey,
      api_url: company.apiUrl,
      is_active: company.isActive,
      logo: company.logo,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// ✅ Update delivery company
export async function updateDeliveryCompany(id: string, updates: Partial<Omit<DeliveryCompany, 'id'>>): Promise<void> {
  const mapped: Record<string, string | boolean> = {};

  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.nameAr !== undefined) mapped.name_ar = updates.nameAr;
  if (updates.apiKey !== undefined) mapped.api_key = updates.apiKey;
  if (updates.apiUrl !== undefined) mapped.api_url = updates.apiUrl;
  if (updates.isActive !== undefined) mapped.is_active = updates.isActive;
  if (updates.logo !== undefined) mapped.logo = updates.logo;

  const { error } = await supabase
    .from('delivery_companies')
    .update(mapped)
    .eq('id', id);

  if (error) throw error;
}

// ✅ Toggle delivery company active status
export async function toggleDeliveryCompany(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('delivery_companies')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

// ✅ Delete delivery company
export async function deleteDeliveryCompany(id: string): Promise<void> {
  // Delete pricing first
  await supabase
    .from('delivery_pricing')
    .delete()
    .eq('company_id', id);

  // Delete company
  const { error } = await supabase
    .from('delivery_companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ DELIVERY PRICING ============

// ✅ Get pricing for company and wilaya
export async function getDeliveryPricing(companyId: string, wilayaCode: number): Promise<DeliveryPricing | null> {
  const { data, error } = await supabase
    .from('delivery_pricing')
    .select('*')
    .eq('company_id', companyId)
    .eq('wilaya_code', wilayaCode)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    companyId: data.company_id,
    wilayaCode: data.wilaya_code,
    homePrice: data.home_price,
    officePrice: data.office_price,
    communePrice: data.commune_price,
  };
}

// ✅ Get all pricing for company
export async function getCompanyPricing(companyId: string): Promise<DeliveryPricing[]> {
  const { data, error } = await supabase
    .from('delivery_pricing')
    .select('*')
    .eq('company_id', companyId);

  if (error) throw error;

  return (data ?? []).map((row: DeliveryPricingRow) => ({
    companyId: row.company_id,
    wilayaCode: row.wilaya_code,
    homePrice: row.home_price,
    officePrice: row.office_price,
    communePrice: row.commune_price,
  }));
}

// ✅ Create or update pricing
export async function upsertDeliveryPricing(pricing: DeliveryPricing): Promise<void> {
  const { error } = await supabase
    .from('delivery_pricing')
    .upsert({
      company_id: pricing.companyId,
      wilaya_code: pricing.wilayaCode,
      home_price: pricing.homePrice,
      office_price: pricing.officePrice,
      commune_price: pricing.communePrice,
    });

  if (error) throw error;
}

// ✅ Delete pricing
export async function deleteDeliveryPricing(companyId: string, wilayaCode: number): Promise<void> {
  const { error } = await supabase
    .from('delivery_pricing')
    .delete()
    .eq('company_id', companyId)
    .eq('wilaya_code', wilayaCode);

  if (error) throw error;
}

// ✅ Bulk upsert pricing
export async function bulkUpsertPricing(pricing: DeliveryPricing[]): Promise<void> {
  const rows = pricing.map(p => ({
    company_id: p.companyId,
    wilaya_code: p.wilayaCode,
    home_price: p.homePrice,
    office_price: p.officePrice,
    commune_price: p.communePrice,
  }));

  const { error } = await supabase
    .from('delivery_pricing')
    .upsert(rows);

  if (error) throw error;
}
