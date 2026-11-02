/**
 * 注册站点缓存用的 Service Worker（见 public/sw.js）：字体、同源图片，
 * 以及查询参数带 force-sw-cache=true 的请求。
 * 不支持 Service Worker 的环境静默跳过；注册失败不影响页面，资源照常走网络加载。
 */
export function registerFontServiceWorker() {
    if (!('serviceWorker' in navigator)) return

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // 注册失败无需处理：没有 SW 时资源也能正常加载
        })
    })
}
