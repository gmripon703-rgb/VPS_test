import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { LiveCharts } from './components/LiveCharts.tsx';
import { VoiceConfigBox } from './components/VoiceConfigBox.tsx';
import { TerminalConsole } from './components/TerminalConsole.tsx';
import { DeploymentGuide } from './components/DeploymentGuide.tsx';
import { CMSInstallerPanel } from './components/CMSInstallerPanel.tsx';
import { BDAppGateway } from './components/BDAppGateway.tsx';
import { WireGuardPanel } from './components/WireGuardPanel.tsx';
import { AppHostingCenter } from './components/AppHostingCenter.tsx';
import { SSHAccessPanel } from './components/SSHAccessPanel.tsx';
import { AdminLoginPortal } from './components/AdminLoginPortal.tsx';
import { AdminSecurityModal } from './components/AdminSecurityModal.tsx';
import { getActiveSession, clearActiveSession } from './utils/auth.ts';
import type { AdminAuthState } from './types.ts';
import {
  INITIAL_NODES,
  INITIAL_VOICE_AGENTS,
  INITIAL_TASKS,
  INITIAL_BD_GEOIP,
  INITIAL_WIREGUARD_TUNNEL,
  INITIAL_BD_APPS,
  INITIAL_HOSTED_APPS,
  AVAILABLE_CMS_SCRIPTS,
  INITIAL_INSTALLED_CMS,
  INITIAL_SSH_KEYS,
} from './data/serverData.ts';
import {
  MetricSnapshot,
  ServerNode,
  LogEntry,
  VoiceAgent,
  ScheduledTask,
  WireguardTunnel,
  BDAppProfile,
  HostedApp,
  CMSItem,
  InstalledCMSInstance,
  BDGeoIP,
  SSHKey,
} from './types.ts';
import {
  simulateNextMetrics,
  createInitialLogs,
  generateRandomLog,
} from './utils/metrics.ts';
import { fetchRealGeoIP } from './utils/geoip.ts';
import { processBkashPayment } from './utils/bkashEngine.ts';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AdminAuthState | null>(() => getActiveSession());
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [nodes, setNodes] = useState<ServerNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<ServerNode>(INITIAL_NODES[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(createInitialLogs);
  const [voiceAgents] = useState<VoiceAgent[]>(INITIAL_VOICE_AGENTS);
  const [tasks, setTasks] = useState<ScheduledTask[]>(INITIAL_TASKS);

  // Advanced feature states
  const [tunnel, setTunnel] = useState<WireguardTunnel>(INITIAL_WIREGUARD_TUNNEL);
  const [geoIP, setGeoIP] = useState<BDGeoIP>(INITIAL_BD_GEOIP);
  const [bdApps] = useState<BDAppProfile[]>(INITIAL_BD_APPS);
  const [hostedApps, setHostedApps] = useState<HostedApp[]>(INITIAL_HOSTED_APPS);
  const [cmsList] = useState<CMSItem[]>(AVAILABLE_CMS_SCRIPTS);
  const [installedCMS, setInstalledCMS] = useState<InstalledCMSInstance[]>(INITIAL_INSTALLED_CMS);
  const [sshKeys, setSshKeys] = useState<SSHKey[]>(INITIAL_SSH_KEYS);

  // Initial metric snapshot
  const [metrics, setMetrics] = useState<MetricSnapshot>({
    cpuUsage: 14.2,
    cpuHistory: [12.0, 13.5, 14.8, 14.2, 15.1, 13.8, 14.2],
    ramUsedGb: 0.148,
    ramHistory: [0.142, 0.145, 0.147, 0.148, 0.147, 0.149, 0.148],
    diskUsedGb: 8.4,
    diskReadMb: 1.4,
    diskWriteMb: 0.9,
    networkInMbps: 5.4,
    networkOutMbps: 2.8,
    networkHistory: Array.from({ length: 7 }, () => ({ in: 4.8, out: 2.4 })),
    loadAverage: [0.58, 0.45, 0.38],
    activeProcesses: 42,
    tcpConnections: 28,
    aiVoiceLatencyMs: 98,
    edgeLatencyMs: 38,
  });

  // Query real Geo-IP detection on mount
  useEffect(() => {
    fetchRealGeoIP().then((detected) => {
      setGeoIP(detected);
    });
  }, []);

  // 1. Live telemetry tick (every 3000ms as per user template)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRestarting) {
        setMetrics((prev) =>
          simulateNextMetrics(prev, selectedNode.totalRamGb, selectedNode.totalDiskGb)
        );
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isRestarting, selectedNode.totalRamGb, selectedNode.totalDiskGb]);

  // 2. Periodic background log generator
  useEffect(() => {
    const logTimer = setInterval(() => {
      if (!isRestarting && Math.random() > 0.35) {
        setLogs((prev) => [...prev.slice(-120), generateRandomLog()]);
      }
    }, 4500);
    return () => clearInterval(logTimer);
  }, [isRestarting]);

  // 3. Uptime ticker
  useEffect(() => {
    const uptimeTimer = setInterval(() => {
      setSelectedNode((prev) => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 1,
      }));
    }, 1000);
    return () => clearInterval(uptimeTimer);
  }, []);

  // Graceful restart handler
  const handleRestart = useCallback(() => {
    setIsRestarting(true);
    const ts = new Date().toTimeString().split(' ')[0];

    setLogs((prev) => [
      ...prev,
      {
        id: `log-restart-1-${Date.now()}`,
        timestamp: ts,
        level: 'WARN',
        service: 'system',
        message: 'Re-initializing cloud microservices & WireGuard sockets...',
      },
    ]);

    setTimeout(() => {
      const nowTs = new Date().toTimeString().split(' ')[0];
      setIsRestarting(false);
      setSelectedNode((prev) => ({
        ...prev,
        uptimeSeconds: 0,
        status: 'ONLINE',
      }));

      setLogs((prev) => [
        ...prev,
        {
          id: `log-restart-2-${Date.now()}`,
          timestamp: nowTs,
          level: 'SUCCESS',
          service: 'system',
          message: `[OK] Node re-established on 0.0.0.0:${selectedNode.port}. WireGuard & CMS daemons nominal.`,
        },
      ]);
    }, 1800);
  }, [selectedNode.port]);

  const handleSimulateCall = useCallback((message: string) => {
    const ts = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `call-${Date.now()}`,
        timestamp: ts,
        level: 'SUCCESS',
        service: 'voice',
        message,
      },
    ]);
  }, []);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleAddLog = useCallback((entryOrMsg: LogEntry | string) => {
    const ts = new Date().toTimeString().split(' ')[0];
    if (typeof entryOrMsg === 'string') {
      setLogs((prev) => [
        ...prev.slice(-120),
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: ts,
          level: 'INFO',
          service: 'core',
          message: entryOrMsg,
        },
      ]);
    } else {
      setLogs((prev) => [...prev.slice(-120), entryOrMsg]);
    }
  }, []);

  // Real bKash Payment Processor
  const handleExecuteBkashPayment = useCallback((trxId: string, amount: number, msisdn: string) => {
    const tx = processBkashPayment({ trxId, amount, phone: msisdn });
    handleAddLog(`[bKash LIVE] Payment ${tx.paymentID} logged to storage. BDT ${amount} from ${msisdn}. Status: ${tx.transactionStatus}`);
  }, [handleAddLog]);

  const handleLogout = useCallback(() => {
    clearActiveSession();
    setSession(null);
    setShowSecurityModal(false);
    const ts = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `log-logout-${Date.now()}`,
        timestamp: ts,
        level: 'WARN',
        service: 'auth',
        message: 'Administrator session locked and signed out cleanly.',
      },
    ]);
  }, []);

  // If user is not authenticated, render secure Admin Access Gateway
  if (!session) {
    return (
      <AdminLoginPortal
        onLoginSuccess={(newSession) => setSession(newSession)}
        selectedNode={selectedNode}
        onAddLog={handleAddLog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        nodes={nodes}
        onRestart={handleRestart}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isRestarting={isRestarting}
        session={session}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 relative z-10">
        {/* Restart notification */}
        {isRestarting && (
          <div className="mb-6 p-4 rounded-2xl glass-card border-amber-500/40 text-amber-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-semibold text-sm">
                Container restart in progress: Reloading WireGuard BDIX sockets and CMS processes...
              </span>
            </div>
            <span className="text-xs font-mono bg-amber-950/60 px-2 py-1 rounded">RESTARTING</span>
          </div>
        )}

        {/* 1. NEXUS DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 4-Column Cyberpunk Glassmorphic Metric Cards */}
            <MetricCards metrics={metrics} node={selectedNode} />

            {/* Secondary Section: AI Voice Telephony & Config (Col 1) + Terminal (Col 2-3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="md:col-span-1">
                <VoiceConfigBox
                  onSimulateCall={handleSimulateCall}
                  soundEnabled={soundEnabled}
                  voiceAgents={voiceAgents}
                  latencyMs={metrics.edgeLatencyMs}
                  port={selectedNode.port}
                />
              </div>
              <div className="md:col-span-2">
                <TerminalConsole
                  logs={logs}
                  node={selectedNode}
                  metrics={metrics}
                  onClearLogs={handleClearLogs}
                  onAddLog={handleAddLog}
                  onRestart={handleRestart}
                  soundEnabled={soundEnabled}
                />
              </div>
            </div>

            {/* Real-time Telemetry Timeline Chart */}
            <LiveCharts metrics={metrics} node={selectedNode} />
          </div>
        )}

        {/* 2. CMS AUTO-INSTALLER TAB */}
        {activeTab === 'cms' && (
          <CMSInstallerPanel
            cmsList={cmsList}
            installedCMS={installedCMS}
            setInstalledCMS={setInstalledCMS}
            onAddLog={handleAddLog}
            serverPort={selectedNode.port}
          />
        )}

        {/* 3. BANGLADESHI APPS & BKASH TAB */}
        {activeTab === 'bd-apps' && (
          <BDAppGateway
            apps={bdApps}
            geoIP={geoIP}
            tunnel={tunnel}
            onAddLog={handleAddLog}
            onExecuteBkash={handleExecuteBkashPayment}
          />
        )}

        {/* 4. WIREGUARD VPN TAB */}
        {activeTab === 'wireguard' && (
          <WireGuardPanel
            tunnel={tunnel}
            setTunnel={setTunnel}
            onAddLog={handleAddLog}
          />
        )}

        {/* 5. MULTI-APP & MOBILE HOSTING TAB */}
        {activeTab === 'hosting' && (
          <AppHostingCenter
            hostedApps={hostedApps}
            setHostedApps={setHostedApps}
            onAddLog={handleAddLog}
            serverPort={selectedNode.port}
          />
        )}

        {/* 6. SSH ACCESS & KEYPAIR MANAGER TAB */}
        {activeTab === 'ssh' && (
          <SSHAccessPanel
            keys={sshKeys}
            setKeys={setSshKeys}
            onAddLog={handleAddLog}
            serverIp={selectedNode.ip}
          />
        )}

        {/* 7. TERMINAL TAB */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <span>💻 Dedicated Nexus Container Terminal</span>
                  <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    0.0.0.0:{selectedNode.port}
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Direct interactive shell attached to Gunicorn daemon, WireGuard BDIX interface, and CMS runtime
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  restart
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  clear
                </button>
              </div>
            </div>

            <TerminalConsole
              logs={logs}
              node={selectedNode}
              metrics={metrics}
              onClearLogs={handleClearLogs}
              onAddLog={handleAddLog}
              onRestart={handleRestart}
              soundEnabled={soundEnabled}
              expandedHeight={true}
            />
          </div>
        )}

        {/* 7. RENDER DEPLOY & CODE TAB */}
        {activeTab === 'deploy' && <DeploymentGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#030712] text-slate-500 text-xs py-4 px-4 mt-8 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">⚡ NEXUS // CLOUD CORE</span>
            <span>&bull;</span>
            <span>Host: 0.0.0.0:{selectedNode.port}</span>
            <span>&bull;</span>
            <span className="text-cyan-400">WireGuard: {tunnel.assignedIp}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Render &amp; VPS Production Verified
            </span>
          </div>
        </div>
      </footer>

      {/* Admin Security & Password Settings Modal */}
      {showSecurityModal && (
        <AdminSecurityModal
          session={session}
          onClose={() => setShowSecurityModal(false)}
          onLogout={handleLogout}
          onAddLog={handleAddLog}
          onSessionUpdated={(updatedSession) => setSession(updatedSession)}
        />
      )}
    </div>
  );
}
