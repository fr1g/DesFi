export type TelemetryScenario =
    | 'calm'
    | 'congested'
    | 'cpu-spike'
    | 'memory-pressure'
    | 'outage'

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline'

export type TelemetryPoint = {
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
}

export type TelemetrySnapshot = {
    seed: number
    intervalMs: number
    tick: number
    timestamp: number
    scenario: TelemetryScenario
    paused: boolean
    network: {
        downloadMbps: number
        uploadMbps: number
        latencyMs: number
        jitterMs: number
        packetLossPct: number
        quality: NetworkQuality
    }
    system: {
        cpuPct: number
        memoryPct: number
    }
    history: TelemetryPoint[]
}

export type TelemetryOptions = {
    seed?: number
    intervalMs?: number
    historySize?: number
    scenario?: TelemetryScenario
}
