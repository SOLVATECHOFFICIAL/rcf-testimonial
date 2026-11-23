import { useState } from 'react';

interface RcfLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RcfLogo({ size = 'md', className = '' }: RcfLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizeClasses = {
    sm: 'h-10 px-2 py-0.5 rounded-lg',
    md: 'h-14 px-2.5 py-1 rounded-xl',
    lg: 'h-20 sm:h-24 px-3 py-1.5 rounded-2xl',
  }[size];

  if (imgFailed) {
    return (
      <div
        className={`inline-flex w-fit items-center justify-center bg-[#0B2545] text-white font-display font-bold tracking-tight ${sizeClasses} ${className}`}
        aria-label="Redeemed Christian Fellowship Logo"
      >
        RCF
      </div>
    );
  }

  return (
    <div
      className={`inline-flex w-fit items-center justify-center bg-black overflow-hidden shrink-0 ${sizeClasses} ${className}`}
    >
      <img
        src="/rcf.webp"
        alt="Redeemed Christian Fellowship (RCF) Logo"
        className="h-full w-auto object-contain select-none"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}
