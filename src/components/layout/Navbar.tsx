import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/accessories', label: 'Accessories' },
  { href: '/spare-parts', label: 'Spare Parts' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useSettings();
  const whatsapp = settings?.business_whatsapp || '';
  const phone = settings?.business_phone || '';

  return (
    <header className="sticky top-0 z-50 w-full bg-one-black/95 backdrop-blur supports-[backdrop-filter]:bg-one-black/80 border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Logo size="md" variant="light" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                location.pathname === link.href
                  ? 'text-white bg-white/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors">
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">{phone}</span>
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="whatsapp" size="sm" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Chat with Us
              </Button>
            </a>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-2">
          <Link to="/search">
            <Button variant="ghost" size="icon" className="text-gray-300">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-one-black border-t border-white/10 animate-fade-in">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  location.pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/tyres-rims"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
            >
              Tyres & Rims
            </Link>
            <Link
              to="/motorcycles"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
            >
              Motorcycles
            </Link>
            <Link
              to="/showroom"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md"
            >
              Showroom
            </Link>
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="whatsapp" className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Seller
                  </Button>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="block">
                  <Button variant="outline" className="w-full gap-2 text-white border-white/20">
                    <Phone className="h-4 w-4" />
                    Call Seller
                  </Button>
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
