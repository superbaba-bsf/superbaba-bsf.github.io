// Super Baba hero: loads three light WebP figures and swaps the item in his hand on each spin.
(() => {
  const fig = document.querySelector('.sbm-hero .sb-fig');
  if (!fig) return;
  const imgs = fig.querySelectorAll('img');
  const names = ['pizza', 'burger', 'crispy'];
  const urls = [];
  const load = n => fetch('assets/assets/hero-' + n + '.b64.txt').then(r => r.text()).then(t => {
    const bin = atob(t.trim()), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], { type: 'image/webp' }));
  });
  const show = i => imgs.forEach(im => { im.src = urls[i]; });
  let cur = 0;
  Promise.all(names.map(load)).then(u => {
    u.forEach((x, i) => { urls[i] = x; });
    show(0);
    const schedule = e => {
      if (e.animationName !== 'sb-act') return;
      // swap while he is turned away (middle of the spin)
      setTimeout(() => { cur = (cur + 1) % names.length; show(cur); }, 2340);
    };
    fig.addEventListener('animationstart', schedule);
    fig.addEventListener('animationiteration', schedule);
  }).catch(() => {});
})();
