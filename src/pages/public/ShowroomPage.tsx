import { MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import { Map } from '@/components/shared/Map';
import { useSettings } from '@/hooks/useSettings';
import { DEFAULT_COORDINATES } from '@/lib/constants';
import { buildPhoneUrl } from '@/utils/whatsapp';

export default function ShowroomPage() {
  const { data: settings, isLoading } = useSettings();

  const lat = parseFloat(settings?.business_coordinates_lat || String(DEFAULT_COORDINATES.lat));
  const lng = parseFloat(settings?.business_coordinates_lng || String(DEFAULT_COORDINATES.lng));

  const phone = settings?.business_phone || '';
  const whatsapp = settings?.business_whatsapp || '';
  const address = settings?.business_address || 'Lagos, Nigeria';

  let openingHours = {};
  try {
    openingHours = JSON.parse(settings?.business_opening_hours || '{}');
  } catch (e) {
    console.error('Failed to parse opening hours', e);
  }

  if (isLoading) return <div className="min-h-screen bg-one-black"></div>;

  return (
    <div className="dark bg-one-black min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <div className="relative h-[250px] lg:h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-one-charcoal/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80)' }}
        />
        <div className="relative z-20 text-center space-y-2 px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">Visit Our Showroom</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Come see our wide range of vehicles, accessories and spare parts in person. We're located at a convenient spot.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-full px-4 py-12 overflow-x-hidden">
        <div className="grid min-w-0 gap-8 lg:grid-cols-3">
          {/* Info Card */}
          <div className="min-w-0 space-y-6 lg:col-span-1">
            <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-one-charcoal p-6 shadow-xl lg:p-8 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
                <ul className="space-y-4">
                  {address && (
                    <li className="flex min-w-0 items-start gap-4 text-gray-300">
                      <MapPin className="h-5 w-5 text-one-red mt-0.5 shrink-0" />
                      <span className="min-w-0 break-words">{address}</span>
                    </li>
                  )}
                  {phone && (
                    <li className="flex min-w-0 items-center gap-4 text-gray-300">
                      <Phone className="h-5 w-5 text-one-red shrink-0" />
                      <a href={buildPhoneUrl(phone)} className="min-w-0 break-words transition-colors hover:text-white">
                        {phone}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li className="flex min-w-0 items-center gap-4 text-gray-300">
                      <MessageCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 break-words transition-colors hover:text-white"
                      >
                        {whatsapp}
                      </a>
                    </li>
                  )}
                  {settings?.business_email && (
                    <li className="flex min-w-0 items-center gap-4 text-gray-300">
                      <Mail className="h-5 w-5 text-one-red shrink-0" />
                      <a href={`mailto:${settings.business_email}`} className="min-w-0 break-all transition-colors hover:text-white">
                        {settings.business_email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-6">Working Hours</h2>
                <ul className="space-y-3">
                  {Object.entries(openingHours).map(([day, hours]) => (
                    <li key={day} className="flex min-w-0 items-center justify-between gap-3 text-sm">
                      <span className="shrink-0 text-gray-400 capitalize">{day}</span>
                      <span className={`${hours === 'Closed' ? 'text-one-red font-medium' : 'text-white'} min-w-0 text-right break-words`}>
                        {String(hours)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-[500px] min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 shadow-xl lg:col-span-2 lg:h-auto">
            <Map
              lat={lat}
              lng={lng}
              title={settings?.business_name || 'O.N.E Multi-Concepts'}
              address={address}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
