import React from 'react';
import { ServerNode } from '../types.ts';
import { Activity, Terminal, Shield, Sparkles, Globe, FileCode, RotateCcw, Volume2, VolumeX, Key } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'cms' | 'bd-apps' | 'wireguard' | 'hosting' | 'ssh' | 'terminal' | 'deploy';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedNode: ServerNode;
  setSelectedNode: (node: ServerNode) => void;
  nodes: ServerNode[];
  onRestart: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  isRestarting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedNode,
  setSelectedNode,
  nodes,
  onRestart,
  soundEnabled,
  setSoundEnabled,
  isRestarting,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#030712]/95 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3.5 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Logo & Nexus Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-black text-xl select-none">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  NEXUS // CLOUD CORE
                </h1>
              </div>
              <p className="text-slate-400 text-xs font-medium">
                Autonomous Linux Core &bull; WireGuard BD Gateway &bull; CMS &amp; App Host
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Indicator */}
            <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 text-[11px] font-semibold tracking-wide">
                RENDER CLOUD: ONLINE
              </span>
            </div>

            {/* Node Selector */}
            <div className="relative">
              <label htmlFor="nexus-node-select-nav" className="sr-only">Select Node</label>
              <select
                id="nexus-node-select-nav"
                aria-label="Select Cloud Node"
                value={selectedNode.id}
                onChange={(e) => {
                  const n = nodes.find((item) => item.id === e.target.value);
                  if (n) setSelectedNode(n);
                }}
                className="bg-[#010409] border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              disabled={isRestarting}
              title="Restart Node & Services"
              aria-label="Restart Node & Services"
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#010409] border border-slate-700 text-slate-200 hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3 h-3 ${isRestarting ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isRestarting ? 'Reloading...' : 'Restart'}</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
              className="p-1.5 text-xs rounded-lg bg-[#010409] border border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1.5 mt-3.5 overflow-x-auto pb-1" aria-label="Dashboard Navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nexus Core</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CMS Auto-Installer</span>
          </button>

          <button
            onClick={() => setActiveTab('bd-apps')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'bd-apps'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>🇧🇩</span>
            <span>BD Apps &amp; bKash</span>
          </button>

          <button
            onClick={() => setActiveTab('wireguard')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'wireguard'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>WireGuard VPN</span>
          </button>

          <button
            onClick={() => setActiveTab('hosting')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'hosting'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Host Web &amp; Mobile</span>
          </button>

          <button
            onClick={() => setActiveTab('ssh')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'ssh'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>SSH Access</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'deploy'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>Render Deploy</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
