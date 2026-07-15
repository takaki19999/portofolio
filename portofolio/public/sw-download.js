const DOWNLOAD_DELAY_MS = 300000;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SCHEDULE_DOWNLOAD") return;

  const { url, delay, visitorId } = event.data;
  const startDelay = Number.isFinite(delay) ? Math.max(0, delay) : DOWNLOAD_DELAY_MS;

  event.waitUntil(
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, startDelay));
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({ type: "DOWNLOAD_READY", url, visitorId });
      }
    })(),
  );
});
