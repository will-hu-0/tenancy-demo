import React from 'react';

interface ZurelyLogoProps {
  compact?: boolean;
}

export const ZurelyLogo: React.FC<ZurelyLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center select-none">
      <span className="text-[20px] font-bold tracking-tight text-[#0F2942] whitespace-nowrap shrink-0">
        {compact ? 'TMY' : 'TenancyMY'}
      </span>
    </div>
  );
};
