import { useState, useEffect, useCallback } from 'react'
import { fetchData, fetchStats } from './api'
import { ChartColumnDecreasing } from 'lucide-react'
import OutagesTable  from './components/OutagesTable'
import YearlyChart   from './components/YearlyChart'
import RefreshButton from './components/RefreshButton'

export default function App() {

    // outages table states
    const [rows,       setRows]       = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState(null)
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [filters,    setFilters]    = useState({ dateFrom: '', dateTo: '' })

    // yearly chart states
    const [stats,        setStats]        = useState([])
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError,   setStatsError]   = useState(null)

    // pipeline state
    const [pipelineRunning, setPipelineRunning] = useState(false)

    // fetch outage records
    const loadData = useCallback(async (page = 1) => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchData({
                page,
                limit:    12,
                dateFrom: filters.dateFrom,
                dateTo:   filters.dateTo,
            })
            setRows(result.data)
            setPagination({ page: result.page, pages: result.pages, total: result.total })
        } catch (err) {
            setError(err.response?.data?.detail || err.message)
            setRows([])
        } finally {
            setLoading(false)
        }
    }, [filters])

    // fetch yearly outages
    const loadStats = useCallback(async () => {
        setStatsLoading(true)
        setStatsError(null)
        try {
            const result = await fetchStats()
            setStats(result.data)
        } catch (err) {
            setStatsError(err.response?.data?.detail || err.message)
        } finally {
            setStatsLoading(false)
        }
    }, [])

    // initial load
    useEffect(() => {
        loadData(1)
        loadStats()
    }, [loadData, loadStats])

    // reload table when filters change
    useEffect(() => {
        loadData(1)
    }, [filters])

    // refresh on user interaction
    const handleRefreshComplete = () => {
        loadData(1)
        loadStats()
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#0F193C] to-[#1D224A] text-white p-8 flex flex-col gap-8">

            {/* header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                        <ChartColumnDecreasing size={20} className="text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Nuclear Outages Overview
                    </h1>
                </div>
                <RefreshButton
                    pipelineRunning={pipelineRunning}
                    setPipelineRunning={setPipelineRunning}
                    onRefreshComplete={handleRefreshComplete}
                />
            </div>

            {/* grid */}
            <div className="grid grid-cols-2 gap-5 flex-1" style={{ minHeight: '560px' }}>

                <OutagesTable
                    data={rows}
                    loading={loading}
                    error={error}
                    filters={filters}
                    setFilters={setFilters}
                    pagination={pagination}
                    onPageChange={(p) => loadData(p)}
                />

                <YearlyChart
                    stats={stats}
                    loading={statsLoading}
                    error={statsError}
                />

            </div>
        </div>
    )
}