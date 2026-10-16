import React, { useState } from 'react';
import { Globe, Smartphone, Server, Plus, Play, ExternalLink, Code2, Send, CheckCircle2, Copy, Check } from 'lucide-react';
import { HostedApp } from '../types.ts';

interface AppHostingCenterProps {
  hostedApps: HostedApp[];
  setHostedApps: React.Dispatch<React.SetStateAction<HostedApp[]>>;
  onAddLog: (msg: string) => void;
  serverPort: number;
}

export const AppHostingCenter: React.FC<AppHostingCenterProps> = ({
  hostedApps,
  setHostedApps,
  onAddLog,
  serverPort,
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'api-tester' | 'github-hook'>('apps');
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/mobile/health');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [newAppName, setNewAppName] = useState('');
  const [newAppType, setNewAppType] = useState<'WEBSITE' | 'MOBILE_API'>('MOBILE_API');

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleTestAPI = async () => {
    setIsTestingApi(true);
    onAddLog(`[HTTP INGRESS] ${testMethod} ${testEndpoint} HTTP/1.1 (Host: 0.0.0.0:${serverPort})`);

    // Simulated real API router response based on endpoint
    setTimeout(() => {
      setIsTestingApi(false);
      let payload: Record<string, unknown> = {};

      if (testEndpoint.includes('bkash')) {
        payload = {
          statusCode: '0000',
          statusMessage: 'bKash Webhook Gateway Ready',
          merchantId: 'MERCHANT_NEXUS_01',
          routing: 'WireGuard BD Dhaka IX',
          verifiedAt: new Date().toISOString(),
        };
      } else if (testEndpoint.includes('mobile')) {
        payload = {
          status: 'ONLINE',
          appVersion: '3.4.0-release',
          pushNotifications: 'FCM / APNs Active',
          mobileClientsConnected: 184,
          timestamp: new Date().toISOString(),
        };
      } else {
        payload = {
          success: true,
          message: 'Virtual Linux Worker executed HTTP route',
          uptime: '142850s',
          runtime: 'Python 3.11 / Flask on Render',
        };
      }

      const resString = JSON.stringify(payload, null, 2);
      setApiResponse(resString);
      onAddLog(`[HTTP EGRESS] 200 OK (Content-Type: application/json, Content-Length: ${resString.length})`);
    }, 800);
  };

  const handleDeployNewApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: HostedApp = {
      id: `app-${Date.now()}`,
      name: newAppName,
      type: newAppType,
      endpoint: newAppType === 'WEBSITE' ? `/sites/${newAppName.toLowerCase().replace(/\s+/g, '-')}` : `/api/v1/${newAppName.toLowerCase().replace(/\s+/g, '-')}`,
      framework: newAppType === 'WEBSITE' ? 'HTML5 / React Static Build' : 'REST API / JSON Microservice',
      status: 'RUNNING',
      requests24h: 1,
      lastDeployed: 'Just now',
    };

    setHostedApps((prev) => [newApp, ...prev]);
    onAddLog(`[VIRTUAL HOST] Deployed new ${newAppType}: "${newAppName}" to route ${newApp.endpoint}`);
    setNewAppName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl glow-effect">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-cyan-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Virtual Linux Cloud Hosting &amp; Mobile API Server
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MULTI-APP HOST
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Host static websites, Flutter/Android mobile app backends, and bKash webhook microservices on a single Render instance.
              </p>
            </div>
          </div>

          <div className="flex space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <button
              onClick={() => setActiveTab('apps')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                activeTab === 'apps'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hosted Services ({hostedApps.length})
            </button>
            <button
              onClick={() => setActiveTab('api-tester')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                activeTab === 'api-tester'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live API Tester
            </button>
            <button
              onClick={() => setActiveTab('github-hook')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                activeTab === 'github-hook'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              GitHub Webhook
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: HOSTED SERVICES */}
      {activeTab === 'apps' && (
        <div className="space-y-6">
          {/* Quick Deploy Form */}
          <form
            onSubmit={handleDeployNewApp}
            className="glass-card p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              placeholder="Deploy new website or mobile API (e.g., 'Customer Support Portal')..."
              className="flex-1 bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 w-full"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={newAppType}
                onChange={(e) => setNewAppType(e.target.value as 'WEBSITE' | 'MOBILE_API')}
                className="bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none cursor-pointer"
                aria-label="New Application Type"
              >
                <option value="MOBILE_API">Mobile App API</option>
                <option value="WEBSITE">Static Website</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deploy Route</span>
              </button>
            </div>
          </form>

          {/* List of Apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostedApps.map((app) => (
              <div
                key={app.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-slate-800 text-cyan-400">
                      {app.type === 'WEBSITE' ? <Globe className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{app.name}</h3>
                      <span className="text-[10px] font-mono text-purple-400">{app.framework}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {app.status}
                  </span>
                </div>

                <div className="bg-[#010409] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">{app.endpoint}</span>
                  <button
                    onClick={() => copyText(`https://nexus-ai-panel.onrender.com${app.endpoint}`, app.id)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedUrl === app.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl === app.id ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>24h Ingress: {app.requests24h} reqs</span>
                  <span className="text-slate-300">Active on Port {serverPort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE API TESTER */}
      {activeTab === 'api-tester' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Interactive Live Ingress Tester</h3>
              <p className="text-xs text-slate-400">Send test HTTP requests to verify routing and WireGuard BD forwarding</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTestEndpoint('/api/v1/bkash/callback')}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-rose-300 hover:bg-slate-800 cursor-pointer"
              >
                bKash Webhook
              </button>
              <button
                onClick={() => setTestEndpoint('/api/v1/mobile/health')}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-cyan-300 hover:bg-slate-800 cursor-pointer"
              >
                Mobile API
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value as 'GET' | 'POST')}
              className="bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none cursor-pointer"
              aria-label="HTTP Method"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="flex-1 bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleTestAPI}
              disabled={isTestingApi}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingApi ? 'Dispatching...' : 'Send Request'}</span>
            </button>
          </div>

          {apiResponse && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400">Response Payload (HTTP 200 OK):</span>
              <pre className="bg-[#010409] border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{apiResponse}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GITHUB WEBHOOK AUTO-DEPLOY */}
      {activeTab === 'github-hook' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              GitHub Zero-Click Automatic Deployment
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            When you push code or commits to your GitHub repository (main branch), Render automatically pulls, builds, and launches the updated server with zero downtime.
          </p>

          <div className="bg-[#010409] p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div>
              <span className="text-slate-500 block mb-1">GitHub Webhook Payload URL:</span>
              <div className="flex items-center justify-between bg-black/60 p-2.5 rounded border border-slate-800 text-cyan-300 select-all">
                <span>https://api.render.com/deploy/srv-nexus2026?key=autoDeploySecureHook</span>
                <button
                  onClick={() => copyText('https://api.render.com/deploy/srv-nexus2026?key=autoDeploySecureHook', 'gh-hook')}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  {copiedUrl === 'gh-hook' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block">Content type:</span>
                <span className="text-slate-200">application/json</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trigger Events:</span>
                <span className="text-emerald-400">Just the push event (main branch)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
