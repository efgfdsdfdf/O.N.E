import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function Logo({ className, size = 'md', variant = 'light' }: LogoProps) {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-one-black';
  const accentColor = 'text-one-red';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo Mark */}
      <div className={cn('relative flex items-center justify-center', sizes[size])}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(sizes[size], 'w-auto')}
        >
          {/* Shield shape */}
          <path
            d="M24 2L6 10V22C6 34.36 13.68 45.64 24 48C34.32 45.64 42 34.36 42 22V10L24 2Z"
            fill="#D6A84F"
          />
          {/* Inner shield */}
          <path
            d="M24 5L9 12V22C9 32.82 15.84 42.76 24 45C32.16 42.76 39 32.82 39 22V12L24 5Z"
            fill="#0A0A0A"
          />
          {/* O.N.E text */}
          <text
            x="24"
            y="22"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="900"
            fontSize="11"
            letterSpacing="0.5"
          >
            O.N.E
          </text>
          {/* Underline accent */}
          <rect x="12" y="26" width="24" height="2" rx="1" fill="#D6A84F" />
          {/* Multi-Concepts small text */}
          <text
            x="24"
            y="34"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
            fontWeight="500"
            fontSize="5"
            letterSpacing="0.3"
          >
            MULTI-CONCEPTS
          </text>
        </svg>
      </div>
      {/* Text Logo */}
      {size !== 'sm' && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-black text-lg tracking-wider', textColor)}>
            O.N.<span className={accentColor}>E</span>
          </span>
          <span className={cn('text-[10px] font-medium tracking-[0.2em] uppercase', textColor, 'opacity-70')}>
            Multi-Concepts
          </span>
        </div>
      )}
    </div>
  );
}
