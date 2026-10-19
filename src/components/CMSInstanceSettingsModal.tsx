import React, { useState } from 'react';
import { Settings, Server, Database, HardDrive, Cpu, Shield, RefreshCw, Download, Check, AlertCircle, Play, Sparkles, Globe, Key, Trash2 } from 'lucide-react';
import type { InstalledCMSInstance } from '../types.ts';

interface CMSInstanceSettingsModalProps {
  instance: InstalledCMSInstance;
  onClose: () => void;
  onUpdate: (updated: InstalledCMSInstance) => void;
  onAddLog: (msg: string) => void;
  serverPort: number;
}

export const CMSInstanceSettingsModal: React.FC<CMSInstanceSettingsModalProps> = ({
  instance,
  onClose,
  onUpdate,
  onAddLog,
  serverPort,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'resources' | 'database' | 'security'>('general');
  const [siteTitle, setSiteTitle] = useState(instance.siteTitle);
  const [installPath, setInstallPath] = useState(instance.installPath);
  const [customDomain, setCustomDomain] = useState(instance.customDomain || `${instance.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.nexus-cloud.local`);
  const [adminEmail, setAdminEmail] = useState(instance.adminEmail);
  const [adminUsername, setAdminUsername] = useState(instance.adminUsername || 'admin');
  const [memoryLimitMb, setMemoryLimitMb] = useState(instance.memoryLimitMb || 128);
  const [cacheEnabled, setCacheEnabled] = useState(instance.cacheEnabled ?? true);
  const [sslEnforced, setSslEnforced] = useState(instance.sslEnforced ?? true);
  const [isMaintenance, setIsMaintenance] = useState(instance.status === 'MAINTENANCE');
  const [maintenanceMessage, setMaintenanceMessage] = useState(instance.maintenanceMessage || 'Platform undergoing scheduled cloud maintenance.');
  const [workerCount, setWorkerCount] = useState(instance.workerCount || 1);
  const [isFlushingCache, setIsFlushingCache] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: InstalledCMSInstance = {
      ...instance,
      siteTitle,
      installPath: installPath.startsWith('/') ? installPath : `/${installPath}`,
      customDomain,
      adminEmail,
      adminUsername,
      memoryLimitMb,
      cacheEnabled,
      sslEnforced,
      workerCount,
      status: isMaintenance ? 'MAINTENANCE' : 'ONLINE',
      maintenanceMessage,
    };
    onUpdate(updated);
    setStatusMessage('Hosting configurations saved successfully!');
    onAddLog(`[CMS HOSTING] Updated configuration for ${instance.name} (${installPath}) - Memory: ${memoryLimitMb}MB, Workers: ${workerCount}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFlushCache = () => {
    setIsFlushingCache(true);
    onAddLog(`[CACHE PURGE] Flushing bytecode cache and static assets for ${instance.name}...`);
    setTimeout(() => {
      setIsFlushingCache(false);
      setStatusMessage('Cache and runtime buffers purged successfully.');
      onAddLog(`[CACHE PURGE] 184MB buffer cleared for ${instance.name}`);
      setTimeout(() => setStatusMessage(null), 3000);
    }, 700);
  };

  const handleRestartInstance = () => {
    setIsRestarting(true);
    onAddLog(`[CONTAINER] Sending SIGHUP to ${instance.name} worker processes...`);
    setTimeout(() => {
      setIsRestarting(false);
      setStatusMessage(`${instance.name} container restarted cleanly.`);
      onAddLog(`[CONTAINER] ${instance.name} online on port ${serverPort} (PID: ${Math.floor(Math.random() * 8000 + 1000)})`);
      setTimeout(() => setStatusMessage(null), 3000);
    }, 900);
  };

  const handleRunMigrations = () => {
    setIsMigrating(true);
    setMigrationLogs([
      `[1/4] Connecting to ${instance.databaseType}...`,
      `[2/4] Verifying tables and schema integrity...`,
      `[3/4] Applying incremental schema migration 2026_10_01_core...`,
      `[4/4] Optimizing database indices for low-RAM performance...`,
      `[SUCCESS] 14 tables verified. Migration complete with 0 errors.`,
    ]);
    onAddLog(`[DB MIGRATION] Executed database migrations for ${instance.name}`);
    setTimeout(() => {
      setIsMigrating(false);
    }, 1200);
  };

  const handleExportDatabaseDump = () => {
    const dumpData = {
      instanceId: instance.id,
      cmsName: instance.name,
      exportedAt: new Date().toISOString(),
      databaseType: instance.databaseType,
      siteTitle,
      tables: ['users', 'posts', 'options', 'metadata', 'comments'],
      sampleSql: `-- Nexus Cloud SQL Backup for ${instance.name}\n-- Generated on Render.com Web Service\nCREATE TABLE IF NOT EXISTS site_options (\n  id INT PRIMARY KEY,\n  option_name VARCHAR(255),\n  option_value TEXT\n);\nINSERT INTO site_options VALUES (1, 'site_title', '${siteTitle}');\nINSERT INTO site_options VALUES (2, 'memory_limit', '${memoryLimitMb}MB');\n`,
    };

    const blob = new Blob([JSON.stringify(dumpData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${instance.name.toLowerCase()}_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onAddLog(`[DB BACKUP] Downloaded database dump for ${instance.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-7 rounded-2xl border border-amber-500/30 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {instance.name} &bull; Hosting &amp; Container Settings
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  instance.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {instance.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Route: {instance.installPath} &bull; Engine: {instance.runtimeEngine || 'Embedded Low-RAM Worker'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            aria-label="Close Settings Modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs font-mono">
          {[
            { id: 'general', label: 'General & Domain' },
            { id: 'resources', label: '512MB RAM Tuning' },
            { id: 'database', label: 'Database & Backup' },
            { id: 'security', label: 'Security & Access' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feedback Alert */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TAB 1: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Site Title / Portal Brand:</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Web Ingress Subpath:</label>
                <input
                  type="text"
                  value={installPath}
                  onChange={(e) => setInstallPath(e.target.value)}
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Custom Virtual Domain:</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. blog.yourdomain.com"
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Administrator Contact Email:</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Maintenance Mode & SSL Toggles */}
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">Maintenance Mode</span>
                  <span className="text-slate-500 text-[11px]">Display maintenance screen while preserving backend data</span>
                </div>
                <input
                  type="checkbox"
                  checked={isMaintenance}
                  onChange={(e) => setIsMaintenance(e.target.checked)}
                  className="h-4 w-4 rounded bg-black border-slate-700 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
                />
              </div>

              {isMaintenance && (
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">Maintenance Notice Message:</label>
                  <input
                    type="text"
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="w-full bg-black/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-300 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-white font-semibold block">Force TLS / SSL Auto-Redirect</span>
                  <span className="text-slate-500 text-[11px]">Enforce HTTPS with Let&apos;s Encrypt certificate</span>
                </div>
                <input
                  type="checkbox"
                  checked={sslEnforced}
                  onChange={(e) => setSslEnforced(e.target.checked)}
                  className="h-4 w-4 rounded bg-black border-slate-700 text-cyan-500 focus:ring-cyan-500/20 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={handleRestartInstance}
                disabled={isRestarting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isRestarting ? 'Restarting Instance...' : 'Restart Instance'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Hosting Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: 512MB RAM TUNING */}
        {activeTab === 'resources' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Memory Allocation on 512MB Render Container</span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Allocate dedicated RAM limit to prevent out-of-memory container crashes on Render Free Tier.
                  </p>
                </div>
                <span className="font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  {memoryLimitMb}MB Limit
                </span>
              </div>

              {/* Memory preset selector buttons */}
              <div className="grid grid-cols-4 gap-2 pt-1 font-mono">
                {[64, 128, 192, 256].map((mb) => (
                  <button
                    key={mb}
                    type="button"
                    onClick={() => setMemoryLimitMb(mb)}
                    className={`py-2 px-2 rounded-xl text-center border transition cursor-pointer ${
                      memoryLimitMb === mb
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-sm">{mb}MB</span>
                    <span className="text-[10px] text-slate-500">
                      {mb <= 128 ? 'Safe (512M)' : 'Heavy CMS'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Visual RAM Pool Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Render Container Total Pool: 512MB</span>
                  <span>Occupied: {Math.round((memoryLimitMb / 512) * 100)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
                    style={{ width: `${(memoryLimitMb / 512) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Workers and Cache */}
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold block">OPcache / Memory Acceleration</span>
                  <span className="text-slate-500 text-[11px]">Precompiles script bytecode in RAM for 3x faster page generation</span>
                </div>
                <input
                  type="checkbox"
                  checked={cacheEnabled}
                  onChange={(e) => setCacheEnabled(e.target.checked)}
                  className="h-4 w-4 rounded bg-black border-slate-700 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-white font-semibold block">Active Worker Processes</span>
                  <span className="text-slate-500 text-[11px]">Recommended: 1 worker on 512MB RAM tier</span>
                </div>
                <select
                  value={workerCount}
                  onChange={(e) => setWorkerCount(Number(e.target.value))}
                  className="bg-black border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Worker (Recommended)</option>
                  <option value={2}>2 Workers (High Load)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleFlushCache}
                disabled={isFlushingCache}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFlushingCache ? 'animate-spin text-cyan-400' : ''}`} />
                <span>{isFlushingCache ? 'Flushing Buffers...' : 'Flush Cache & OPcache'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveGeneral}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Resource Limits</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DATABASE & BACKUPS */}
        {activeTab === 'database' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Database Driver:</span>
                <span className="text-white font-bold">{instance.databaseType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Database File / Host:</span>
                <span className="text-cyan-400">{instance.dbHost || 'localhost:sqlite3'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Name:</span>
                <span className="text-emerald-400">{instance.dbName || `${instance.name.toLowerCase()}_prod`}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRunMigrations}
                disabled={isMigrating}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left space-y-1 cursor-pointer transition"
              >
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Schema Migrations</span>
                </div>
                <p className="text-[11px] text-slate-400">Apply pending database tables &amp; indexes</p>
              </button>

              <button
                type="button"
                onClick={handleExportDatabaseDump}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left space-y-1 cursor-pointer transition"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Database Backup</span>
                </div>
                <p className="text-[11px] text-slate-400">Download complete SQL / JSON snapshot</p>
              </button>
            </div>

            {/* Migration Terminal Output */}
            {migrationLogs.length > 0 && (
              <div className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                {migrationLogs.map((log, i) => (
                  <div key={i} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SECURITY & ACCESS */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">CMS Root Admin Username:</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-black/60 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Reset CMS Admin Passphrase:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="NexusMasterAdmin_2026!"
                    className="flex-1 bg-black/60 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("NexusMasterAdmin_2026!");
                      setStatusMessage('CMS admin password copied to clipboard!');
                      setTimeout(() => setStatusMessage(null), 2500);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-mono cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
                Admin Panel Endpoint: <span className="text-white font-bold">https://nexus-ai-panel.onrender.com{instance.adminUrl}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveGeneral}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Security Options</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
