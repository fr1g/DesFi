import type {
    NetworkQuality,
    TelemetryOptions,
    TelemetryPoint,
    TelemetryScenario,
    TelemetrySnapshot,
} from './types'
import { chance, clamp, createRandom, range, round } from './random'

type Range = readonly [number, number]

type ScenarioProfile = {
    download: Range
    upload: Range
    latency: Range
    jitter: Range
    loss: Range
    cpu: Range
    memory: Range
    volatility: number
    eventChance: number
}

const SCENARIOS: Record<TelemetryScenario, ScenarioProfile> = {
    calm: {
        download: [480, 820],
        upload: [120, 220],
        latency: [14, 34],
        jitter: [1.5, 5],
        loss: [0, 0.4],
        cpu: [12, 32],
        memory: [40, 58],
        volatility: 0.7,
        eventChance: 0.015,
    },
    congested: {
        download: [40, 180],
        upload: [10, 50],
        latency: [80, 220],
        jitter: [15, 50],
        loss: [4, 15],
        cpu: [30, 60],
        memory: [45, 70],
        volatility: 1.6,
        eventChance: 0.06,
    },
    'cpu-spike': {
        download: [280, 600],
        upload: [70, 150],
        latency: [30, 80],
        jitter: [4, 14],
        loss: [0.5, 3],
        cpu: [75, 98],
        memory: [45, 72],
        volatility: 1.1,
        eventChance: 0.04,
    },
    'memory-pressure': {
        download: [280, 600],
        upload: [70, 150],
        latency: [30, 80],
        jitter: [4, 14],
        loss: [0.5, 2.5],
        cpu: [35, 70],
        memory: [84, 98],
        volatility: 1,
        eventChance: 0.03,
    },
    outage: {
        download: [0, 8],
        upload: [0, 3],
        latency: [180, 650],
        jitter: [40, 160],
        loss: [25, 70],
        cpu: [8, 24],
        memory: [30, 50],
        volatility: 2.2,
        eventChance: 0.02,
    },
}

type InternalState = {
    tick: number
    timestamp: number
    scenario: TelemetryScenario
    downloadMbps: number
    uploadMbps: number
    latencyMs: number
    jitterMs: number
    packetLossPct: number
    cpuPct: number
    memoryPct: number
    networkSpike: number
    cpuSpike: number
    memorySpike: number
    memoryDrift: number
    memoryGcAt: number
}

const DEFAULT_SEED = 20261031
const DEFAULT_INTERVAL_MS = 1000
const DEFAULT_HISTORY_SIZE = 60
const MIN_INTERVAL_MS = 100

const midpoint = ([min, max]: Range) => (min + max) / 2

function createInitialState(scenario: TelemetryScenario): InternalState {
    const profile = SCENARIOS[scenario]
    return {
        tick: 0,
        timestamp: Date.now(),
        scenario,
        downloadMbps: midpoint(profile.download),
        uploadMbps: midpoint(profile.upload),
        latencyMs: midpoint(profile.latency),
        jitterMs: midpoint(profile.jitter),
        packetLossPct: midpoint(profile.loss),
        cpuPct: midpoint(profile.cpu),
        memoryPct: midpoint(profile.memory),
        networkSpike: 0,
        cpuSpike: 0,
        memorySpike: 0,
        memoryDrift: 0,
        memoryGcAt: 6,
    }
}

function getNetworkQuality(
    downloadMbps: number,
    latencyMs: number,
    jitterMs: number,
    packetLossPct: number,
): NetworkQuality {
    if (downloadMbps < 1 || packetLossPct >= 40) return 'offline'
    if (packetLossPct >= 8 || jitterMs >= 40 || latencyMs >= 180) return 'poor'
    if (packetLossPct >= 3 || jitterMs >= 18 || latencyMs >= 90) return 'fair'
    if (packetLossPct >= 0.8 || jitterMs >= 8 || latencyMs >= 40) return 'good'
    return 'excellent'
}

function toPoint(state: InternalState): TelemetryPoint {
    return {
        tick: state.tick,
        timestamp: state.timestamp,
        scenario: state.scenario,
        downloadMbps: round(state.downloadMbps),
        uploadMbps: round(state.uploadMbps),
        latencyMs: round(state.latencyMs, 1),
        jitterMs: round(state.jitterMs, 1),
        packetLossPct: round(state.packetLossPct, 2),
        cpuPct: round(state.cpuPct, 1),
        memoryPct: round(state.memoryPct, 1),
    }
}

export class TelemetrySimulator {
    private readonly listeners = new Set<() => void>()
    private readonly historySize: number
    private intervalMs: number
    private seed: number
    private random: () => number
    private state: InternalState
    private history: TelemetryPoint[]
    private snapshot: TelemetrySnapshot
    private serverSnapshot: TelemetrySnapshot
    private timer: ReturnType<typeof setInterval> | null = null
    private paused = false

    constructor(options: TelemetryOptions = {}) {
        this.seed = options.seed ?? DEFAULT_SEED
        this.intervalMs = Math.max(MIN_INTERVAL_MS, options.intervalMs ?? DEFAULT_INTERVAL_MS)
        this.historySize = Math.max(2, options.historySize ?? DEFAULT_HISTORY_SIZE)
        this.random = createRandom(this.seed)
        this.state = createInitialState(options.scenario ?? 'calm')
        this.history = [toPoint(this.state)]
        this.snapshot = this.buildSnapshot()
        this.serverSnapshot = this.snapshot
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener)
        if (this.listeners.size === 1) this.start()
        return () => {
            this.listeners.delete(listener)
            if (this.listeners.size === 0) this.stop()
        }
    }

    getSnapshot = () => this.snapshot

    getServerSnapshot = () => this.serverSnapshot

    pause = () => {
        if (this.paused) return
        this.paused = true
        this.stop()
        this.publish()
    }

    resume = () => {
        if (!this.paused) return
        this.paused = false
        this.publish()
        this.start()
    }

    togglePaused = () => {
        if (this.paused) this.resume()
        else this.pause()
    }

    step = (count = 1) => {
        const safeCount = Math.max(0, Math.floor(count))
        for (let index = 0; index < safeCount; index += 1) this.advance()
    }

    reset = (seed = this.seed) => {
        this.seed = seed
        this.random = createRandom(seed)
        this.state = createInitialState(this.state.scenario)
        this.history = [toPoint(this.state)]
        this.publish()
    }

    setScenario = (scenario: TelemetryScenario) => {
        if (this.state.scenario === scenario) return
        this.state.scenario = scenario
        this.publish()
    }

    setIntervalMs = (intervalMs: number) => {
        const next = Math.max(MIN_INTERVAL_MS, Math.floor(intervalMs))
        if (next === this.intervalMs) return
        this.intervalMs = next
        if (this.timer !== null) {
            this.stop()
            this.start()
        }
        this.publish()
    }

    private start() {
        if (this.timer !== null || this.paused || this.listeners.size === 0) return
        this.timer = setInterval(() => this.advance(), this.intervalMs)
    }

    private stop() {
        if (this.timer === null) return
        clearInterval(this.timer)
        this.timer = null
    }

    private advance() {
        const state = this.state
        const profile = SCENARIOS[state.scenario]
        const random = this.random
        const volatility = profile.volatility

        state.tick += 1
        state.timestamp += this.intervalMs

        // 短时尖峰随时间衰减；概率事件在此处叠加
        state.networkSpike *= 0.72
        state.cpuSpike *= 0.62
        state.memorySpike *= 0.82

        if (chance(random, profile.eventChance)) {
            const kind = random()
            if (kind < 0.45) state.networkSpike += range(random, 80, 360)
            else if (kind < 0.7) state.cpuSpike += range(random, 18, 55)
            else if (kind < 0.9) state.memorySpike += range(random, 8, 28)
            else {
                state.networkSpike += range(random, 40, 180)
                state.cpuSpike += range(random, 10, 30)
            }
        }

        const smooth = (value: number, target: Range, attraction: number, noise: number) => {
            const nextTarget = range(random, target[0], target[1])
            return value + (nextTarget - value) * attraction + (random() - 0.5) * noise * volatility
        }

        state.downloadMbps = clamp(
            smooth(state.downloadMbps, profile.download, 0.22, 32) + state.networkSpike * 0.35,
            0,
            2000,
        )
        state.uploadMbps = clamp(
            smooth(state.uploadMbps, profile.upload, 0.2, 10) + state.networkSpike * 0.08,
            0,
            1000,
        )
        state.latencyMs = clamp(
            smooth(state.latencyMs, profile.latency, 0.24, 5) + state.networkSpike * 0.05,
            1,
            999,
        )
        state.jitterMs = clamp(
            smooth(state.jitterMs, profile.jitter, 0.22, 2.4) + state.networkSpike * 0.02,
            0,
            300,
        )
        state.packetLossPct = clamp(
            smooth(state.packetLossPct, profile.loss, 0.25, 0.35) + state.networkSpike * 0.006,
            0,
            100,
        )
        state.cpuPct = clamp(
            smooth(state.cpuPct, profile.cpu, 0.16, 4.5) + state.cpuSpike,
            0,
            100,
        )

        // 丢包会进一步推高延迟/抖动，并压低吞吐
        state.latencyMs = clamp(state.latencyMs + state.packetLossPct * 1.8, 1, 999)
        state.jitterMs = clamp(state.jitterMs + state.packetLossPct * 0.9, 0, 300)
        state.downloadMbps = clamp(state.downloadMbps * (1 - state.packetLossPct / 140), 0, 2000)

        // 内存缓慢爬升，超过随机阈值后模拟一次 GC 回落
        state.memoryDrift += range(random, 0.15, 0.45)
        if (state.memoryDrift >= state.memoryGcAt) {
            state.memoryDrift = 0
            state.memoryGcAt = range(random, 4, 10)
        }
        state.memoryPct = clamp(
            smooth(state.memoryPct, profile.memory, 0.08, 0.8) +
                state.memorySpike +
                state.memoryDrift,
            0,
            100,
        )

        this.history = [...this.history, toPoint(state)].slice(-this.historySize)
        this.publish()
    }

    private buildSnapshot(): TelemetrySnapshot {
        const point = toPoint(this.state)
        return {
            seed: this.seed,
            intervalMs: this.intervalMs,
            tick: this.state.tick,
            timestamp: this.state.timestamp,
            scenario: this.state.scenario,
            paused: this.paused,
            network: {
                downloadMbps: point.downloadMbps,
                uploadMbps: point.uploadMbps,
                latencyMs: point.latencyMs,
                jitterMs: point.jitterMs,
                packetLossPct: point.packetLossPct,
                quality: getNetworkQuality(
                    point.downloadMbps,
                    point.latencyMs,
                    point.jitterMs,
                    point.packetLossPct,
                ),
            },
            system: {
                cpuPct: point.cpuPct,
                memoryPct: point.memoryPct,
            },
            history: this.history,
        }
    }

    private publish() {
        this.snapshot = this.buildSnapshot()
        for (const listener of this.listeners) listener()
    }
}

export function createTelemetrySimulator(options: TelemetryOptions = {}) {
    return new TelemetrySimulator(options)
}

// 默认单例：所有 tile 读同一份数据；首个订阅者出现时启动，全部卸载后停止。
export const telemetryStore = createTelemetrySimulator()
