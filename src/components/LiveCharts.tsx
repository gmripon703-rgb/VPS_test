import React from 'react';
import { MetricSnapshot, ServerNode } from '../types.ts';
import { LineChart, Activity, Zap } from 'lucide-react';

interface LiveChartsProps {
  metrics: MetricSnapshot;
  node: ServerNode;
}

export const LiveCharts: React.FC<LiveChartsProps> = ({ metrics, node }) => {
  const cpuPoints = metrics.cpuHistory;
  const ramPoints = metrics.ramHistory;

  // Chart dimensions
  const width = 600;
  const height = 140;
  const padding = 20;

  // CPU path
  const cpuCoords = cpuPoints.map((val, idx) => {
    const x = padding + (idx / (cpuPoints.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (val / 100) * (height - 2 * padding);
    return `${x},${y}`;
  });
  const cpuPath = cpuCoords.join(' ');
  const cpuArea = `${padding},${height - padding} ${cpuPath} ${width - padding},${height - padding}`;

  // RAM path
  const ramCoords = ramPoints.map((val, idx) => {
    const x = padding + (idx / (ramPoints.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (val / node.totalRamGb) * (height - 2 * padding);
    return `${x},${y}`;
  });
  const ramPath = ramCoords.join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-200">
            Real-Time Telemetry Timeline (Last 25 Datapoints)
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">CPU Load ({metrics.cpuUsage}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-300">RAM ({metrics.ramUsedGb} GB)</span>
          </div>
        </div>
      </div>

      {/* SVG Real-time Chart */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 sm:h-44 overflow-visible">
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Value markers on left */}
          <text x={padding - 6} y={padding + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">100%</text>
          <text x={padding - 6} y={height / 2 + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">50%</text>
          <text x={padding - 6} y={height - padding} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">0%</text>

          {/* CPU Area & Stroke */}
          <polygon fill="url(#cpuGradient)" points={cpuArea} />
          <polyline
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={cpuPath}
          />

          {/* RAM Stroke */}
          <polyline
            fill="none"
            stroke="#c084fc"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={ramPath}
          />

          {/* Latest Data Dot for CPU */}
          {cpuPoints.length > 0 && (
            <circle
              cx={width - padding}
              cy={height - padding - (metrics.cpuUsage / 100) * (height - 2 * padding)}
              r="4"
              fill="#22d3ee"
              className="animate-ping"
            />
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Polling interval: 3000ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live jitter algorithm: active</span>
        </div>
      </div>
    </div>
  );
};
