import { useEffect, useRef } from 'react';
import { useIsPayingUser } from '@/hooks/useIsPayingUser';
import { useNoAds } from '@/hooks/useNoAds';

interface AdSlotProps {
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
  slot?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSlot({ format = 'auto', className = '', slot }: AdSlotProps) {
  const { data: isPaying } = useIsPayingUser();
  const noAds = useNoAds();
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (isPaying || noAds || pushed.current) return;
    
    try {
      if (adRef.current && !pushed.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [isPaying, noAds]);

  if (isPaying || noAds) return null;

  return (
    <div className={`ad-container my-4 text-center ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || ''}
        data-ad-slot={slot || ''}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
