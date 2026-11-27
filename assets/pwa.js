// Super Baba: install as app. Registers the service worker and shows an Arabic install banner.
(() => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone || localStorage.getItem('sb-install-hide') === '1') return;
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua);
  let deferred = null;
  const host = document.createElement('div');
  host.style.cssText = 'margin:12px 0';
  const wrap = document.querySelector('.wrap') || document.body;
  wrap.insertBefore(host, wrap.firstChild);
  const hide = () => { localStorage.setItem('sb-install-hide', '1'); host.remove(); };
  const box = inner => {
    host.innerHTML = '<div class="callout" style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:0"><div style="flex:1;min-width:200px">' + inner + '</div><button type="button" id="sb-x" class="btn ghost sm" aria-label="اقفل">✕</button></div>';
    host.querySelector('#sb-x').addEventListener('click', hide);
  };
  if (ios) {
    box('<b>حمّل تطبيق سوبر بابا</b>من Safari: اضغط زر المشاركة <span aria-hidden="true">⬆️</span> ثم «إضافة إلى الشاشة الرئيسية» ثم «إضافة».');
    return;
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    box('<b>حمّل تطبيق سوبر بابا</b>اطلب وتابع طلبك من أيقونة على موبايلك.<br><button type="button" class="btn sm" id="sb-install" style="margin-top:8px">تحميل التطبيق</button>');
    host.querySelector('#sb-install').addEventListener('click', async () => {
      deferred.prompt(); await deferred.userChoice; deferred = null; host.remove();
    });
  });
  window.addEventListener('appinstalled', () => host.remove());
})();
