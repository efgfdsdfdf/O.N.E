import { useState } from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/useSettings';
import { analyticsService } from '@/services/analyticsService';
import { generateWhatsAppMessage, buildWhatsAppUrl, generateSoldMessage, generateOutOfStockMessage } from '@/utils/whatsapp';
import { formatNaira } from '@/utils/currency';
import type { Listing } from '@/types';

interface WhatsAppButtonProps {
  listing: Listing;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl';
  fullWidth?: boolean;
  variant?: 'default' | 'sold' | 'out_of_stock';
}

export function WhatsAppButton({ listing, className, size = 'default', fullWidth = false, variant = 'default' }: WhatsAppButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: settings } = useSettings();
  const whatsappNumber = settings?.business_whatsapp || '';

  // Get the template based on listing type
  const templateKey = `whatsapp_template_${listing.listing_type}`;
  const template = settings?.[templateKey] || settings?.whatsapp_template_default || '';

  const getDefaultMessage = () => {
    if (variant === 'sold') return generateSoldMessage(listing);
    if (variant === 'out_of_stock') return generateOutOfStockMessage(listing);
    return generateWhatsAppMessage(listing, template || undefined);
  };

  const [message, setMessage] = useState(getDefaultMessage);

  const handleOpenDialog = () => {
    setMessage(getDefaultMessage());
    setDialogOpen(true);
  };

  const handleSend = () => {
    if (!whatsappNumber) return;
    analyticsService.trackEvent('whatsapp_click', listing.id);
    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, '_blank');
    setDialogOpen(false);
  };

  const buttonLabel = variant === 'sold'
    ? 'Ask About Similar'
    : variant === 'out_of_stock'
    ? 'Ask About Availability'
    : 'Enquire on WhatsApp';

  return (
    <>
      <Button
        variant="whatsapp"
        size={size}
        className={`gap-2 ${fullWidth ? 'w-full' : ''} ${className || ''}`}
        onClick={handleOpenDialog}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-center leading-tight">{buttonLabel}</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-one-charcoal border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Contact Seller</DialogTitle>
            <DialogDescription className="text-gray-400">
              You're asking about:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Info */}
            <div className="bg-one-black rounded-lg p-3 space-y-1">
              <p className="font-semibold text-white">{listing.title}</p>
              {listing.price && (
                <p className="text-one-red font-bold">{formatNaira(listing.price)}</p>
              )}
            </div>

            {/* Editable Message */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Message:</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="bg-one-black border-white/10 text-white resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="whatsapp"
                className="flex-1 gap-2"
                onClick={handleSend}
                disabled={!whatsappNumber}
              >
                <ExternalLink className="h-4 w-4" />
                Continue to WhatsApp
              </Button>
            </div>

            {!whatsappNumber && (
              <p className="text-xs text-yellow-400">
                WhatsApp number not configured. Please contact the seller directly.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
