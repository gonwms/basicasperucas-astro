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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("my-cache").then((cache) => {
      // return cache.addAll(["*.png"])
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
