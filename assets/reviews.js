// Super Baba: public rating summary and recent reviews on the home page.
(() => {
  const box = document.getElementById('reviews');
  if (!box || !window.SB_API) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stars = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  window.SB_API.reviewsPublic().then(r => {
    if (!r || !r.count) return;
    const avg = Number(r.avg);
    box.innerHTML = '<h3 style="margin-top:0">تقييمات العملاء</h3>' +
      '<p class="rv-sum"><b>' + avg.toFixed(1) + '</b> <span class="rv-static">' + stars(Math.round(avg)) + '</span> <span class="muted">تقييم الأكل، من ' + r.count + ' تقييم</span></p>' +
      (r.recent || []).map(x => '<div class="rv-item"><div><b>' + esc(x.name) + '</b> <span class="rv-static">' + stars(x.stars) + '</span></div>' + (x.comment ? '<p>' + esc(x.comment) + '</p>' : '') + '</div>').join('');
    box.style.display = '';
  }).catch(() => {});
})();
