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
  const android = /Android/i.test(ua);
  const btn = bar.querySelector('#sb-install-btn');
  const pwaInstall = async () => {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (_) {} deferred = null; }
    else help.style.display = 'flex';
  };
  const downloadApk = async () => {
    const lk = document.getElementById('sb-apk-link'); if (lk) lk.textContent = 'جاري التحميل...';
    try {
      const r = await fetch('/apk/v3.txt?v=3', { cache: 'no-store' });
      if (!r.ok) throw new Error('apk');
      const b64 = (await r.text()).replace(/\s+/g, '');
      const bin = atob(b64), u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const blob = new Blob([u], { type: 'application/vnd.android.package-archive' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'super-baba.apk';
      document.body.appendChild(a); a.click(); a.remove();
      note.style.display = 'block';
    } catch (e) {
      await pwaInstall();
    } finally { const lk2 = document.getElementById('sb-apk-link'); if (lk2) lk2.textContent = 'تحميل APK'; }
  };
  const note = document.createElement('div');
  note.style.cssText = 'display:none;position:sticky;top:60px;z-index:9998;background:#fff4dc;color:#222;padding:10px 12px;font-size:14px;line-height:1.7;border-bottom:1px solid #e0c9a0';
  note.innerHTML = 'افتح الملف <b>super-baba.apk</b> من التنزيلات واضغط <b>تثبيت</b>. لو ظهر تحذير، اسمح بالتثبيت من المتصفح ثم ارجع واضغط تثبيت.';
  bar.after(note);
  btn.addEventListener('click', () => { pwaInstall(); });
  if (android) {
    const apk = document.createElement('a');
    apk.href = '#'; apk.id = 'sb-apk-link'; apk.textContent = 'تحميل APK';
    apk.style.cssText = 'color:#fff;font-size:12px;opacity:.85;text-decoration:underline;margin-inline-start:8px;white-space:nowrap';
    apk.addEventListener('click', e => { e.preventDefault(); downloadApk(); });
    bar.insertBefore(apk, btn);
  }
  window.addEventListener('appinstalled', () => { bar.remove(); help.remove(); });
})();
