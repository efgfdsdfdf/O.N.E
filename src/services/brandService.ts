import { supabase } from '@/lib/supabase';
import type { Brand, CreateBrandInput } from '@/types';

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []) as Brand[];
  },

  async create(input: CreateBrandInput): Promise<Brand> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data, error } = await supabase
      .from('brands')
      .insert({ ...input, slug })
      .select()
      .single();

    if (error) throw error;
    return data as Brand;
  },

  async update(id: string, input: Partial<CreateBrandInput>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Brand;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
  },
};
