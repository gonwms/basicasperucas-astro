// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open("cache-001").then((cache) => {
//       return cache.addAll([
//         "/", // Home page
//         "/logo-dark.png", // Example asset
//         "/favicon.ico", // Favicon
//         "/assets/*", // Add all other static assets as needed
//       ])
//     })
//   )
// })

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       return cachedResponse || fetch(event.request)
//     })
//   )
// })

self.addEventListener("install", async (event) => {
  const cache = await caches.open("my-cache")
  await cache.addAll([
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.svg",
    "*.webp",
    "*.ico",
    "*.css",
    "*.js",
    "https://cdn.jsdelivr.net/npm/maplibre-gl@2.3.1/dist/maplibre-gl.js", // Agrega la ruta de la biblioteca maplibre-gl aquí
  ])
})

self.addEventListener("fetch", async (event) => {
  const response = await caches.match(event.request)
  return response || fetch(event.request)
})
