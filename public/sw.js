// Cache names
const TILE_CACHE = 'map-tiles-cache-v1';
const STATIC_CACHE = 'static-cache-v1';

// Assets to cache
const STATIC_ASSETS = [
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.svg',
  '*.webp',
  '*.ico',
  '*.css',
  '*.js',
  'https://cdn.jsdelivr.net/npm/maplibre-gl@2.3.1/dist/maplibre-gl.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      // Create tiles cache
      caches.open(TILE_CACHE)
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle tile requests
  if (url.pathname.endsWith('.pbf')) {
    event.respondWith(handleTileRequest(event.request));
    return;
  }

  // Handle other requests
  event.respondWith(handleGeneralRequest(event.request));
});

// Handle tile requests with authentication
async function handleTileRequest(request) {
  const cache = await caches.open(TILE_CACHE);

  // Try to get from cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Clone the request to add authentication
    const authenticatedRequest = new Request(request.url, {
      headers: {
        ...request.headers,
        Authorization: `Bearer ${YOUR_API_KEY}` // Replace with your actual API key
      }
    });

    // Fetch with authentication
    const response = await fetch(authenticatedRequest);

    if (response.ok) {
      // Clone the response before caching because the response body can only be used once
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
      return response;
    }

    throw new Error(`Failed to fetch tile: ${response.status}`);
  } catch (error) {
    console.error('Tile fetch error:', error);
    // Return a fallback tile or error response
    return new Response('Tile fetch failed', { status: 500 });
  }
}

// Handle general requests
async function handleGeneralRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const responseToCache = response.clone();
      await cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    return new Response('Network request failed', { status: 500 });
  }
}

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.filter((name) => name !== TILE_CACHE && name !== STATIC_CACHE).map((name) => caches.delete(name)));
    })
  );
});
