// 站点 Service Worker：
// - 缓存所有与站点同源的图片；
// - 缓存所有查询参数带 force-sw-cache=true 的 GET 请求（任意资源）；
// - 缓存字体（woff/woff2/ttf/otf/eot，或请求类型为 font），含 CDN 字体。
// 其余请求一律透传。改动缓存策略时同步更新 CACHE_NAME 版本号，activate 会清掉旧缓存。
const CACHE_NAME = 'site-cache-v2'
const FONT_URL = /\.(?:woff2?|ttf|otf|eot)$/i
const IMAGE_URL = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|bmp)$/i

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            // 清空除本缓存以外的所有缓存
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
    const isSameOriginImage = url.origin === self.location.origin &&
        (request.destination === 'image' || IMAGE_URL.test(url.pathname))
    const isFont = request.destination === 'font' || FONT_URL.test(url.pathname)
    const forceCache = url.searchParams.get('force-sw-cache') === 'true'

    if (!isSameOriginImage && !isFont && !forceCache) return

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME)
            const cached = await cache.match(request)
            if (cached) return cached
            const response = await fetch(request)
            // opaque 响应（no-cors 的跨域资源）status 为 0，也按成功缓存
            if (response.ok || response.type === 'opaque') {
                // 个别响应可能不允许缓存（如 Vary: *），失败时仍正常返回网络响应
                await cache.put(request, response.clone()).catch(() => { })
            }
            return response
        })(),
    )
})
