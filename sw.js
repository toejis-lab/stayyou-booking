/* 펜션 예약 관리 — 서비스워커
   목적: 안드로이드에서 '앱 설치'가 뜨게 하는 필수 조건(설치 가능성) 충족 +
         인터넷이 끊겨도 앱이 최소한 열리도록 마지막 페이지를 보관.
   주의: 항상 '네트워크 우선'이라, 기존 APP_VERSION 자동 업데이트를 방해하지 않음.
         Firebase 등 외부 요청은 건드리지 않고 그대로 통과시킴. */
const CACHE = 'stayyou-booking-shell-v3';
const SHELL = './';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.add(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 페이지 열기(네비게이션)만 처리: 네트워크 우선, 실패하면(오프라인) 마지막 캐시
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(SHELL))
    );
    return;
  }
  // 그 외(Firebase, 이미지 등)는 그대로 통과 — 캐시/버전 로직에 개입하지 않음
});
