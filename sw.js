/* SKID 근무표 알림용 서비스워커
   알림 신호(내용 없음)를 받으면 → 내 개인 링크로 서버에서 내 알림 내용만 가져와 보여 줌 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let title = "SKID 근무표", body = "근무표를 확인해 주세요";
    try {
      const c = await caches.open("skid-cfg"), r = await c.match("cfg");
      if (r) {
        const { api, tok } = await r.json();
        const x = await fetch(api + "?api=1&op=note&pin=" + encodeURIComponent(tok) + "&_=" + Date.now(), { redirect: "follow", cache: "no-store" });
        const j = await x.json();
        if (j && j.note) { title = j.note.title || title; body = j.note.body || body; }
      }
    } catch (err) {}
    await self.registration.showNotification(title, { body, icon: "icon-192.png", badge: "icon-192.png", tag: "skid", renotify: true });
  })());
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(l => {
    for (const c of l) if ("focus" in c) return c.focus();
    return self.clients.openWindow("./");
  }));
});
