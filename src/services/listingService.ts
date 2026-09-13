import { supabase } from '@/lib/supabase';
import type { Listing, CreateListingInput, UpdateListingInput, ListingFilters, PaginatedResult, ListingImage } from '@/types';
import { ITEMS_PER_PAGE } from '@/lib/constants';

export const listingService = {
  async getListings(filters: ListingFilters = {}): Promise<PaginatedResult<Listing>> {
    const {
      search,
      listing_type,
      category_id,
      brand_id,
      min_price,
      max_price,
      condition,
      location,
      status = 'published',
      featured,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = ITEMS_PER_PAGE,
    } = filters;

    let query = supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (listing_type) query = query.eq('listing_type', listing_type);
    if (category_id) query = query.eq('category_id', category_id);
    if (brand_id) query = query.eq('brand_id', brand_id);
    if (condition) query = query.eq('condition', condition);
    if (location) query = query.eq('location', location);
    if (featured !== undefined) query = query.eq('featured', featured);
    if (min_price !== undefined) query = query.gte('price', min_price);
    if (max_price !== undefined) query = query.lte('price', max_price);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending });

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: (data || []) as Listing[],
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };
  },

  async getAdminListings(filters: ListingFilters = {}): Promise<PaginatedResult<Listing>> {
    const {
      search,
      listing_type,
      status,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      per_page = ITEMS_PER_PAGE,
    } = filters;

    let query = supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (listing_type) query = query.eq('listing_type', listing_type);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: (data || []) as Listing[],
      count: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };
  },

  async getListingBySlug(slug: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Listing;
  },

  async getListingById(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Listing;
  },

  async getFeaturedListings(limit = 8): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .eq('status', 'published')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Listing[];
  },

  async getRecentListings(limit = 6): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as Listing[];
  },

  async createListing(input: CreateListingInput): Promise<Listing> {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('listings')
      .insert({ ...input, created_by: user?.id })
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async updateListing(id: string, input: Partial<CreateListingInput>): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update(input)
      .eq('id', id)
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw error;
  },

  async duplicateListing(id: string): Promise<Listing> {
    const original = await this.getListingById(id);
    if (!original) throw new Error('Listing not found');

    const { data: { user } } = await supabase.auth.getUser();
    const input: CreateListingInput = {
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      listing_type: original.listing_type,
      category_id: original.category_id || undefined,
      brand_id: original.brand_id || undefined,
      price: original.price || undefined,
      previous_price: original.previous_price || undefined,
      condition: original.condition || undefined,
      location: original.location || undefined,
      status: 'draft',
      featured: false,
      negotiable: original.negotiable,
      contact_enabled: original.contact_enabled,
      specifications: original.specifications as Record<string, unknown>,
      features: original.features,
    };

    const { data, error } = await supabase
      .from('listings')
      .insert({ ...input, created_by: user?.id })
      .select('*, category:categories(*), brand:brands(*), images:listing_images(*)')
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async toggleFeatured(id: string, featured: boolean): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ featured })
      .eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_views', { listing_id: id });
    if (error) {
      console.warn('Failed to increment views via RPC', error);
    }
  },

  async getStats(): Promise<{
    total: number;
    available: number;
    sold: number;
    drafts: number;
    featured: number;
    total_views: number;
  }> {
    const [total, available, sold, drafts, featured, viewRows] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('listings').select('views_count').in('status', ['published', 'sold']),
    ]);

    if (viewRows.error) throw viewRows.error;

    return {
      total: total.count || 0,
      available: available.count || 0,
      sold: sold.count || 0,
      drafts: drafts.count || 0,
      featured: featured.count || 0,
      total_views: (viewRows.data || []).reduce((sum, row) => sum + (row.views_count || 0), 0),
    };
  },

  // Image operations
  async uploadImage(listingId: string, file: File): Promise<ListingImage> {
    const ext = file.name.split('.').pop();
    const fileName = `${listingId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(fileName);

    // Check if this is the first image (make it cover)
    const { count } = await supabase
      .from('listing_images')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listingId);

    const { data, error } = await supabase
      .from('listing_images')
      .insert({
        listing_id: listingId,
        storage_path: fileName,
        media_type: mediaType,
        alt_text: file.name,
        sort_order: (count || 0),
        is_cover: (count || 0) === 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ListingImage;
  },

  async deleteImage(imageId: string, storagePath: string): Promise<void> {
    await supabase.storage.from('listings').remove([storagePath]);
    const { error } = await supabase.from('listing_images').delete().eq('id', imageId);
    if (error) throw error;
  },

  async setCoverImage(imageId: string, listingId: string): Promise<void> {
    // Unset all covers for this listing
    await supabase
      .from('listing_images')
      .update({ is_cover: false })
      .eq('listing_id', listingId);

    // Set new cover
    const { error } = await supabase
      .from('listing_images')
      .update({ is_cover: true })
      .eq('id', imageId);
    if (error) throw error;
  },

  async reorderImages(images: { id: string; sort_order: number }[]): Promise<void> {
    for (const img of images) {
      await supabase
        .from('listing_images')
        .update({ sort_order: img.sort_order })
        .eq('id', img.id);
    }
  },

  getImageUrl(storagePath: string): string {
    const { data } = supabase.storage.from('listings').getPublicUrl(storagePath);
    return data.publicUrl;
  },
};
