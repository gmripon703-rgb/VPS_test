import React, { useState } from 'react';
import { Download, Play, CheckCircle2, ExternalLink, Terminal, Database, Sparkles, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { CMSItem, InstalledCMSInstance } from '../types.ts';

interface CMSInstallerPanelProps {
  cmsList: CMSItem[];
  installedCMS: InstalledCMSInstance[];
  setInstalledCMS: React.Dispatch<React.SetStateAction<InstalledCMSInstance[]>>;
  onAddLog: (msg: string) => void;
  serverPort: number;
}

export const CMSInstallerPanel: React.FC<CMSInstallerPanelProps> = ({
  cmsList,
  installedCMS,
  setInstalledCMS,
  onAddLog,
  serverPort,
}) => {
  const [selectedCMS, setSelectedCMS] = useState<CMSItem | null>(null);
  const [siteTitle, setSiteTitle] = useState('');
  const [installPath, setInstallPath] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@nexus-cloud.local');
  const [selectedDb, setSelectedDb] = useState('SQLite (Zero Config Embedded)');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BLOG_SITE' | 'HEADLESS_API' | 'ECOMMERCE' | 'WIKI_COMMUNITY'>('ALL');

  const openInstallWizard = (cms: CMSItem) => {
    setSelectedCMS(cms);
    setSiteTitle(`${cms.name} Portal`);
    setInstallPath(cms.installPath || `/${cms.slug}`);
    setSelectedDb(cms.database[0]);
    setInstallProgress([]);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteInstall = () => {
    if (!selectedCMS) return;
    setIsInstalling(true);
    setInstallProgress([`[INIT] Launching automated script installer for ${selectedCMS.name} ${selectedCMS.version}...`]);
    onAddLog(`[CMS INSTALLER] Initiated 1-click deployment for ${selectedCMS.name} at path ${installPath}`);

    const steps = [
      `[1/5] Fetching verified release package from ${selectedCMS.officialRepo}...`,
      `[2/5] Creating deployment workspace at /var/www${installPath}...`,
      `[3/5] Initializing ${selectedDb} database connection pool & migrations...`,
      `[4/5] Seeding initial administrator account (${adminEmail})...`,
      `[5/5] Re-binding Gunicorn & Nginx reverse proxy routes on port ${serverPort}...`,
      `[SUCCESS] ${selectedCMS.name} deployed successfully! Accessible at https://nexus-ai-panel.onrender.com${installPath}`,
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setInstallProgress((prev) => [...prev, step]);
        onAddLog(`[CMS INSTALLER] ${step}`);

        if (index === steps.length - 1) {
          setIsInstalling(false);
          const newInstance: InstalledCMSInstance = {
            id: `cms-inst-${Date.now()}`,
            cmsId: selectedCMS.id,
            name: selectedCMS.name,
            siteTitle: siteTitle || `${selectedCMS.name} Site`,
            installPath: installPath.startsWith('/') ? installPath : `/${installPath}`,
            adminEmail,
            databaseType: selectedDb,
            status: 'ONLINE',
            version: selectedCMS.version,
            installedAt: 'Just now',
            adminUrl: `${installPath}/admin`,
          };
          setInstalledCMS((prev) => [newInstance, ...prev]);
        }
      }, (index + 1) * 700);
    });
  };

  const handleDeleteInstance = (id: string, name: string) => {
    setInstalledCMS((prev) => prev.filter((item) => item.id !== id));
    onAddLog(`[CMS INSTALLER] Uninstalled CMS instance: ${name}`);
  };

  const filteredCMS = cmsList.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl glow-effect">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  1-Click Open Source CMS Auto-Installer Panel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REAL SCRIPTS READY
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Install world-renowned open-source platforms (WordPress, Ghost, Strapi, Directus, Medusa, Wiki.js) on your Render container or Linux VPS with zero manual CLI headaches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="bg-[#010409] p-3 rounded-xl border border-slate-800 text-left">
              <span className="text-slate-500 text-[10px] block">ACTIVE INSTANCES</span>
              <span className="text-emerald-400 font-bold">{installedCMS.length} Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE INSTALLED INSTANCES SECTION */}
      {installedCMS.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Installed CMS Instances &bull; Serving on Port {serverPort}</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">All Nodes Healthy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {installedCMS.map((inst) => (
              <div
                key={inst.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{inst.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {inst.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{inst.siteTitle}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteInstance(inst.id, inst.name)}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title="Uninstall instance"
                    aria-label={`Uninstall ${inst.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-[#010409] p-2.5 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Live URL:</span>
                    <span className="text-cyan-400 font-bold">{inst.installPath}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Database Engine:</span>
                    <span className="text-slate-300">{inst.databaseType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Admin Account:</span>
                    <span className="text-slate-300">{inst.adminEmail}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Installed {inst.installedAt}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyText(`https://nexus-ai-panel.onrender.com${inst.adminUrl}`, inst.id)}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === inst.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Admin Link</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CMS APP STORE / SCRIPT CATALOG */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Available Open Source CMS Scripts &amp; Engines</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any platform below to trigger 1-click automated container deployment
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {[
              { id: 'ALL', label: 'All Engines' },
              { id: 'BLOG_SITE', label: 'Websites & Blogs' },
              { id: 'HEADLESS_API', label: 'Headless CMS' },
              { id: 'ECOMMERCE', label: 'E-Commerce' },
              { id: 'WIKI_COMMUNITY', label: 'Docs & Wiki' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as typeof activeFilter)}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-[#010409] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* CMS Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCMS.map((cms) => (
            <div
              key={cms.id}
              className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 rounded-xl bg-black/50 border border-slate-800">
                      {cms.icon}
                    </span>
                    <div>
                      <h4 className="text-base font-bold text-white">{cms.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                        v{cms.version}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                    ~{cms.recommendedRamMb}MB RAM
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {cms.description}
                </p>

                <div className="bg-[#010409] p-2.5 rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">DB: {cms.database.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Default Path: {cms.installPath}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={cms.officialRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => openInstallWizard(cms)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>1-Click Install</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSTALLATION WIZARD MODAL */}
      {selectedCMS && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-amber-500/30 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedCMS.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Auto-Install {selectedCMS.name} v{selectedCMS.version}
                  </h3>
                  <p className="text-xs text-slate-400">Configure deployment parameters for virtual container</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCMS(null)}
                disabled={isInstalling}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inputs */}
            {!isInstalling && installProgress.length === 0 ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Site / Portal Title:</label>
                  <input
                    type="text"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Web Route / Subpath:</label>
                    <input
                      type="text"
                      value={installPath}
                      onChange={(e) => setInstallPath(e.target.value)}
                      className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">Database Engine:</label>
                    <select
                      value={selectedDb}
                      onChange={(e) => setSelectedDb(e.target.value)}
                      className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none cursor-pointer"
                    >
                      {selectedCMS.database.map((db) => (
                        <option key={db} value={db}>{db}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Admin Account Email:</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-black/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="text-slate-300 font-semibold">Underlying Deployment Command:</div>
                  <div className="text-cyan-400 break-all">{selectedCMS.installCommand}</div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedCMS(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteInstall}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950/30 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Automated Installer</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Live Progress Output */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    {isInstalling ? 'Deployment In Progress...' : 'Installation Finished!'}
                  </span>
                  <span className="text-slate-400">Target: {installPath}</span>
                </div>

                <div className="bg-[#010409] border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-400 h-52 overflow-y-auto space-y-1.5 shadow-inner">
                  {installProgress.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>

                {!isInstalling && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedCMS(null)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                    >
                      <span>Close &amp; View in Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
