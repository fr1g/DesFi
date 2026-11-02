import { useTelemetry } from '../tools/telemetry'
import Tile from './Tile'
import TimeSeriesChart from './TimeSeriesChart'

export default function WanRateTile() {
    const { history } = useTelemetry()
    const x = history.map((point) => point.timestamp / 1000)

    return (
        <Tile title="WAN速率" className="min-h-0">
            <TimeSeriesChart
                x={x}
                unit="Mbps"
                series={[
                    {
                        label: '下行速率',
                        color: 'var(--color-dsh-series-mist-500)',
                        data: history.map((point) => point.downloadMbps),
                    },
                    {
                        label: '上行速率',
                        color: 'var(--color-dsh-series-olive-500)',
                        data: history.map((point) => point.uploadMbps),
                    },
                ]}
            />
        </Tile>
    )
}
