// Super Baba: install as app. Always-visible install bar at the top of the page.
(() => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return;
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  let deferred = null;

  const bar = document.createElement('div');
  bar.id = 'sb-install-bar';
  bar.style.cssText = 'position:sticky;top:0;z-index:9999;background:#103d3b;color:#fff;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;box-shadow:0 2px 8px rgba(0,0,0,.25);font-family:inherit';
  bar.innerHTML = '<span style="font-weight:700;font-size:15px">📲 حمّل تطبيق سوبر بابا</span>' +
    '<button type="button" id="sb-install-btn" style="background:#f28c28;color:#fff;border:0;border-radius:10px;padding:10px 16px;font:inherit;font-weight:700;min-height:44px;cursor:pointer">تحميل التطبيق</button>';
  document.body.insertBefore(bar, document.body.firstChild);

  const help = document.createElement('div');
  help.id = 'sb-install-help';
  help.style.cssText = 'display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:16px';
  const steps = ios
    ? '<ol style="margin:8px 0;padding-inline-start:22px;line-height:2"><li>افتح الموقع من <b>Safari</b> (مش من داخل تطبيق تاني).</li><li>اضغط زر المشاركة <span aria-hidden="true">⬆️</span> اللي تحت.</li><li>اختار <b>«إضافة إلى الشاشة الرئيسية»</b>.</li><li>اضغط <b>«إضافة»</b>، وهتلاقي أيقونة سوبر بابا على الشاشة.</li></ol>'
    : '<ol style="margin:8px 0;padding-inline-start:22px;line-height:2"><li>افتح الموقع من <b>Chrome</b>.</li><li>اضغط النقط التلاتة <b>⋮</b> فوق.</li><li>اختار <b>«تثبيت التطبيق»</b> أو <b>«إضافة إلى الشاشة الرئيسية»</b>.</li><li>اضغط <b>«تثبيت»</b>، وهتلاقي أيقونة سوبر بابا على الشاشة.</li></ol>';
  help.innerHTML = '<div style="background:#fff;color:#222;border-radius:16px;max-width:420px;width:100%;padding:18px;direction:rtl;text-align:right;font-family:inherit"><h3 style="margin:0 0 4px">إزاي تحمّل التطبيق</h3>' + steps +
    '<button type="button" id="sb-help-x" style="width:100%;background:#103d3b;color:#fff;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:700;min-height:44px;cursor:pointer">تمام</button></div>';
  document.body.appendChild(help);
  const close = () => { help.style.display = 'none'; };
  help.addEventListener('click', e => { if (e.target === help) close(); });
  help.querySelector('#sb-help-x').addEventListener('click', close);

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  bar.querySelector('#sb-install-btn').addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (_) {}
      deferred = null;
    } else {
      help.style.display = 'flex';
    }
  });
  window.addEventListener('appinstalled', () => { bar.remove(); help.remove(); });
})();
