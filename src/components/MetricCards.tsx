import React from 'react';
import { MetricSnapshot, ServerNode } from '../types.ts';

interface MetricCardsProps {
  metrics: MetricSnapshot;
  node: ServerNode;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, node }) => {
  const ramPercent = Math.min(100, Math.round((metrics.ramUsedGb / node.totalRamGb) * 100));
  const cpuPercent = Math.min(100, Math.round(metrics.cpuUsage));
  const latencyPercent = Math.min(100, Math.round((metrics.edgeLatencyMs / 80) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
      {/* Metric 1: CPU Load (exact id="cpu-load") */}
      <div className="glass-card glow-effect p-5 rounded-2xl transition-all duration-300 hover:border-emerald-500/30">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            CPU Load
          </span>
          <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
            Optimal
          </span>
        </div>
        <div id="cpu-load" className="text-3xl font-extrabold text-white font-mono">
          {metrics.cpuUsage.toFixed(1)}%
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${cpuPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-mono">
          <span>{node.cpuCores} vCPUs Active</span>
          <span>Load: {metrics.loadAverage[0]}</span>
        </div>
      </div>

      {/* Metric 2: Memory Allocation (exact id="ram-usage") */}
      <div className="glass-card glow-purple p-5 rounded-2xl transition-all duration-300 hover:border-purple-500/30">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Memory Allocation
          </span>
          <span className="text-purple-400 text-xs font-mono bg-purple-500/10 px-2 py-0.5 rounded">
            {node.totalRamGb}GB Pool
          </span>
        </div>
        <div id="ram-usage" className="text-3xl font-extrabold text-white font-mono">
          {metrics.ramUsedGb.toFixed(2)} GB
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${ramPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-mono">
          <span>Allocated: {ramPercent}%</span>
          <span>Swap: 64MB</span>
        </div>
      </div>

      {/* Metric 3: Edge Latency (exact id="latency-val") */}
      <div className="glass-card glow-cyan p-5 rounded-2xl transition-all duration-300 hover:border-cyan-500/30">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Edge Latency
          </span>
          <span className="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-0.5 rounded">
            US-East
          </span>
        </div>
        <div id="latency-val" className="text-3xl font-extrabold text-white font-mono">
          {metrics.edgeLatencyMs} ms
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${latencyPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-mono">
          <span>Jitter: 1.2ms</span>
          <span>HTTP/2 • TLS 1.3</span>
        </div>
      </div>

      {/* Metric 4: AI Voice Model */}
      <div className="glass-card p-5 rounded-2xl transition-all duration-300 hover:border-amber-500/30">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            AI Voice Model
          </span>
          <span className="text-amber-400 text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Active
          </span>
        </div>
        <div className="text-2xl font-extrabold text-white font-mono mt-1 tracking-tight">
          ElevenLabs v2
        </div>
        <div className="text-xs text-slate-400 mt-1">
          Custom Voice Cloning Synced
        </div>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-full w-[94%] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
