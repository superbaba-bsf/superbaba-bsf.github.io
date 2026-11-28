// Super Baba ordering API (Supabase). Same backend as before, unchanged.
window.SB_API = (() => {
  const BASE = 'https://oyrebngeqxfkiczsltru.supabase.co';
  const KEY = 'sb_publishable_BRk0ALVVuSwxKj1PpCB37g_uZycYy69';
  async function call(path, method, body, token) {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + (token || KEY),
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) throw new Error('HTTP_' + res.status + ':' + text.slice(0, 200));
    return text ? JSON.parse(text) : null;
  }
  return {
    placeOrder(o) {
      return call('/rest/v1/rpc/create_order', 'POST', {
        p_name: o.name.trim(), p_phone: o.phone.replace(/\s+/g, ''),
        p_address: o.address.trim(), p_note: o.note.trim() || null, p_items: o.items,
      });
    },
    // Full customer-facing tracking payload: status, steps timeline, items, courier.
    track(token) {
      return call('/rest/v1/rpc/order_track', 'POST', { p_token: token });
    },
    // Find recent orders by phone (last 24h). Phone alone returns status only; phone + order code also returns the full-view token.
    find(phone, code) {
      return call('/rest/v1/rpc/order_find', 'POST', { p_phone: phone, p_code: code || null });
    },
    async orderStatus(token) {
      const rows = await call('/rest/v1/rpc/order_status', 'POST', { p_token: token });
      return rows && rows.length ? rows[0] : null;
    },
    async login(email, password) {
      const r = await call('/auth/v1/token?grant_type=password', 'POST', { email, password });
      return r.access_token;
    },
    listOrders(token) {
      return call('/rest/v1/orders?select=*&order=created_at.desc&limit=100', 'GET', undefined, token);
    },
    setStatus(token, id, status) {
      return call('/rest/v1/orders?id=eq.' + encodeURIComponent(id), 'PATCH', { status, updated_at: new Date().toISOString() }, token);
    },
    listCouriers(token) {
      return call('/rest/v1/couriers?select=*&active=eq.true', 'GET', undefined, token);
    },
    assign(token, order, courier) {
      return call('/rest/v1/rpc/staff_assign', 'POST', { p_order: order, p_courier: courier }, token);
    },
    menuStaffList(token) { return call('/rest/v1/menu_items?select=*&order=sort.asc', 'GET', undefined, token); },
    menuCreate(token, row) { return call('/rest/v1/menu_items', 'POST', row, token); },
    menuUpdate(token, id, patch) { return call('/rest/v1/menu_items?id=eq.' + encodeURIComponent(id), 'PATCH', patch, token); },
    async menuUpload(token, path, blob) {
      const res = await fetch(BASE + '/storage/v1/object/menu/' + path, {
        method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + token, 'Content-Type': blob.type || 'image/jpeg' }, body: blob });
      if (!res.ok) throw new Error('HTTP_' + res.status + ':' + (await res.text()).slice(0, 200));
      return BASE + '/storage/v1/object/public/menu/' + path;
    },
    reviewGet(token) { return call('/rest/v1/rpc/review_get', 'POST', { p_token: token }); },
    reviewSubmit(token, restaurant, courier, comment) {
      return call('/rest/v1/rpc/review_submit', 'POST', { p_token: token, p_restaurant: restaurant, p_courier: courier, p_comment: comment || null });
    },
    pushSubscribe(token, endpoint, p256dh, auth) { return call('/rest/v1/rpc/push_subscribe', 'POST', { p_token: token, p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth }); },
    kitchenPushSubscribe(token, endpoint, p256dh, auth) { return call('/rest/v1/rpc/kitchen_push_subscribe', 'POST', { p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth }, token); },
    reviewsPublic() { return call('/rest/v1/rpc/reviews_public', 'POST', {}); },
    reviewsStaff(token) { return call('/rest/v1/rpc/reviews_staff', 'POST', {}, token); },
    reviewHide(token, id, hidden) { return call('/rest/v1/rpc/review_hide', 'POST', { p_id: id, p_hidden: hidden }, token); },
    advance(token, order) {
      return call('/rest/v1/rpc/courier_advance', 'POST', { p_order: order }, token);
    },
  };
})();
window.SB_ERR = e => (e && e.message === 'NOT_CONNECTED' ? 'النظام مش متوصل لسه.' : 'حصلت مشكلة. جرّب تاني.');
