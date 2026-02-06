function loadCloudflareAnalytics(): void {
  const script = document.createElement('script');
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.defer = true;
  script.setAttribute('data-cf-beacon', '{"token": "18c2944ca68243ab9c61ee755d7324fa"}');
  document.head.appendChild(script);
}

function scheduleLoad(): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadCloudflareAnalytics, { timeout: 2000 });
  } else {
    setTimeout(loadCloudflareAnalytics, 2000);
  }
}

function initCloudflareAnalytics(): void {
  if ((window as any).__cloudflareAnalyticsLoaded) return;
  (window as any).__cloudflareAnalyticsLoaded = true;

  if (document.readyState === 'complete') {
    scheduleLoad();
    return;
  }

  window.addEventListener('load', scheduleLoad, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCloudflareAnalytics, { once: true });
} else {
  initCloudflareAnalytics();
}

document.addEventListener('astro:after-swap', initCloudflareAnalytics);
