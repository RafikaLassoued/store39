// ============================================
// Tracking & Analytics Integration
// Facebook Pixel + TikTok Pixel + GA4 + GTM
// ============================================

// ---- Facebook/Meta Pixel ----
export function initFacebookPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    w.fbq =
      w.fbq ||
      function () {
        (w.fbq.callMethod = w.fbq.callMethod || []).push(arguments);
      };
    if (!w._fbq) w._fbq = w.fbq;
    w.fbq('init', pixelId);
    w.fbq('track', 'PageView');
  } catch (e) {
    console.warn('Facebook Pixel init failed:', e);
  }
}

export function fbTrack(event: string, params?: Record<string, any>): void {
  try {
    const w = window as any;
    if (w.fbq) {
      w.fbq('track', event, params);
    }
  } catch (e) {
    console.warn('Facebook Pixel track failed:', e);
  }
}

// ---- TikTok Pixel ----
export function initTikTokPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    w.TiktokAnalyticsObject = 'ttq';
    w.ttq =
      w.ttq ||
      function () {
        (w.ttq.methods = w.ttq.methods || []).push(arguments);
      };
    w.ttq.load = function (id: string) {
      w.ttq.id = id;
    };
    w.ttq.load(pixelId);
    w.ttq.page();
  } catch (e) {
    console.warn('TikTok Pixel init failed:', e);
  }
}

export function ttqTrack(event: string, params?: Record<string, any>): void {
  try {
    const w = window as any;
    if (w.ttq) {
      w.ttq.track(event, params);
    }
  } catch (e) {
    console.warn('TikTok Pixel track failed:', e);
  }
}

// ---- Google Analytics 4 ----
export function initGA4(measurementId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      w.dataLayer.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', measurementId);
  } catch (e) {
    console.warn('GA4 init failed:', e);
  }
}

export function gtagTrack(event: string, params?: Record<string, any>): void {
  try {
    const w = window as any;
    if (w.gtag) {
      w.gtag('event', event, params);
    }
  } catch (e) {
    console.warn('GA4 track failed:', e);
  }
}

// ---- GTM ----
export function initGTM(gtmId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    const script = document.createElement('script');
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
    document.head.appendChild(script);
  } catch (e) {
    console.warn('GTM init failed:', e);
  }
}

// ---- Unified Tracking Events ----
export type TrackingEventType =
  | 'page_view'
  | 'view_content'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'initiate_checkout'
  | 'order_created'
  | 'purchase'
  | 'whatsapp_order_click'
  | 'lead';

export function trackEvent(event: TrackingEventType, data?: Record<string, any>): void {
  // Facebook Pixel
  const fbEventMap: Record<TrackingEventType, string> = {
    page_view: 'PageView',
    view_content: 'ViewContent',
    add_to_cart: 'AddToCart',
    remove_from_cart: 'RemoveFromCart',
    initiate_checkout: 'InitiateCheckout',
    order_created: 'Purchase',
    purchase: 'Purchase',
    whatsapp_order_click: 'Lead',
    lead: 'Lead',
  };
  fbTrack(fbEventMap[event], data);

  // TikTok Pixel
  const ttqEventMap: Record<TrackingEventType, string> = {
    page_view: 'PageView',
    view_content: 'ViewContent',
    add_to_cart: 'AddToCart',
    remove_from_cart: 'RemoveFromCart',
    initiate_checkout: 'Checkout',
    order_created: 'SubmitForm',
    purchase: 'CompletePayment',
    whatsapp_order_click: 'ClickButton',
    lead: 'Lead',
  };
  ttqTrack(ttqEventMap[event], data);

  // GA4
  gtagTrack(event, data);

  // Console log for development
  console.log(`[Tracking] ${event}`, data);
}
