import { supabase } from '@/lib/supabase';
import type { Enquiry, CreateEnquiryInput, EnquiryStatus } from '@/types';

export const enquiryService = {
  async getAll(status?: EnquiryStatus): Promise<Enquiry[]> {
    let query = supabase
      .from('enquiries')
      .select('*, listing:listings(id, title, slug, listing_type, price)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Enquiry[];
  },

  async create(input: CreateEnquiryInput): Promise<Enquiry> {
    const { data, error } = await supabase
      .from('enquiries')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as Enquiry;
  },

  async updateStatus(id: string, status: EnquiryStatus): Promise<void> {
    const { error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    if (error) throw error;
  },

  async getNewCount(): Promise<number> {
    const { count, error } = await supabase
      .from('enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new');

    if (error) return 0;
    return count || 0;
  },
};
