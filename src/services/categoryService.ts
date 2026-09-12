import { supabase } from '@/lib/supabase';
import type { Category, CreateCategoryInput } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as Category[];
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data as Category;
  },

  async create(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async update(id: string, input: Partial<CreateCategoryInput>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
