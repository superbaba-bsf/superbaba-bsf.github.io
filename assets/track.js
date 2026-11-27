// Super Baba order tracking: shared renderer for /order/ and /track/.
window.SB_TRACK = (() => {
  const STEPS = [
    { key: 'new',       title: 'استلمنا طلبك',   note: 'طلبك وصلنا' },
    { key: 'preparing', title: 'بنجهز طلبك',     note: 'المطبخ شغال عليه' },
    { key: 'ready',     title: 'جاهز للتوصيل',   note: 'اتلف وخرج من المطبخ' },
    { key: 'moving',    title: 'في الطريق إليك', note: 'المندوب معاه طلبك' },
    { key: 'delivered', title: 'وصل',            note: 'بالهنا والشفا' }
  ];
  const RANK = { new: 0, preparing: 1, ready: 2, assigned: 3, picked_up: 3, delivered: 4, cancelled: -1 };
  const HEADS = {
    new: 'طلبك وصلنا',
    preparing: 'بنجهز طلبك دلوقتي',
    ready: 'طلبك جاهز ومستني المندوب',
    assigned: 'المندوب استلم طلبك',
    picked_up: 'طلبك في الطريق إليك',
    delivered: 'طلبك وصل، بالهنا والشفا',
    cancelled: 'الطلب اتلغى'
  };
  const money = n => (n == null ? '' : n + ' ج.م');
  const time = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' });
  };
  const ago = iso => {
    if (!iso) return '';
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return 'دلوقتي';
    if (mins === 1) return 'قبل دقيقة';
    if (mins < 60) return 'قبل ' + mins + ' دقيقة';
    const h = Math.floor(mins / 60), m = mins % 60;
    return 'قبل ' + h + ' ساعة' + (m ? ' و' + m + ' دقيقة' : '');
  };
  const stepTime = (o, key) => {
    const evs = o.events || [];
    if (key === 'moving') {
      const e = evs.find(x => x.status === 'assigned') || evs.find(x => x.status === 'picked_up');
      return e ? e.at : '';
    }
    const e = evs.find(x => x.status === key);
    return e ? e.at : '';
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function html(o, opts) {
    opts = opts || {};
    const st = o.status;
    const rank = RANK[st] == null ? 0 : RANK[st];
    const cancelled = st === 'cancelled';
    const done = st === 'delivered';
    const items = (o.items || []).map(i =>
      `<li><span>${esc(i.qty)} × ${esc(i.name)}${(i.extras || []).length ? ' <small class="muted">+ ' + i.extras.map(esc).join(' + ') + '</small>' : ''}</span><b>${money(i.unit_price * i.qty)}</b></li>`
    ).join('');
    const steps = STEPS.map((s, i) => {
      const cls = cancelled ? (i === 0 ? 'done' : 'pending') : (i < rank ? 'done' : i === rank ? (done ? 'done' : 'now') : 'pending');
      const t = stepTime(o, s.key);
      const mark = cls === 'done' ? '✓' : cls === 'now' ? '•' : '';
      return `<li class="${cls}"><span class="trk-dot" aria-hidden="true">${mark}</span><b>${s.title}</b><span>${t ? time(t) + ' · ' : ''}${s.note}</span></li>`;
    }).join('');
    const wa = 'https://wa.me/201102707994?text=' + encodeURIComponent('استفسار عن طلب ' + (o.code || ''));
    return `
      <div class="trk-head">
        <div><span class="trk-code">${esc(o.code || '')}</span><h2>${cancelled ? HEADS.cancelled : HEADS[st] || 'طلبك'}</h2></div>
        <span class="sbo-pill s-${esc(st)}">${esc(window.SB_STATUS_AR && window.SB_STATUS_AR[st] || st)}</span>
      </div>
      ${cancelled ? '<div class="callout warn"><b>الطلب اتلغى</b>لو ده مش متوقع، كلمنا على واتساب.</div>' : `<ol class="trk-steps">${steps}</ol>`}
      ${o.courier_name && !cancelled ? `<div class="callout"><b>المندوب: ${esc(o.courier_name)}</b>هو اللي جاي بطلبك.</div>` : ''}
      <div class="trk-meta"><span>آخر تحديث: ${ago(o.updated_at)}</span><span>${done || cancelled ? '' : 'الصفحة بتتحدّث لوحدها'}</span></div>
      <div class="trk-sum">
        <b>تفاصيل الطلب</b>
        <ul>${items}</ul>
        <p class="trk-total"><span>إجمالي الأصناف</span><b>${money(o.total_egp)}</b></p>
        <p class="muted">بدون رسوم التوصيل. الإجمالي النهائي بيتأكد معاك على واتساب.</p>
        ${o.address ? `<p class="muted">العنوان: ${esc(o.address)}</p>` : ''}
      </div>
      <div class="trk-share">
        <a class="btn sec sm" href="${wa}" target="_blank" rel="noopener noreferrer">كلمنا على واتساب</a>
        ${opts.share ? `<button type="button" class="btn ghost sm" data-trk-copy>انسخ لينك التتبع</button>` : ''}
      </div>
      <p class="muted" data-trk-msg style="display:none"></p>`;
  }

  function mount(el, token, opts) {
    opts = opts || {};
    let timer = null, last = '';
    const paint = o => {
      if (!o) {
        el.innerHTML = '<div class="callout warn"><b>مفيش طلب بالرقم ده</b>راجع اللينك اللي وصلك من سوبر بابا.</div>';
        return false;
      }
      const h = html(o, opts);
      if (h !== last) { el.innerHTML = h; last = h; }
      const btn = el.querySelector('[data-trk-copy]');
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', async () => {
          const link = location.origin + '/track/#' + token;
          try { await navigator.clipboard.writeText(link); } catch (e) { prompt('لينك التتبع:', link); return; }
          const msg = el.querySelector('[data-trk-msg]');
          if (msg) { msg.textContent = 'اللينك اتنسخ.'; msg.style.display = ''; }
        });
      }
      return o.status === 'delivered' || o.status === 'cancelled';
    };
    const tick = async () => {
      try {
        const o = await window.SB_API.track(token);
        if (paint(o) && timer) { clearInterval(timer); timer = null; }
      } catch (e) { /* keep last good render */ }
    };
    el.innerHTML = '<p class="muted">بنجيب حالة طلبك…</p>';
    tick();
    if (!opts.once) timer = setInterval(tick, 15000);
    return { stop() { if (timer) clearInterval(timer); }, tick };
  }

  function tokenFromLocation() {
    const h = (location.hash || '').replace(/^#/, '');
    if (h) return h.trim();
    const p = new URLSearchParams(location.search);
    return (p.get('t') || p.get('token') || '').trim();
  }
  function tokenFromPaste(v) {
    v = (v || '').trim();
    const m = v.match(/[#?](?:t=)?([0-9a-f]{16,})/i);
    if (m) return m[1];
    return v;
  }
  return { html, mount, tokenFromLocation, tokenFromPaste, time, ago };
})();
