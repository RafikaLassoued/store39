import { supabase } from './supabase';
import type { Product } from '../types';

export type ProductRow = {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  price: number;
  old_price: number;
  images: string[];
  category_id: string;
  sizes: string[];
  colors: any;
  in_stock: boolean;
  featured: boolean;
  is_new: boolean;
  rating: number;
  review_count: number;
  created_at: string;
};

// ✅ Get all products
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: ProductRow & { categories?: { name: string } }) => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    images: row.images || [],
    category: row.categories?.name || '',
    categoryId: row.category_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    inStock: row.in_stock,
    featured: row.featured,
    isNew: row.is_new,
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  }));
}

// ✅ Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as ProductRow & { categories?: { name: string } };

  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    images: row.images || [],
    category: row.categories?.name || '',
    categoryId: row.category_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    inStock: row.in_stock,
    featured: row.featured,
    isNew: row.is_new,
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  };
}

// ✅ Get products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: ProductRow & { categories?: { name: string } }) => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    images: row.images || [],
    category: row.categories?.name || '',
    categoryId: row.category_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    inStock: row.in_stock,
    featured: row.featured,
    isNew: row.is_new,
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  }));
}

// ✅ Get featured products
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: ProductRow & { categories?: { name: string } }) => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    images: row.images || [],
    category: row.categories?.name || '',
    categoryId: row.category_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    inStock: row.in_stock,
    featured: row.featured,
    isNew: row.is_new,
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  }));
}

// ✅ Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .or(`name.ilike.%${query}%,name_en.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: ProductRow & { categories?: { name: string } }) => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    slug: row.slug,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    images: row.images || [],
    category: row.categories?.name || '',
    categoryId: row.category_id,
    sizes: row.sizes || [],
    colors: row.colors || [],
    inStock: row.in_stock,
    featured: row.featured,
    isNew: row.is_new,
    rating: row.rating,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  }));
}

// ✅ Create product
export async function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      name_en: product.nameEn,
      slug: product.slug,
      description: product.description,
      price: product.price,
      old_price: product.oldPrice,
      category_id: product.categoryId,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images,
      in_stock: product.inStock,
      featured: product.featured,
      is_new: product.isNew,
      rating: product.rating,
      review_count: product.reviewCount,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// ✅ Update product
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> {
  const mapped: Record<string, unknown> = {};

  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.nameEn !== undefined) mapped.name_en = updates.nameEn;
  if (updates.slug !== undefined) mapped.slug = updates.slug;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.price !== undefined) mapped.price = updates.price;
  if (updates.oldPrice !== undefined) mapped.old_price = updates.oldPrice;
  if (updates.categoryId !== undefined) mapped.category_id = updates.categoryId;
  if (updates.sizes !== undefined) mapped.sizes = updates.sizes;
  if (updates.colors !== undefined) mapped.colors = updates.colors;
  if (updates.images !== undefined) mapped.images = updates.images;
  if (updates.inStock !== undefined) mapped.in_stock = updates.inStock;
  if (updates.featured !== undefined) mapped.featured = updates.featured;
  if (updates.isNew !== undefined) mapped.is_new = updates.isNew;
  if (updates.rating !== undefined) mapped.rating = updates.rating;
  if (updates.reviewCount !== undefined) mapped.review_count = updates.reviewCount;

  const { error } = await supabase
    .from('products')
    .update(mapped)
    .eq('id', id);

  if (error) throw error;
}

// ✅ Delete product
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ✅ Bulk update products
export async function bulkUpdateProducts(updates: {id: string; data: Partial<Omit<Product, 'id' | 'createdAt'>>}[]): Promise<void> {
  for (const {id, data} of updates) {
    await updateProduct(id, data);
  }
}
