/**
 * 注册只缓存字体的 Service Worker（见 public/sw.js）。
 * 不支持 Service Worker 的环境静默跳过；注册失败不影响页面，字体照常走网络加载。
 */
export function registerFontServiceWorker() {
    if (!('serviceWorker' in navigator)) return

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // 注册失败无需处理：没有 SW 时字体也能正常加载
        })
    })
}
