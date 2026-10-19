import { useCallback, useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { useToast } from '../components/Toast';

const loadEngine = () => import('../cv/renderCv');

export const useCvDownload = () => {
  const site = useSite();
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!site.allReady) return undefined;
    const warm = () => { loadEngine(); };
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(warm, { timeout: 5000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(warm, 2500);
    return () => clearTimeout(timer);
  }, [site.allReady]);

  const download = useCallback(async () => {
    if (busy) return;
    if (Object.values(site.failed).some(Boolean)) {
      notify('error', site.copy.cv.failed);
      return;
    }
    setBusy(true);
    try {
      const { renderCv } = await loadEngine();
      const blob = await renderCv(site);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(site.personal.name || site.copy.brand.brandName).trim()} CV.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error(error);
      notify('error', site.copy.cv.failed);
    } finally {
      setBusy(false);
    }
  }, [busy, site, notify]);

  return { download, busy, ready: site.allReady };
};
