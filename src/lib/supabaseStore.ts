import { supabase } from './supabase';
import type { CmsPage, Coupon, PixelSettings, SocialLinks } from '../types';

type CmsPageRow = {
  slug: string;
  title: string;
  content: string;
  updated_at: string;
};

type AnalyticsEventRow = {
  id: string;
  event_name: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

type CouponRow = {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  min_order: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
};

type StoreSettingsRow = {
  key: string;
  value: string;
};

// ============ STORE SETTINGS ============

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data?.value ?? null;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('key, value');

  if (error) throw error;

  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: StoreSettingsRow) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('store_settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
}

export async function bulkUpsertSettings(settings: Record<string, string>): Promise<void> {
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await supabase
    .from('store_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) throw error;
}

export async function deleteSetting(key: string): Promise<void> {
  const { error } = await supabase
    .from('store_settings')
    .delete()
    .eq('key', key);

  if (error) throw error;
}

// ============ COUPONS ============

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CouponRow[]).map((row) => ({
    id: row.id,
    code: row.code,
    discount: row.discount,
    type: row.type,
    minOrder: row.min_order,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    isActive: row.is_active,
    expiresAt: row.expires_at,
  }));
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    discount: data.discount,
    type: data.type,
    minOrder: data.min_order,
    maxUses: data.max_uses,
    usedCount: data.used_count,
    isActive: data.is_active,
    expiresAt: data.expires_at,
  };
}

export async function getActiveCoupon(): Promise<Coupon | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .gte('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    discount: data.discount,
    type: data.type,
    minOrder: data.min_order,
    maxUses: data.max_uses,
    usedCount: data.used_count,
    isActive: data.is_active,
    expiresAt: data.expires_at,
  };
}

export async function createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<string> {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      min_order: coupon.minOrder,
      max_uses: coupon.maxUses,
      used_count: 0,
      is_active: coupon.isActive,
      expires_at: coupon.expiresAt,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateCoupon(id: string, updates: Partial<Omit<Coupon, 'id' | 'usedCount'>>): Promise<void> {
  const mapped: Record<string, unknown> = {};

  if (updates.code !== undefined) mapped.code = updates.code;
  if (updates.discount !== undefined) mapped.discount = updates.discount;
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.minOrder !== undefined) mapped.min_order = updates.minOrder;
  if (updates.maxUses !== undefined) mapped.max_uses = updates.maxUses;
  if (updates.isActive !== undefined) mapped.is_active = updates.isActive;
  if (updates.expiresAt !== undefined) mapped.expires_at = updates.expiresAt;

  const { error } = await supabase
    .from('coupons')
    .update(mapped)
    .eq('id', id);

  if (error) throw error;
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementCouponUsage(id: string): Promise<void> {
  const { data: coupon, error: fetchError } = await supabase
    .from('coupons')
    .select('used_count')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!coupon) throw new Error('Coupon not found');

  const { error } = await supabase
    .from('coupons')
    .update({ used_count: coupon.used_count + 1 })
    .eq('id', id);

  if (error) throw error;
}

// ============ CMS PAGES ============

export async function getCmsPages(): Promise<CmsPage[]> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*');

  if (error) throw error;

  return (data ?? []).map((row: CmsPageRow) => ({
    slug: row.slug as CmsPage['slug'],
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at,
  }));
}

export async function getCmsPage(slug: CmsPage['slug']): Promise<CmsPage | null> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    slug: data.slug,
    title: data.title,
    content: data.content,
    updatedAt: data.updated_at,
  };
}

export async function updateCmsPage(slug: CmsPage['slug'], title: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('cms_pages')
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (error) throw error;
}

// ============ PIXEL SETTINGS ============

export async function getPixelSettings(): Promise<PixelSettings> {
  const { data, error } = await supabase.from('store_settings').select('key, value').in('key', [
    'facebook_pixel_id',
    'google_analytics_id',
    'facebook_pixel_enabled',
    'google_analytics_enabled',
  ]);
  if (error) throw error;

  const map = new Map((data as StoreSettingsRow[]).map((row) => [row.key, row.value]));
  return {
    facebookPixelId: map.get('facebook_pixel_id') ?? '',
    googleAnalyticsId: map.get('google_analytics_id') ?? '',
    isFacebookEnabled: map.get('facebook_pixel_enabled') === 'true',
    isGoogleEnabled: map.get('google_analytics_enabled') === 'true',
  };
}

export async function savePixelSettings(payload: PixelSettings): Promise<void> {
  const rows: StoreSettingsRow[] = [
    { key: 'facebook_pixel_id', value: payload.facebookPixelId },
    { key: 'google_analytics_id', value: payload.googleAnalyticsId },
    { key: 'facebook_pixel_enabled', value: String(payload.isFacebookEnabled) },
    { key: 'google_analytics_enabled', value: String(payload.isGoogleEnabled) },
  ];
  const { error } = await supabase.from('store_settings').upsert(rows, { onConflict: 'key' });
  if (error) throw error;
}

// ============ SOCIAL LINKS ============

export async function getSocialLinks(): Promise<SocialLinks> {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .maybeSingle();

  if (error) throw error;

  return {
    facebook: data?.facebook ?? '',
    instagram: data?.instagram ?? '',
    tiktok: data?.tiktok ?? '',
    whatsapp: data?.whatsapp ?? '',
  };
}

// ============ ANALYTICS ============

export async function trackAnalyticsEvent(eventName: string, userId?: string, productId?: string, metadata?: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      event_name: eventName,
      user_id: userId,
      product_id: productId,
      metadata,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function getAnalyticsEvents(
  eventName?: string,
  startDate?: string,
  endDate?: string
): Promise<{id: string; eventName: string; userId?: string; metadata?: Record<string, unknown>; createdAt: string}[]> {
  let query = supabase
    .from('analytics_events')
    .select('*');

  if (eventName) {
    query = query.eq('event_name', eventName);
  }
  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: AnalyticsEventRow) => ({
    id: row.id,
    eventName: row.event_name,
    userId: row.user_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  }));
}

export async function saveSocialLinks(links: SocialLinks): Promise<void> {
  const existing = await getSocialLinks();

  if (existing) {
    const { error } = await supabase
      .from('social_links')
      .update({
        facebook: links.facebook,
        instagram: links.instagram,
        tiktok: links.tiktok,
        whatsapp: links.whatsapp,
      })
      .neq('id', 'null');

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('social_links')
      .insert({
        facebook: links.facebook,
        instagram: links.instagram,
        tiktok: links.tiktok,
        whatsapp: links.whatsapp,
      });

    if (error) throw error;
  }
}

export async function saveCmsPage(page: Pick<CmsPage, 'slug' | 'title' | 'content'>): Promise<void> {
  const { error } = await supabase.from('cms_pages').upsert(
    {
      slug: page.slug,
      title: page.title,
      content: page.content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' }
  );

  if (error) throw error;
}

