import { RefreshCw } from 'lucide-react'
import { triggerRefresh } from '../api'

export default function RefreshButton({ pipelineRunning, setPipelineRunning, onRefreshComplete }) {
    // user interaction handler
    const handleRefresh = async () => {
        try {
            // flag
            setPipelineRunning(true)
            // POST /refresh
            await triggerRefresh()
            onRefreshComplete()
        } catch (err) {
            // handle errors w axio
            alert(`Refresh failed: ${err.response?.data?.detail || err.message}`)
        } finally {
            // reset flag
            setPipelineRunning(false)
        }
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={pipelineRunning}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                border transition-all duration-200
                ${pipelineRunning
                    ? 'bg-transparent border-purple-500/50 text-purple-400 cursor-not-allowed opacity-70'
                    : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 cursor-pointer'
                }
            `}
        >
            <RefreshCw
                size={15}
                className={pipelineRunning ? 'animate-spin' : ''}
            />
            {pipelineRunning ? 'Fetching data...' : 'Refresh Data'}
        </button>
    )
}