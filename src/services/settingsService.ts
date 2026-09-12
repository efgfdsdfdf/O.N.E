import { supabase } from '@/lib/supabase';
import type { WebsiteSettings } from '@/types';

export const settingsService = {
  async getAll(): Promise<WebsiteSettings> {
    const { data, error } = await supabase
      .from('website_settings')
      .select('key, value');

    if (error) throw error;

    const settings: WebsiteSettings = {};
    for (const row of data || []) {
      settings[row.key] = row.value || '';
    }
    return settings;
  },

  async get(key: string): Promise<string> {
    const { data, error } = await supabase
      .from('website_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) return '';
    return data?.value || '';
  },

  async update(key: string, value: string): Promise<void> {
    const { error } = await supabase
      .from('website_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
  },

  async updateMany(settings: Record<string, string>): Promise<void> {
    const entries = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
    }));

    for (const entry of entries) {
      await this.update(entry.key, entry.value);
    }
  },
};
