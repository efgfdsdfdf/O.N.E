import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { useSettings } from '@/hooks/useSettings';

export function Footer() {
  const { data: settings } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-one-black border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-sm text-gray-400 leading-relaxed">
              More Than Just a Dealership. Quality vehicles, genuine parts, accessories and more — all in one place.
            </p>
            <div className="flex items-center gap-3">
              {settings?.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/vehicles', label: 'Vehicles' },
                { href: '/accessories', label: 'Accessories' },
                { href: '/spare-parts', label: 'Spare Parts' },
                { href: '/tyres-rims', label: 'Tyres & Rims' },
                { href: '/motorcycles', label: 'Motorcycles' },
                { href: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/showroom" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Visit Showroom
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Search Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {settings?.business_phone && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Phone className="h-4 w-4 text-one-red shrink-0" />
                  <a href={`tel:${settings.business_phone}`} className="hover:text-white transition-colors">
                    {settings.business_phone}
                  </a>
                </li>
              )}
              {settings?.business_whatsapp && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                  <a
                    href={`https://wa.me/${settings.business_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {settings?.business_email && (
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="h-4 w-4 text-one-red shrink-0" />
                  <a href={`mailto:${settings.business_email}`} className="hover:text-white transition-colors">
                    {settings.business_email}
                  </a>
                </li>
              )}
              {settings?.business_address && (
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 text-one-red shrink-0 mt-0.5" />
                  <span>{settings.business_address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {year} O.N.E Multi-Concepts. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            More Than Just a Dealership.
          </p>
        </div>

        {/* Developer Credit */}
        <div className="border-t border-white/5 mt-6 pt-6 flex flex-col sm:flex-row justify-center items-center gap-2 text-center">
          <p className="text-[11px] text-gray-600">
            Designed & Developed by{' '}
            <a
              href="https://dave-s-portfolio-ten.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-one-red hover:text-one-red-light font-medium transition-colors"
            >
              Ezeilo David Chisom
            </a>
          </p>
          <span className="hidden sm:inline text-gray-700">•</span>
          <a
            href="https://wa.me/2349040303390?text=Hi%20David%2C%20I%20saw%20your%20work%20on%20O.N.E%20Multi-Concepts%20and%20I%27d%20like%20to%20discuss%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-600 hover:text-green-400 transition-colors flex items-center gap-1"
          >
            <MessageCircle className="h-3 w-3" /> Hire Me
          </a>
        </div>
      </div>
    </footer>
  );
}
