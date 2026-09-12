import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Upload, Star, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { listingService } from '@/services/listingService';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';
import {
  LISTING_TYPES, LISTING_CONDITIONS, NIGERIAN_LOCATIONS,
  VEHICLE_TRANSMISSIONS, VEHICLE_FUEL_TYPES, VEHICLE_BODY_TYPES,
  VEHICLE_DRIVE_TYPES, TYRE_SEASONS, VEHICLE_FEATURES,
} from '@/lib/constants';
import type { CreateListingInput, ListingType, ListingImage } from '@/types';

export default function AdminListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.getAll() });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [showSeo, setShowSeo] = useState(false);
  const [form, setForm] = useState<CreateListingInput & { seo_title?: string; seo_description?: string }>({
    title: '',
    description: '',
    listing_type: 'vehicle',
    category_id: '',
    brand_id: '',
    price: undefined,
    previous_price: undefined,
    condition: undefined,
    location: '',
    status: 'draft',
    featured: false,
    negotiable: false,
    contact_enabled: true,
    specifications: {},
    features: [],
    seo_title: '',
    seo_description: '',
  });

  // Load existing listing for edit mode
  useEffect(() => {
    if (isEdit && id) {
      listingService.getListingById(id).then((listing) => {
        if (!listing) { navigate('/admin/listings'); return; }
        setForm({
          title: listing.title,
          description: listing.description || '',
          listing_type: listing.listing_type,
          category_id: listing.category_id || '',
          brand_id: listing.brand_id || '',
          price: listing.price || undefined,
          previous_price: listing.previous_price || undefined,
          condition: listing.condition || undefined,
          location: listing.location || '',
          status: listing.status,
          featured: listing.featured,
          negotiable: listing.negotiable,
          contact_enabled: listing.contact_enabled,
          specifications: listing.specifications as Record<string, unknown> || {},
          features: listing.features || [],
          seo_title: listing.seo_title || '',
          seo_description: listing.seo_description || '',
        });
        setImages(listing.images || []);
      });
    }
  }, [id, isEdit, navigate]);

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const updateSpec = (key: string, value: any) => setForm(prev => ({
    ...prev, specifications: { ...(prev.specifications as any), [key]: value }
  }));

  const handleSave = async (status?: string) => {
    if (!form.title.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      // Clean up empty strings for UUID fields
      const payload: any = { ...form, status: status || form.status };
      if (payload.category_id === '') payload.category_id = undefined;
      if (payload.brand_id === '') payload.brand_id = undefined;

      if (isEdit && id) {
        await listingService.updateListing(id, payload);
        toast({ title: 'Listing updated!' });
      } else {
        const created = await listingService.createListing(payload);
        toast({ title: 'Listing created!' });
        navigate(`/admin/listings/${created.id}/edit`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    } catch (e: any) {
      toast({ title: 'Error saving listing', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id) {
      toast({ title: 'Save the listing first before uploading images', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const img = await listingService.uploadImage(id, file);
        setImages(prev => [...prev, img]);
      }
      toast({ title: 'Media uploaded!' });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const handleDeleteImage = async (img: ListingImage) => {
    try {
      await listingService.deleteImage(img.id, img.storage_path);
      setImages(prev => prev.filter(i => i.id !== img.id));
      toast({ title: 'Media deleted' });
    } catch (e: any) { toast({ title: 'Failed to delete image', variant: 'destructive' }); }
  };

  const handleSetCover = async (img: ListingImage) => {
    if (!id) return;
    try {
      await listingService.setCoverImage(img.id, id);
      setImages(prev => prev.map(i => ({ ...i, is_cover: i.id === img.id })));
      toast({ title: 'Cover image set' });
    } catch (e: any) { toast({ title: 'Failed to set cover', variant: 'destructive' }); }
  };

  const toggleFeature = (feature: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const specs = form.specifications as Record<string, any>;

  return (
    <div className="min-w-0 max-w-5xl overflow-x-hidden space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/listings')} className="text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Listing' : 'New Listing'}</h1>
            <p className="text-gray-400 text-sm">{isEdit ? 'Update listing details' : 'Add a new product to your inventory'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/20 text-white" onClick={() => handleSave('draft')} disabled={saving}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label className="text-gray-300">Title *</Label>
            <Input value={form.title} onChange={e => updateField('title', e.target.value)}
              className="bg-one-black border-white/10 text-white" placeholder="e.g. Toyota Camry 2019 XLE" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Listing Type *</Label>
            <Select value={form.listing_type} onValueChange={v => updateField('listing_type', v)}>
              <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                {LISTING_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Condition</Label>
            <Select value={form.condition || ''} onValueChange={v => updateField('condition', v || undefined)}>
              <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select condition" /></SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                {LISTING_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Price (₦)</Label>
            <Input type="number" value={form.price || ''} onChange={e => updateField('price', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-one-black border-white/10 text-white" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Previous Price (₦)</Label>
            <Input type="number" value={form.previous_price || ''} onChange={e => updateField('previous_price', e.target.value ? Number(e.target.value) : undefined)}
              className="bg-one-black border-white/10 text-white" placeholder="Show as strikethrough" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Category</Label>
            <Select value={form.category_id || ''} onValueChange={v => updateField('category_id', v || undefined)}>
              <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Brand</Label>
            <Select value={form.brand_id || ''} onValueChange={v => updateField('brand_id', v || undefined)}>
              <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                {brands?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Location</Label>
            <Select value={form.location || ''} onValueChange={v => updateField('location', v)}>
              <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent className="bg-one-charcoal border-white/10 text-white">
                {NIGERIAN_LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.negotiable} onChange={e => updateField('negotiable', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-300">Negotiable</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => updateField('featured', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.contact_enabled} onChange={e => updateField('contact_enabled', e.target.checked)} className="rounded" />
              <span className="text-sm text-gray-300">Contact Enabled</span>
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Description</Label>
          <Textarea value={form.description || ''} onChange={e => updateField('description', e.target.value)}
            className="bg-one-black border-white/10 text-white min-h-[120px] resize-none" placeholder="Describe your listing..." />
        </div>
      </section>

      {/* Specifications */}
      <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Specifications</h2>
        {(form.listing_type === 'vehicle' || form.listing_type === 'motorcycle') && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label className="text-gray-300">Make</Label><Input value={specs.make || ''} onChange={e => updateSpec('make', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="e.g. Toyota" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Model</Label><Input value={specs.model || ''} onChange={e => updateSpec('model', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="e.g. Camry" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Year</Label><Input type="number" value={specs.year || ''} onChange={e => updateSpec('year', Number(e.target.value))} className="bg-one-black border-white/10 text-white" placeholder="e.g. 2019" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Mileage (km)</Label><Input type="number" value={specs.mileage || ''} onChange={e => updateSpec('mileage', Number(e.target.value))} className="bg-one-black border-white/10 text-white" /></div>
            {form.listing_type === 'vehicle' && (<>
              <div className="space-y-2"><Label className="text-gray-300">Transmission</Label>
                <Select value={specs.transmission || ''} onValueChange={v => updateSpec('transmission', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">{VEHICLE_TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-gray-300">Fuel Type</Label>
                <Select value={specs.fuel_type || ''} onValueChange={v => updateSpec('fuel_type', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">{VEHICLE_FUEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-gray-300">Engine</Label><Input value={specs.engine || ''} onChange={e => updateSpec('engine', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="e.g. 2.5L 4-cyl" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Body Type</Label>
                <Select value={specs.body_type || ''} onValueChange={v => updateSpec('body_type', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">{VEHICLE_BODY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-gray-300">Drive Type</Label>
                <Select value={specs.drive_type || ''} onValueChange={v => updateSpec('drive_type', v)}>
                  <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-one-charcoal border-white/10 text-white">{VEHICLE_DRIVE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-gray-300">Exterior Color</Label><Input value={specs.exterior_color || ''} onChange={e => updateSpec('exterior_color', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-300">Interior Color</Label><Input value={specs.interior_color || ''} onChange={e => updateSpec('interior_color', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
            </>)}
            {form.listing_type === 'motorcycle' && (
              <div className="space-y-2"><Label className="text-gray-300">Engine Size</Label><Input value={specs.engine_size || ''} onChange={e => updateSpec('engine_size', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="e.g. 150cc" /></div>
            )}
          </div>
        )}
        {form.listing_type === 'tyre' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label className="text-gray-300">Width</Label><Input type="number" value={specs.width || ''} onChange={e => updateSpec('width', Number(e.target.value))} className="bg-one-black border-white/10 text-white" placeholder="e.g. 225" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Aspect Ratio</Label><Input type="number" value={specs.aspect_ratio || ''} onChange={e => updateSpec('aspect_ratio', Number(e.target.value))} className="bg-one-black border-white/10 text-white" placeholder="e.g. 45" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Rim Size</Label><Input type="number" value={specs.rim_size || ''} onChange={e => updateSpec('rim_size', Number(e.target.value))} className="bg-one-black border-white/10 text-white" placeholder="e.g. 18" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Season</Label>
              <Select value={specs.season || ''} onValueChange={v => updateSpec('season', v)}>
                <SelectTrigger className="bg-one-black border-white/10 text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-one-charcoal border-white/10 text-white">{TYRE_SEASONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label className="text-gray-300">Load Index</Label><Input value={specs.load_index || ''} onChange={e => updateSpec('load_index', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Speed Rating</Label><Input value={specs.speed_rating || ''} onChange={e => updateSpec('speed_rating', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
          </div>
        )}
        {!['vehicle', 'motorcycle', 'tyre'].includes(form.listing_type) && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-gray-300">Compatibility</Label><Input value={specs.compatibility || ''} onChange={e => updateSpec('compatibility', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="e.g. Toyota Camry 2015-2020" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Material</Label><Input value={specs.material || ''} onChange={e => updateSpec('material', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Part Number</Label><Input value={specs.part_number || ''} onChange={e => updateSpec('part_number', e.target.value)} className="bg-one-black border-white/10 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-300">Quantity Available</Label><Input type="number" value={specs.quantity || ''} onChange={e => updateSpec('quantity', Number(e.target.value))} className="bg-one-black border-white/10 text-white" /></div>
          </div>
        )}
      </section>

      {/* Features */}
      {(form.listing_type === 'vehicle' || form.listing_type === 'motorcycle') && (
        <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {VEHICLE_FEATURES.map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-one-black/50 transition-colors">
                <input type="checkbox" checked={form.features?.includes(f) || false} onChange={() => toggleFeature(f)} className="rounded" />
                <span className="text-sm text-gray-300">{f}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Images */}
      <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Photos & Videos</h2>
        {!isEdit && <p className="text-sm text-gray-500">Save the listing first, then you can upload photos and videos.</p>}
        {isEdit && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square bg-one-black">
                  {img.media_type === 'video' ? (
                    <video src={listingService.getImageUrl(img.storage_path)} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                  ) : (
                    <img src={listingService.getImageUrl(img.storage_path)} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                  )}
                  {img.is_cover && <span className="absolute top-2 left-2 bg-one-red text-one-black text-[10px] px-2 py-0.5 rounded-full font-medium">Cover</span>}
                  {img.media_type === 'video' && <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Video</span>}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2 p-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs border-white/40 text-white" onClick={() => handleSetCover(img)}>
                      <Star className="h-3 w-3 mr-1" /> Cover
                    </Button>
                    <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDeleteImage(img)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {/* Upload button */}
              <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-one-red/50 transition-colors bg-one-black/50">
                <Upload className="h-8 w-8 text-gray-500 mb-2" />
                <span className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Add Media'}</span>
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </>
        )}
      </section>

      {/* SEO */}
      <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl overflow-hidden">
        <button onClick={() => setShowSeo(!showSeo)} className="w-full p-6 flex items-center justify-between text-left">
          <h2 className="text-lg font-semibold text-white">SEO Settings</h2>
          {showSeo ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>
        {showSeo && (
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">SEO Title</Label>
              <Input value={form.seo_title || ''} onChange={e => updateField('seo_title', e.target.value)} className="bg-one-black border-white/10 text-white" placeholder="Custom page title for search engines" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">SEO Description</Label>
              <Textarea value={form.seo_description || ''} onChange={e => updateField('seo_description', e.target.value)} className="bg-one-black border-white/10 text-white resize-none" placeholder="Custom meta description" rows={3} />
            </div>
          </div>
        )}
      </section>

      {/* Bottom Actions */}
      <div className="flex flex-wrap justify-end gap-3 pb-8">
        <Button variant="outline" className="border-white/20 text-white" onClick={() => navigate('/admin/listings')}>Cancel</Button>
        <Button variant="outline" className="border-white/20 text-white" onClick={() => handleSave('draft')} disabled={saving}>Save as Draft</Button>
        <Button onClick={() => handleSave('published')} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Publish'}</Button>
      </div>
    </div>
  );
}
