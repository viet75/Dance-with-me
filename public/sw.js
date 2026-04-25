self.addEventListener("push", function (event) {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Nuovo avviso", {
      body: data.body || "Controlla le ultime novità",
      icon: "/icon-192.png",
      data: {
        url: data.url || "/news",
      },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(targetUrl));
});
