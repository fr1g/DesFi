import { useMemo, useSyncExternalStore } from 'react'
import { telemetryStore } from './simulator'
import type { TelemetrySimulator } from './simulator'

export function useTelemetry(store: TelemetrySimulator = telemetryStore) {
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}

export function useTelemetryHistory(store: TelemetrySimulator = telemetryStore) {
    return useTelemetry(store).history
}

export function useTelemetryControls(store: TelemetrySimulator = telemetryStore) {
    return useMemo(
        () => ({
            pause: store.pause,
            resume: store.resume,
            togglePaused: store.togglePaused,
            step: store.step,
            reset: store.reset,
            setScenario: store.setScenario,
            setIntervalMs: store.setIntervalMs,
        }),
        [store],
    )
}
