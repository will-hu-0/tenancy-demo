import React from 'react';

export const BRAND = {
  product: 'Hartamas Tenancy',
  agency: 'Hartamas Real Estate (Malaysia) Sdn Bhd',
  agencyShort: 'Hartamas Real Estate',
  companyNo: '568877-M',
  platform: 'Zurely',
} as const;

/** Official logo files served from public/brand. */
export const BRAND_ASSETS = {
  hartamasLogo: '/brand/hartamas-logo.webp',
  zurelyIcon: '/brand/zurely-icon.png',
  zurelyWordmark: '/brand/zurely-wordmark.png',
} as const;

interface HartamasLogoProps {
  /** Light text for use on dark backgrounds. */
  inverted?: boolean;
  /** Hide the "Real Estate" descriptor (tight spaces). */
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_STYLES = {
  sm: { mark: 'h-[22px]', desc: 'text-[8px]' },
  md: { mark: 'h-[28px]', desc: 'text-[9px]' },
  lg: { mark: 'h-9', desc: 'text-[11px]' },
};

export const HartamasLogo: React.FC<HartamasLogoProps> = ({
  inverted = false,
  compact = false,
  size = 'md',
}) => {
  const s = SIZE_STYLES[size];
  return (
    <div className="flex items-center gap-2.5 select-none shrink-0" aria-label="Hartamas Real Estate">
      <img
        src={BRAND_ASSETS.hartamasLogo}
        alt="Hartamas"
        className={`${s.mark} w-auto rounded-[2px]`}
        draggable={false}
      />
      {!compact && (
        <span
          className={`pl-2.5 border-l font-semibold uppercase tracking-[0.24em] leading-[1.3] ${s.desc} ${
            inverted ? 'border-white/25 text-white/80' : 'border-stone-300 text-stone-500'
          }`}
        >
          Real
          <br />
          Estate
        </span>
      )}
    </div>
  );
};

interface ZurelyLogoProps {
  /** Wordmark height in px (the "y" descender is included). */
  height?: number;
  /** White wordmark for dark backgrounds; the icon keeps its colours. */
  inverted?: boolean;
}

// The wordmark's capital height is 78% of the image (the rest is the "y" descender).
const ZURELY_CAP_RATIO = 0.78;

/** Horizontal Zurely lockup built from the official icon and wordmark. */
export const ZurelyLogo: React.FC<ZurelyLogoProps> = ({ height = 16, inverted = false }) => {
  const cap = height * ZURELY_CAP_RATIO;
  const iconHeight = Math.round(cap * 1.5);
  return (
    <span className="inline-flex items-start shrink-0" style={{ gap: Math.round(height * 0.28) }}>
      <img
        src={BRAND_ASSETS.zurelyIcon}
        alt=""
        aria-hidden="true"
        style={{ height: iconHeight, marginTop: (cap - iconHeight) / 2 }}
        className="w-auto"
        draggable={false}
      />
      <img
        src={BRAND_ASSETS.zurelyWordmark}
        alt="Zurely"
        style={{ height }}
        className={`w-auto ${inverted ? 'brightness-0 invert' : ''}`}
        draggable={false}
      />
    </span>
  );
};

interface PoweredByZurelyProps {
  /** Use on dark backgrounds. */
  inverted?: boolean;
  className?: string;
}

export const PoweredByZurely: React.FC<PoweredByZurelyProps> = ({ inverted = false, className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 text-[11px] font-medium ${
      inverted ? 'text-white/60' : 'text-stone-400'
    } ${className}`}
  >
    <span className="whitespace-nowrap">Powered by</span>
    <ZurelyLogo height={13} inverted={inverted} />
  </div>
);
