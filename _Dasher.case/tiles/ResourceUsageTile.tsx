import { useContext } from 'react'
import { CpuIcon, TabIcon } from 'tdesign-icons-react'
import { useTelemetry } from '../tools/telemetry'
import { PreviewModeContext } from './PreviewModeContext'
import Tile from './Tile'
import TimeSeriesChart from './TimeSeriesChart'

export default function ResourceUsageTile() {
    const { history, system } = useTelemetry()
    const preview = useContext(PreviewModeContext)
    const x = history.map((point) => point.timestamp / 1000)
    const cpu = Math.round(system.cpuPct)
    const memoryGb = ((system.memoryPct / 100) * 4).toFixed(1)
    const cpuWarning = !preview && system.cpuPct >= 90
    const memoryWarning = !preview && system.memoryPct >= 90
    const warning = cpuWarning || memoryWarning

    return (
        // Agent: 我们设定总内存量是4GB，那么根据内存在图表显示的占用，反过来算内存占用大小。小数点取1位。
        <Tile title="资源使用率" className="min-h-0 " status={warning ? 'warning' : undefined}>
            <div className='grid grid-cols-4 gap-2 h-full'>
                <div className='col-span-full md:col-span-1 place-items-center grid'>
                    <div className=' flex flex-row md:flex-col  items-start gap-4'>
                        <div className='flex gap-2 '>
                            <CpuIcon size={32} className='grow h-full block!' fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />
                            <div className='grow'>
                                <p className=' text-dsh-text-secondary text-sm/3'>
                                    CPU %
                                </p>
                                <p className={`font-semibold text-2xl ${cpuWarning ? 'group-hover:text-dsh-warning' : ''}`}>{preview ? '-' : cpu}</p>
                            </div>
                        </div>
                        <div className='flex gap-2 '>
                            <TabIcon size={32} className='grow h-full block!' fillColor='transparent' strokeColor='currentColor' strokeWidth={2} />

                            <div className='grow'>
                                <p className=' text-dsh-text-secondary text-sm/3'>
                                    RAM GB
                                </p>
                                <p className={`font-semibold text-2xl ${memoryWarning ? 'group-hover:text-dsh-warning' : ''}`}>{preview ? '-' : memoryGb}<span className='text-stone-400/70 text-xs/1.75 '>/ 4GB</span></p>

                            </div>
                        </div>
                    </div>
                </div>

                <TimeSeriesChart
                    className='col-span-full md:col-span-3 '
                    x={x}
                    unit="%"
                    series={[
                        {
                            label: 'CPU',
                            color: 'var(--color-dsh-series-mist-500)',
                            data: history.map((point) => point.cpuPct),
                        },
                        {
                            label: '内存',
                            color: 'var(--color-dsh-series-mauve-500)',
                            data: history.map((point) => point.memoryPct),
                        },
                    ]}
                />
            </div>

        </Tile>
    )
}
