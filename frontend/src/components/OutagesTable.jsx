// display filtered and paginated outage records with sorting option
import { useState } from 'react'

export default function OutagesTable({ data, loading, error, filters, setFilters, pagination, onPageChange }) {

    // local states
    const [sortKey, setSortKey] = useState('period')
    const [sortDir, setSortDir] = useState('desc')

    // sort data logic
    const sorted = [...(data || [])].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
    })

    // user interaction
    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
    }

    // formating values
    const fmt = (key, val) => {
        if (val == null) return '—'
        if (key === 'percentOutage') return `${Number(val).toFixed(2)}%`
        if (key === 'capacity' || key === 'outage') return Number(val).toLocaleString()
        return val
    }

    // define columns
    const cols = [
        { key: 'period',        label: 'Period'      },
        { key: 'capacity',      label: 'Capacity MW' },
        { key: 'outage',        label: 'Outage MW'   },
        { key: 'percentOutage', label: '% Outage'    },
    ]

    const SortIcon = ({ colKey }) => {
        if (sortKey !== colKey) return <span className="opacity-40">↕</span>
        return <span className="text-purple-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
    }

    return (
        <div className="rounded-lg border border-white/10 overflow-hidden bg-[#162040]">

            {/* filters */}
            <div className="flex gap-2 p-4 border-b border-white/10 flex-wrap">
                <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                    className="flex-1 min-w-[130px] bg-white/5 border border-white/10 rounded-md text-white text-sm px-3 py-2 outline-none focus:border-purple-500"
                />
                <input
                    type="date"
                    value={filters.dateTo}
                    onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                    className="flex-1 min-w-[130px] bg-white/5 border border-white/10 rounded-md text-white text-sm px-3 py-2 outline-none focus:border-purple-500"
                />
                <button
                    onClick={() => setFilters({ dateFrom: '', dateTo: '' })}
                    className="bg-white/5 border border-white/10 rounded-md text-white/60 text-sm px-4 py-2 hover:bg-white/10 hover:text-white transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* table */}
            <div className="overflow-x-auto overflow-y-auto max-h-320">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5">
                            {cols.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50 whitespace-nowrap cursor-pointer"
                                >
                                    <button className="flex items-center gap-1 hover:text-white transition-colors">
                                        {col.label}
                                        <SortIcon colKey={col.key} />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">

                        {/* loading */}
                        {loading && Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}>
                                {cols.map(col => (
                                    <td key={col.key} className="px-4 py-3">
                                        <div className="h-3 rounded bg-white/10 animate-pulse w-3/4" />
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* errors */}
                        {!loading && error && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-red-400 text-sm">
                                    Loading error
                                </td>
                            </tr>
                        )}

                        {!loading && !error && sorted.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-white/40 text-sm">
                                    No data — click Refresh Dataqx
                                </td>
                            </tr>
                        )}

                        {!loading && !error && sorted.map((row, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                {cols.map(col => (
                                    <td
                                        key={col.key}
                                        className={`px-4 py-3 whitespace-nowrap
                                            ${col.key === 'period'   ? 'font-medium text-white'        : ''}
                                            ${col.key === 'capacity' ? 'font-mono font-semibold text-white' : ''}
                                            ${col.key === 'outage'   ? 'font-mono font-semibold text-white' : ''}
                                            ${col.key === 'percentOutage' ? 'text-white/60'             : ''}
                                        `}
                                    >
                                        {fmt(col.key, row[col.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5">
                <span className="text-xs text-white/40">
                    {pagination.total} records — page {pagination.page} of {pagination.pages}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        ←
                    </button>
                    <button
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => onPageChange(pagination.page + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        →
                    </button>
                </div>
            </div>

        </div>
    )
}