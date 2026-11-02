# Dasher 模拟数据工具

无 UI 的数据模拟层，给 Dasher 的 tile 提供会变化的监控指标。它不会渲染任何界面；tile 的布局、字体和间距仍由设计稿决定。

## 提供的数据

- `network.downloadMbps` / `uploadMbps`：网络吞吐（Mbps）
- `network.latencyMs` / `jitterMs`：延迟与抖动（ms）
- `network.packetLossPct`：丢包率（%）
- `network.quality`：`excellent` / `good` / `fair` / `poor` / `offline`
- `system.cpuPct` / `memoryPct`：CPU 与内存占用（%）
- `history`：最近 N 个采样点（默认 60 个，1s 间隔即 60s），每个点包含上述指标与当时的场景名

## 图表库

图表使用 `uplot`（不在依赖白名单）：使用它的 tile 必须留在 Dasher 的懒加载边界内。`history` 可以直接映射成 uPlot 的 `[time, ...series]` 数据；组件里需要引入 `uplot/dist/uPlot.min.css`，时间轴传秒（`timestamp / 1000`）。React 侧用 `useEffect` 创建实例、`setData()` 更新、卸载时 `destroy()`。

## 快速接入

```tsx
import { useTelemetry, useTelemetryControls } from './tools/telemetry'

const { network, system, history, paused } = useTelemetry()
const { togglePaused, step, setScenario, reset } = useTelemetryControls()

// network.downloadMbps、network.packetLossPct、system.cpuPct ...
// history 直接喂给折线/柱状图
```

路径按 tile 所在位置调整。整个 Dasher 是懒加载的，所以这些工具也会跟着案例进入按需 chunk。

## 场景

```ts
setScenario('calm') // 正常
setScenario('congested') // 拥塞：低吞吐，高延迟/抖动/丢包
setScenario('cpu-spike') // CPU 高负载
setScenario('memory-pressure') // 内存压力
setScenario('outage') // 断网
```

场景切换后数值会平滑过渡，不会瞬移；下一次 tick 开始生效。

## 控制

```ts
const { pause, resume, togglePaused, step, reset, setIntervalMs } = useTelemetryControls()
```

- `pause()` / `resume()`：暂停 / 恢复计时。
- `step(n)`：手动推进 n 个 tick；暂停时做截图或对比最方便。
- `reset(seed?)`：回到初始值；同一个 seed 会得到同一条序列。
- `setIntervalMs(ms)`：改采样间隔（最小 100ms）。
- `setScenario(name)`：切换场景。

默认单例 `telemetryStore` 在所有 tile 之间共享；第一个 `useTelemetry` 订阅时启动，全部卸载后停止。需要独立实例时用 `createTelemetrySimulator()`。

## 无 UI

本目录不包含仪表盘 UI。tile 需要由设计稿提供后再接入；接入时只读 `useTelemetry()` 的数据，不要在工具层里加视觉组件。
