import { useEffect, useRef } from 'react'
import { Quantum } from 'ldrs/react'
import 'ldrs/react/Quantum.css'
import {
    Chart,
    BarElement, BarController,
    LineElement, LineController, PointElement,
    CategoryScale, LinearScale,
    Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(
    BarElement, BarController,
    LineElement, LineController, PointElement,
    CategoryScale, LinearScale,
    Tooltip, Legend, Filler
)

export default function YearlyChart({ stats, loading, error }) {

    const barRef  = useRef(null)
    const lineRef = useRef(null)
    const barChart  = useRef(null)
    const lineChart = useRef(null)

    useEffect(() => {
        // return if data hasnt loaded
        if (!stats?.length || loading) return

        const data = stats.slice(-10)

        // destroy before we draw new one
        if (barChart.current)  barChart.current.destroy()
        if (lineChart.current) lineChart.current.destroy()

        // bar chart avg per year
        barChart.current = new Chart(barRef.current, {
            type: 'bar',
            data: {
                labels:   data.map(d => d.year),
                datasets: [{
                    label:               'Avg Outage MW',
                    data:                data.map(d => d.avg_outage),
                    backgroundColor:     'rgba(168, 85, 247, 0.7)',
                    hoverBackgroundColor:'rgba(192, 132, 252, 0.9)',
                    borderRadius:        6,
                    borderSkipped:       false,
                }]
            },
            options: {
                responsive:          true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#162040',
                        borderColor:     'rgba(255,255,255,0.1)',
                        borderWidth:     1,
                        titleColor:      'rgba(255,255,255,0.5)',
                        bodyColor:       '#ffffff',
                        padding:         10,
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y.toLocaleString()} MW`
                        }
                    }
                },
                scales: {
                    x: {
                        grid:   { display: false },
                        ticks:  { color: 'rgba(255,255,255,0.4)', font: { size: 11 } },
                        border: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        grid:   { color: 'rgba(255,255,255,0.05)' },
                        ticks:  { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: val => val.toLocaleString() },
                        border: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        })

        // line chart max per year
        lineChart.current = new Chart(lineRef.current, {
            type: 'line',
            data: {
                labels:   data.map(d => d.year),
                datasets: [{
                    label:           'Max Outage MW',
                    data:            data.map(d => d.max_outage),
                    borderColor:     'rgba(168, 85, 247, 0.9)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                    pointRadius:     4,
                    pointHoverRadius:6,
                    borderWidth:     2,
                    tension:         0.4,
                    fill:            true,
                }]
            },
            options: {
                responsive:          true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#162040',
                        borderColor:     'rgba(255,255,255,0.1)',
                        borderWidth:     1,
                        titleColor:      'rgba(255,255,255,0.5)',
                        bodyColor:       '#ffffff',
                        padding:         10,
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y.toLocaleString()} MW`
                        }
                    }
                },
                scales: {
                    x: {
                        grid:   { display: false },
                        ticks:  { color: 'rgba(255,255,255,0.4)', font: { size: 11 } },
                        border: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        grid:   { color: 'rgba(255,255,255,0.05)' },
                        ticks:  { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, callback: val => val.toLocaleString() },
                        border: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        })

        return () => {
            if (barChart.current)  barChart.current.destroy()
            if (lineChart.current) lineChart.current.destroy()
        }

    }, [stats, loading])

    return (
        <div className="rounded-lg border border-white/10 overflow-hidden bg-[#162040] flex flex-col h-full">

            {loading && (
                <div className="flex-1 m-4 rounded-md bg-white/5 animate-pulse" />
            )}

            {!loading && error && (
                <div className="flex items-center justify-center my-auto">
                    <Quantum
                        size="55"
                        speed="2"
                        color="white"
                    />
                </div>
            )}

            {!loading && !error && !stats?.length && (
                <div className="flex items-center justify-center flex-1 text-white/40 text-sm">
                    No data available
                </div>
            )}

            {!loading && !error && stats?.length > 0 && (
                <>
                    <div className="flex flex-col flex-1 p-4 border-b border-white/10">
                        <div className="mb-2">
                            <div className="text-sm font-semibold text-white">Average Yearly Outages</div>
                            <div className="text-xs text-white/40">avg outage MW per year</div>
                        </div>
                        <div className="flex-1" style={{ minHeight: 0 }}>
                            <canvas ref={barRef} />
                        </div>
                    </div>

                    <div className="flex flex-col flex-1 p-4">
                        <div className="mb-2">
                            <div className="text-sm font-semibold text-white">Max Yearly Outages</div>
                            <div className="text-xs text-white/40">max outage MW per year</div>
                        </div>
                        <div className="flex-1" style={{ minHeight: 0 }}>
                            <canvas ref={lineRef} />
                        </div>
                    </div>
                </>
            )}

        </div>
    )
}