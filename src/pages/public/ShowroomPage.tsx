import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="dark bg-one-black min-h-screen">
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

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-one-charcoal border border-white/10 rounded-xl p-6 lg:p-8 space-y-8 shadow-xl">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
                <ul className="space-y-4">
                  {address && (
                    <li className="flex items-start gap-4 text-gray-300">
                      <MapPin className="h-5 w-5 text-one-red mt-0.5 shrink-0" />
                      <span>{address}</span>
                    </li>
                  )}
                  {phone && (
                    <li className="flex items-center gap-4 text-gray-300">
                      <Phone className="h-5 w-5 text-one-red shrink-0" />
                      <a href={buildPhoneUrl(phone)} className="hover:text-white transition-colors">
                        {phone}
                      </a>
                    </li>
                  )}
                  {whatsapp && (
                    <li className="flex items-center gap-4 text-gray-300">
                      <MessageCircle className="h-5 w-5 text-green-500 shrink-0" />
                      <a
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        {whatsapp}
                      </a>
                    </li>
                  )}
                  {settings?.business_email && (
                    <li className="flex items-center gap-4 text-gray-300">
                      <Mail className="h-5 w-5 text-one-red shrink-0" />
                      <a href={`mailto:${settings.business_email}`} className="hover:text-white transition-colors">
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
                    <li key={day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{day}</span>
                      <span className={hours === 'Closed' ? 'text-one-red font-medium' : 'text-white'}>
                        {String(hours)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 h-[500px] lg:h-auto rounded-xl overflow-hidden border border-white/10 shadow-xl">
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
