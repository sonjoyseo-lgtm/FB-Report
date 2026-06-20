/**
 * Utility to dynamically inject Google Analytics (gtag) and Google Tag Manager (GTM) script tags
 */

export function injectGoogleAnalytics(gaId: string) {
  if (!gaId || !gaId.trim()) return;
  const id = gaId.trim();

  // Remove existing GA script and inline configurations to prevent duplicates on save/re-run
  const existingScript = document.querySelector(`script[src*="gtag/js?id=${id}"]`);
  if (existingScript) return; // Already injected

  // 1. Create analytics script tag
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  // 2. Initialize tracking code
  const inlineScript = document.createElement("script");
  inlineScript.type = "text/javascript";
  inlineScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}', { 'anonymize_ip': true });
  `;
  document.head.appendChild(inlineScript);
  console.log(`[Analytics] Google Analytics (GA4) loaded: ${id}`);
}

export function injectGoogleTagManager(gtmId: string) {
  if (!gtmId || !gtmId.trim()) return;
  const id = gtmId.trim();

  // Guard against duplicate injections
  if (window.hasOwnProperty("google_tag_manager") || document.querySelector(`script[src*="gtm.js?id=${id}"]`)) {
    return;
  }

  // Inject GTM Head script
  const script = document.createElement("script");
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${id}');
  `;
  document.head.appendChild(script);

  // Inject GTM Noscript iframe
  const noscript = document.createElement("noscript");
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.appendChild(noscript);
  console.log(`[Analytics] Google Tag Manager loaded: ${id}`);
}
