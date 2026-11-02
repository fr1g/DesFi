import { useTelemetry } from '../tools/telemetry'
import Tile from './Tile'
import TimeSeriesChart from './TimeSeriesChart'

export default function WanQualityTile() {
    const { history } = useTelemetry()
    const x = history.map((point) => point.timestamp / 1000)

    return (
        <Tile title="WAN连接质量" className="min-h-0">
            <TimeSeriesChart
                x={x}
                unit="ms"
                series={[
                    {
                        label: '时延',
                        color: 'var(--color-dsh-series-mauve-500)',
                        data: history.map((point) => point.latencyMs),
                    },
                    {
                        label: '抖动',
                        color: 'var(--color-dsh-series-olive-400)',
                        data: history.map((point) => point.jitterMs),
                    },
                ]}
            />
        </Tile>
    )
}
