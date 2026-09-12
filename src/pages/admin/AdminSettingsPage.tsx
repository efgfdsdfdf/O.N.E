import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Store, MapPin, Clock, Globe, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { settingsService } from '@/services/settingsService';
import { Map } from '@/components/shared/Map';
import { DEFAULT_COORDINATES } from '@/lib/constants';
import { geocodeAddress } from '@/utils/location';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: loadedSettings, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => settingsService.getAll() });

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [hours, setHours] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);
  const [mapPreview, setMapPreview] = useState(DEFAULT_COORDINATES);

  useEffect(() => {
    if (loadedSettings) {
      setSettings(loadedSettings);
      setMapPreview({
        lat: parseFloat(loadedSettings.business_coordinates_lat || String(DEFAULT_COORDINATES.lat)),
        lng: parseFloat(loadedSettings.business_coordinates_lng || String(DEFAULT_COORDINATES.lng)),
      });
      try {
        const parsed = JSON.parse(loadedSettings.business_opening_hours || '{}');
        setHours(parsed);
      } catch { setHours({}); }
    }
  }, [loadedSettings]);

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));
  const updateHour = (day: string, value: string) => setHours(prev => ({ ...prev, [day]: value }));
  const updateCoordinate = (key: 'business_coordinates_lat' | 'business_coordinates_lng', value: string) => {
    update(key, value);
    setMapPreview(prev => ({
      ...prev,
      [key === 'business_coordinates_lat' ? 'lat' : 'lng']: Number(value) || prev[key === 'business_coordinates_lat' ? 'lat' : 'lng'],
    }));
  };

  const handleFindLocation = async () => {
    const address = settings.business_address || [settings.business_city, settings.business_state, settings.business_country || 'Nigeria'].filter(Boolean).join(', ');
    if (!address.trim()) {
      toast({ title: 'Enter an address first', variant: 'destructive' });
      return;
    }

    setFindingLocation(true);
    try {
      const result = await geocodeAddress(address);
      if (!result) {
        toast({ title: 'Location not found', description: 'Try a more specific address.', variant: 'destructive' });
        return;
      }

      const lat = result.lat.toFixed(6);
      const lng = result.lng.toFixed(6);
      setSettings(prev => ({
        ...prev,
        business_address: prev.business_address || result.displayName,
        business_coordinates_lat: lat,
        business_coordinates_lng: lng,
      }));
      setMapPreview({ lat: result.lat, lng: result.lng });
      toast({ title: 'Location found', description: 'Map preview updated. Save settings to keep it.' });
    } catch (e: any) {
      toast({ title: 'Could not find location', description: e.message, variant: 'destructive' });
    } finally {
      setFindingLocation(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = { ...settings, business_opening_hours: JSON.stringify(hours) };
      await settingsService.updateMany(toSave);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Settings saved!' });
    } catch (e: any) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className="text-gray-500 text-center py-12">Loading settings...</div>;

  return (
    <div className="min-w-0 max-w-4xl overflow-x-hidden space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-white">Website Settings</h1>
          <p className="text-gray-400">Configure your business info, content, and templates.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <div className="max-w-full overflow-x-auto pb-1">
          <TabsList className="bg-one-charcoal border border-white/10">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>
        </div>

        {/* Business Info */}
        <TabsContent value="business" className="space-y-6">
          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><MapPin className="h-5 w-5 text-one-red" /> Showroom Location</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field label="Address" value={settings.business_address} onChange={v => update('business_address', v)} placeholder="Type the showroom address" />
              </div>
              <div className="sm:pt-8">
                <Button type="button" onClick={handleFindLocation} disabled={findingLocation} className="w-full sm:w-auto gap-2">
                  <Search className="h-4 w-4" />
                  {findingLocation ? 'Finding...' : 'Show on Map'}
                </Button>
              </div>
            </div>
            <div className="h-[320px] max-w-full rounded-xl overflow-hidden border border-white/10">
              <Map
                lat={mapPreview.lat}
                lng={mapPreview.lng}
                title={settings.business_name || 'O.N.E Multi-Concepts'}
                address={settings.business_address}
                showDirections={false}
                className="w-full h-full"
              />
            </div>
            <details className="rounded-lg border border-white/10 bg-one-black/40 p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-300">Advanced coordinates</summary>
              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <Field label="Latitude" value={settings.business_coordinates_lat} onChange={v => updateCoordinate('business_coordinates_lat', v)} placeholder="Auto-filled from address" />
                <Field label="Longitude" value={settings.business_coordinates_lng} onChange={v => updateCoordinate('business_coordinates_lng', v)} placeholder="Auto-filled from address" />
              </div>
            </details>
          </section>

          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Store className="h-5 w-5 text-one-red" /> Business Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Business Name" value={settings.business_name} onChange={v => update('business_name', v)} />
              <Field label="Phone Number" value={settings.business_phone} onChange={v => update('business_phone', v)} placeholder="+234..." />
              <Field label="WhatsApp Number" value={settings.business_whatsapp} onChange={v => update('business_whatsapp', v)} placeholder="+234..." />
              <Field label="Email" value={settings.business_email} onChange={v => update('business_email', v)} />
              <Field label="City" value={settings.business_city} onChange={v => update('business_city', v)} />
              <Field label="State" value={settings.business_state} onChange={v => update('business_state', v)} />
            </div>
          </section>
        </TabsContent>

        {/* Hours */}
        <TabsContent value="hours">
          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Clock className="h-5 w-5 text-one-red" /> Working Hours</h2>
            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="flex min-w-0 flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-gray-300 w-28 capitalize text-sm">{day}</span>
                  <Input
                    value={hours[day] || hours[day.charAt(0).toUpperCase() + day.slice(1)] || ''}
                    onChange={e => updateHour(day, e.target.value)}
                    className="bg-one-black border-white/10 text-white flex-1"
                    placeholder="9:00 AM - 6:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content">
          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Homepage Content</h2>
            <Field label="Hero Title" value={settings.hero_title} onChange={v => update('hero_title', v)} />
            <Field label="Hero Subtitle" value={settings.hero_subtitle} onChange={v => update('hero_subtitle', v)} />
            <div className="space-y-2">
              <Label className="text-gray-300">About Text</Label>
              <Textarea value={settings.about_text || ''} onChange={e => update('about_text', e.target.value)} className="bg-one-black border-white/10 text-white min-h-[150px] resize-none" />
            </div>
            <Field label="Footer Text" value={settings.footer_text} onChange={v => update('footer_text', v)} />
            <Field label="Site URL" value={settings.site_url} onChange={v => update('site_url', v)} />
          </section>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Globe className="h-5 w-5 text-one-red" /> Social Media Links</h2>
            <Field label="Instagram" value={settings.social_instagram} onChange={v => update('social_instagram', v)} placeholder="https://instagram.com/..." />
            <Field label="Facebook" value={settings.social_facebook} onChange={v => update('social_facebook', v)} placeholder="https://facebook.com/..." />
            <Field label="TikTok" value={settings.social_tiktok} onChange={v => update('social_tiktok', v)} placeholder="https://tiktok.com/@..." />
            <Field label="Twitter / X" value={settings.social_twitter} onChange={v => update('social_twitter', v)} placeholder="https://x.com/..." />
          </section>
        </TabsContent>

        {/* WhatsApp Templates */}
        <TabsContent value="whatsapp">
          <section className="min-w-0 bg-one-charcoal border border-white/10 rounded-xl p-4 sm:p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-500" /> WhatsApp Message Templates</h2>
              <p className="text-sm text-gray-500 mt-1">Available placeholders: <code className="text-one-red">{'{title}'}</code>, <code className="text-one-red">{'{price}'}</code>, <code className="text-one-red">{'{url}'}</code></p>
            </div>
            {[
              { key: 'whatsapp_template_vehicle', label: 'Vehicle Template' },
              { key: 'whatsapp_template_accessory', label: 'Accessory Template' },
              { key: 'whatsapp_template_spare_part', label: 'Spare Part Template' },
              { key: 'whatsapp_template_tyre', label: 'Tyre Template' },
              { key: 'whatsapp_template_motorcycle', label: 'Motorcycle Template' },
              { key: 'whatsapp_template_default', label: 'Default Template' },
            ].map(t => (
              <div key={t.key} className="space-y-2">
                <Label className="text-gray-300">{t.label}</Label>
                <Textarea
                  value={settings[t.key] || ''}
                  onChange={e => update(t.key, e.target.value)}
                  className="bg-one-black border-white/10 text-white resize-none"
                  rows={3}
                />
              </div>
            ))}
          </section>
        </TabsContent>
      </Tabs>

      {/* Bottom Save */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}

// Reusable field component
function Field({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-gray-300">{label}</Label>
      <Input value={value || ''} onChange={e => onChange(e.target.value)} className="bg-one-black border-white/10 text-white" placeholder={placeholder} />
    </div>
  );
}
