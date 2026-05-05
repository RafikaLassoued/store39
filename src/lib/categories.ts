import { supabase } from './supabase';
import type { Category } from '../types';

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image: string;
  created_at: string;
};

// ✅ Get all categories
export async function getCategories(abortSignal?: AbortSignal): Promise<Category[]> {
  const query = supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (abortSignal) {
    query.abortSignal(abortSignal);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row: CategoryRow) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    productCount: 0, // Will be updated by counting products
  }));
}

// ✅ Get categories with product count
export async function getCategoriesWithCount(): Promise<Category[]> {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (catError) throw catError;

  // Count products for each category
  const result: Category[] = [];
  for (const cat of categories ?? []) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);

    if (countError) throw countError;

    result.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      productCount: count ?? 0,
    });
  }

  return result;
}

// ✅ Get single category by ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Count products
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    image: data.image,
    productCount: count ?? 0,
  };
}

// ✅ Get category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Count products
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', data.id);

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    image: data.image,
    productCount: count ?? 0,
  };
}

// ✅ Create category
export async function createCategory(category: Omit<Category, 'id' | 'productCount'>): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      slug: category.slug,
      image: category.image,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// ✅ Update category
export async function updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'productCount'>>): Promise<void> {
  const mapped: Record<string, string> = {};

  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.slug !== undefined) mapped.slug = updates.slug;
  if (updates.image !== undefined) mapped.image = updates.image;

  const { error } = await supabase
    .from('categories')
    .update(mapped)
    .eq('id', id);

  if (error) throw error;
}

// ✅ Delete category
export async function deleteCategory(id: string): Promise<void> {
  // First, update products to remove category association
  await supabase
    .from('products')
    .update({ category_id: null })
    .eq('category_id', id);

  // Then delete category
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ✅ Search categories
export async function searchCategories(query: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const result: Category[] = [];
  for (const cat of data ?? []) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', cat.id);

    result.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      productCount: count ?? 0,
    });
  }

  return result;
}
