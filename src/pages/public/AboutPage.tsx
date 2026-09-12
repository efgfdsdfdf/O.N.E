import { useSettings } from '@/hooks/useSettings';
import { Logo } from '@/components/shared/Logo';

export default function AboutPage() {
  const { data: settings } = useSettings();

  return (
    <div className="dark bg-one-black min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-24 max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-8">
          <Logo size="lg" variant="light" className="mb-4" />
          
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            More Than Just a Dealership.
          </h1>
          
          <div className="w-24 h-1 bg-one-red rounded-full" />
          
          <div className="bg-one-charcoal/50 border border-white/10 p-8 md:p-12 rounded-2xl w-full">
            <div className="prose prose-invert prose-lg mx-auto whitespace-pre-wrap text-gray-300 leading-relaxed">
              {settings?.about_text || (
                'O.N.E Multi-Concepts is an automotive business focused on helping customers find quality vehicles, parts, accessories and other automotive products.\n\nWe believe in honest deals, quality products, and making the car buying experience simple and personal.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
