// 只缓存字体的 Service Worker：所有字体文件任意格式都会缓存，其他请求一律透传、不缓存。
// 字体来源包括 jsDelivr 的 CDN 字体和 public/fonts 下的本地字体；新增字体不用改这里。
const CACHE_NAME = 'fonts-v1'
const FONT_URL = /\.(?:woff2?|ttf|otf|eot)(?:$|[?#])/i

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // 保证缓存里只有字体：清空除本缓存以外的所有缓存
            const keys = await caches.keys()
            const stale = keys.filter((key) => key !== CACHE_NAME)
            await Promise.all(stale.map((key) => caches.delete(key)))
            await self.clients.claim()
        })(),
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return
    const url = new URL(request.url)
    const isFont = request.destination === 'font' || FONT_URL.test(url.pathname)
    if (!isFont) return

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME)
            const cached = await cache.match(request)
            if (cached) return cached
            const response = await fetch(request)
            if (response.ok) await cache.put(request, response.clone())
            return response
        })(),
    )
})
