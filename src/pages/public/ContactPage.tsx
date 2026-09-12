import { useState } from 'react';
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { enquiryService } from '@/services/enquiryService';

export default function ContactPage() {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enquiryService.create(formData);
      toast({
        title: 'Message sent!',
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark bg-one-black min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Let's Talk</h1>
          <p className="text-gray-400 text-lg">
            Have a question about a vehicle, part or accessory? Send us a message or chat with us directly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Methods */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Get in Touch</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {settings?.business_whatsapp && (
                <a
                  href={`https://wa.me/${settings.business_whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-one-charcoal border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors group"
                >
                  <MessageCircle className="h-8 w-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
                  <p className="text-gray-400 text-sm">Chat with us instantly</p>
                </a>
              )}
              
              {settings?.business_phone && (
                <a
                  href={`tel:${settings.business_phone}`}
                  className="bg-one-charcoal border border-white/10 p-6 rounded-xl hover:border-one-red/50 transition-colors group"
                >
                  <Phone className="h-8 w-8 text-one-red mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">Call Us</h3>
                  <p className="text-gray-400 text-sm">{settings.business_phone}</p>
                </a>
              )}

              {settings?.business_email && (
                <a
                  href={`mailto:${settings.business_email}`}
                  className="bg-one-charcoal border border-white/10 p-6 rounded-xl hover:border-one-red/50 transition-colors group"
                >
                  <Mail className="h-8 w-8 text-one-red mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-1">Email</h3>
                  <p className="text-gray-400 text-sm truncate">{settings.business_email}</p>
                </a>
              )}

              {settings?.business_address && (
                <div className="bg-one-charcoal border border-white/10 p-6 rounded-xl">
                  <MapPin className="h-8 w-8 text-one-red mb-4" />
                  <h3 className="text-white font-semibold mb-1">Location</h3>
                  <p className="text-gray-400 text-sm">{settings.business_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-one-charcoal border border-white/10 p-6 lg:p-8 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Your Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-one-black border-white/10 text-white"
                  placeholder="Your full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-one-black border-white/10 text-white"
                    placeholder="080..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-one-black border-white/10 text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-one-black border-white/10 text-white resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
