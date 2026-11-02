/**
 * 可复现的伪随机数与数值工具：同一种子下时间序列可重复，方便截图和对比设计。
 */

export function createRandom(seed: number) {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

export function round(value: number, digits = 0) {
    const factor = 10 ** digits
    return Math.round(value * factor) / factor
}

export function range(random: () => number, min: number, max: number) {
    return min + random() * (max - min)
}

export function chance(random: () => number, probability: number) {
    return random() < probability
}
