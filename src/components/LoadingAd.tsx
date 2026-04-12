import { useEffect, useRef, useState, useCallback } from 'react';
import { useIsPayingUser } from '@/hooks/useIsPayingUser';
import { useNoAds } from '@/hooks/useNoAds';

declare global {
  interface Window {
    adsbygoogle: any[];
    google: any;
  }
}

const AD_SLOT = '3179149216';
const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';

// GAM video ad tag — network 23277638323, ad unit "progressbar" (640x480v)
const GAM_VAST_TAG =
  'https://pubads.g.doubleclick.net/gampad/ads' +
  '?iu=/23277638323/progressbar' +
  '&description_url=' + encodeURIComponent('https://cuenti.to') +
  '&tfcd=1&npa=0&sz=640x480' +
  '&gdfp_req=1&unviewed_position_start=1' +
  '&output=vast&env=vp&impl=s';

/**
 * Video ad via Google Ad Manager (IMA SDK) during story generation.
 * Falls back to AdSense display ad if video doesn't load in 8s.
 */
export function LoadingAd() {
  const { data: isPaying } = useIsPayingUser();
  const noAds = useNoAds();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const adsManagerRef = useRef<any>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [adKey] = useState(() => Date.now());
  const cleanedUp = useRef(false);

  const destroyAdsManager = useCallback(() => {
    if (adsManagerRef.current) {
      try { adsManagerRef.current.destroy(); } catch (_) { /* */ }
      adsManagerRef.current = null;
    }
  }, []);

  // IMA SDK video ad
  useEffect(() => {
    if (isPaying || noAds) return;
    cleanedUp.current = false;

    const loadIMA = (): Promise<void> => new Promise((resolve, reject) => {
      if (window.google?.ima) { resolve(); return; }
      const existing = document.getElementById('ima-sdk-script');
      if (existing) {
        const check = setInterval(() => {
          if (window.google?.ima) { clearInterval(check); resolve(); }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('timeout')); }, 5000);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
      s.id = 'ima-sdk-script';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('load failed'));
      document.head.appendChild(s);
    });

    const fallbackTimer = setTimeout(() => {
      if (!cleanedUp.current) setVideoFailed(true);
    }, 8000);

    loadIMA()
      .then(() => {
        if (cleanedUp.current) return;
        const container = adContainerRef.current;
        const video = videoRef.current;
        if (!container || !video) { setVideoFailed(true); return; }

        const { google } = window;
        const adDisplay = new google.ima.AdDisplayContainer(container, video);
        adDisplay.initialize();
        const loader = new google.ima.AdsLoader(adDisplay);

        loader.addEventListener(
          google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
          (evt: any) => {
            if (cleanedUp.current) return;
            clearTimeout(fallbackTimer);
            const mgr = evt.getAdsManager(video);
            adsManagerRef.current = mgr;

            mgr.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
              console.log('Video ad started');
              video.muted = false;
            });
            mgr.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
              destroyAdsManager();
            });
            mgr.addEventListener(google.ima.AdEvent.Type.AD_ERROR, () => {
              destroyAdsManager();
              if (!cleanedUp.current) setVideoFailed(true);
            });

            try {
              const w = container.offsetWidth || 640;
              const h = Math.round(w * 9 / 16);
              mgr.init(w, h, google.ima.ViewMode.NORMAL);
              mgr.start();
            } catch (e) {
              console.error('AdsManager init error:', e);
              destroyAdsManager();
              if (!cleanedUp.current) setVideoFailed(true);
            }
          }
        );

        loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, () => {
          clearTimeout(fallbackTimer);
          if (!cleanedUp.current) setVideoFailed(true);
        });

        const req = new google.ima.AdsRequest();
        req.adTagUrl = GAM_VAST_TAG + '&correlator=' + Date.now();
        req.linearAdSlotWidth = 640;
        req.linearAdSlotHeight = 480;
        req.nonLinearAdSlotWidth = 640;
        req.nonLinearAdSlotHeight = 150;
        loader.requestAds(req);
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        if (!cleanedUp.current) setVideoFailed(true);
      });

    return () => {
      cleanedUp.current = true;
      clearTimeout(fallbackTimer);
      destroyAdsManager();
    };
  }, [isPaying, noAds, destroyAdsManager]);

  // Display ad fallback
  useEffect(() => {
    if (!videoFailed || isPaying || noAds) return;
    const t = setTimeout(() => {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
      catch (_) { /* */ }
    }, 100);
    return () => clearTimeout(t);
  }, [videoFailed, isPaying, noAds]);

  if (isPaying || noAds) return null;

  return (
    <div className="w-full max-w-[728px] mx-auto my-4">
      {/* GAM Video ad */}
      {!videoFailed && (
        <div
          ref={adContainerRef}
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <video
            ref={videoRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            playsInline
            muted
          />
        </div>
      )}

      {/* AdSense display fallback */}
      {videoFailed && (
        <div className="rounded-lg overflow-hidden bg-muted/30" style={{ minHeight: '280px' }}>
          <ins
            key={adKey}
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '280px' }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </div>
  );
}
