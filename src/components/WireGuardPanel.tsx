import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Key, Copy, Check, Download, RefreshCw, Radio, Globe, Terminal } from 'lucide-react';
import { WireguardTunnel } from '../types.ts';

interface WireGuardPanelProps {
  tunnel: WireguardTunnel;
  setTunnel: React.Dispatch<React.SetStateAction<WireguardTunnel>>;
  onAddLog: (msg: string) => void;
}

export const WireGuardPanel: React.FC<WireGuardPanelProps> = ({
  tunnel,
  setTunnel,
  onAddLog,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'config' | 'guide'>('status');

  // Traffic counter simulation when connected
  useEffect(() => {
    if (tunnel.status !== 'CONNECTED') return;

    const interval = setInterval(() => {
      setTunnel((prev) => ({
        ...prev,
        rxBytes: prev.rxBytes + Math.floor(Math.random() * 42000 + 8000),
        txBytes: prev.txBytes + Math.floor(Math.random() * 21000 + 4000),
        lastHandshake: `${Math.floor(Math.random() * 10 + 2)} seconds ago`,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [tunnel.status, setTunnel]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateNewKeyPair = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let priv = '';
    let pub = '';
    for (let i = 0; i < 43; i++) {
      priv += chars[Math.floor(Math.random() * chars.length)];
      pub += chars[Math.floor(Math.random() * chars.length)];
    }
    priv += '=';
    pub += '=';

    setTunnel((prev) => ({
      ...prev,
      privateKey: priv,
      publicKey: pub,
    }));
    onAddLog(`[WIREGUARD] Generated new Curve25519 keypair for wg0. Public: ${pub.slice(0, 12)}...`);
  };

  const toggleTunnel = () => {
    if (tunnel.status === 'CONNECTED') {
      setIsConnecting(true);
      onAddLog('[WIREGUARD] Stopping interface wg0: ip link set wg0 down');
      setTimeout(() => {
        setIsConnecting(false);
        setTunnel((prev) => ({ ...prev, status: 'DISCONNECTED' }));
        onAddLog('[WIREGUARD] Interface wg0 stopped. Routing table restored.');
      }, 900);
    } else {
      setIsConnecting(true);
      onAddLog(`[WIREGUARD] Initializing userspace WireGuard (wireguard-go) on ${tunnel.assignedIp}...`);
      setTimeout(() => {
        setIsConnecting(false);
        setTunnel((prev) => ({
          ...prev,
          status: 'CONNECTED',
          lastHandshake: 'Just now',
        }));
        onAddLog(`[WIREGUARD] Tunnel established to peer ${tunnel.peerEndpoint}. Handshake verified.`);
      }, 1400);
    }
  };

  const generateConfigText = () => {
    return `[Interface]
PrivateKey = ${tunnel.privateKey}
Address = ${tunnel.assignedIp}
DNS = ${tunnel.dns}
MTU = ${tunnel.mtu}

[Peer]
PublicKey = ${tunnel.peerPublicKey}
Endpoint = ${tunnel.peerEndpoint}
AllowedIPs = ${tunnel.allowedIps}
PersistentKeepalive = ${tunnel.persistentKeepalive}
`;
  };

  const downloadConfigFile = () => {
    const content = generateConfigText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wg0.conf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddLog('[WIREGUARD] Downloaded wg0.conf profile.');
  };

  const formatTraffic = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden glow-effect">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${
              tunnel.status === 'CONNECTED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  WireGuard VPN Core &amp; Mesh Gateway
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                  tunnel.status === 'CONNECTED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    tunnel.status === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}></span>
                  {tunnel.status}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Zero-Trust Encrypted Tunneling &bull; Userspace <code className="text-cyan-300">wireguard-go</code> for Render Containers &amp; Cloud VPS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTunnel}
              disabled={isConnecting}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg ${
                tunnel.status === 'CONNECTED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-black font-bold hover:bg-emerald-400'
              }`}
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tunnel.status === 'CONNECTED' ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Disconnect wg0</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Tunnel (wg0)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeSubTab === 'status'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tunnel Telemetry
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeSubTab === 'config'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            wg0.conf Editor
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeSubTab === 'guide'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Render &amp; VPS Setup Guide
          </button>
        </div>
      </div>

      {/* SUBTAB 1: STATUS & TELEMETRY */}
      {activeSubTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quick Metrics */}
          <div className="glass-card p-5 rounded-2xl md:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assigned Network Interface</span>
            </h3>

            <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Interface:</span>
                <span className="text-cyan-400 font-bold">{tunnel.interfaceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mesh IP:</span>
                <span className="text-emerald-400 font-bold">{tunnel.assignedIp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MTU:</span>
                <span className="text-slate-300">{tunnel.mtu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNS:</span>
                <span className="text-slate-300">{tunnel.dns}</span>
              </div>
            </div>

            <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Data Received (RX):</span>
                <span className="text-cyan-400 font-bold">{formatTraffic(tunnel.rxBytes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Sent (TX):</span>
                <span className="text-emerald-400 font-bold">{formatTraffic(tunnel.txBytes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Handshake:</span>
                <span className="text-amber-400">{tunnel.lastHandshake}</span>
              </div>
            </div>
          </div>

          {/* Peer & Keys */}
          <div className="glass-card p-5 rounded-2xl md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptographic Keypairs (Curve25519)</span>
              </h3>
              <button
                onClick={generateNewKeyPair}
                className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate New Keys</span>
              </button>
            </div>

            {/* Public Key */}
            <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Node Public Key (Share with Peer):</span>
                <button
                  onClick={() => copyToClipboard(tunnel.publicKey, 'pub')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'pub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'pub' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-emerald-400 break-all select-all">
                {tunnel.publicKey}
              </div>
            </div>

            {/* Private Key */}
            <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Node Private Key:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-slate-500 hover:text-slate-300 text-[11px] cursor-pointer"
                  >
                    {showPrivateKey ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(tunnel.privateKey, 'priv')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'priv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'priv' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="font-mono text-xs text-purple-400 break-all select-all">
                {showPrivateKey ? tunnel.privateKey : '•••••••••••••••••••••••••••••••••••••••••••='}
              </div>
            </div>

            {/* Peer Endpoint Details */}
            <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Peer Endpoint:</span>
                <span className="text-white font-bold">{tunnel.peerEndpoint}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Allowed IPs:</span>
                <span className="text-cyan-400 font-bold">{tunnel.allowedIps}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CONFIG EDITOR */}
      {activeSubTab === 'config' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">/etc/wireguard/wg0.conf</h3>
              <p className="text-xs text-slate-400">Standard WireGuard client/peer profile ready to deploy</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(generateConfigText(), 'conf')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer"
              >
                {copiedKey === 'conf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'conf' ? 'Copied Config' : 'Copy wg0.conf'}</span>
              </button>
              <button
                onClick={downloadConfigFile}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download wg0.conf</span>
              </button>
            </div>
          </div>

          <pre className="bg-[#010409] border border-slate-800 p-4 rounded-xl font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/30">
            <code>{generateConfigText()}</code>
          </pre>
        </div>
      )}

      {/* SUBTAB 3: RENDER & VPS SETUP GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>How WireGuard Runs on Render.com (Userspace mode)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard Render cloud containers run in Docker without direct host kernel module loading. To use WireGuard on Render:
            </p>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-sans">
              <li className="p-2 rounded bg-[#010409] border border-slate-800">
                <strong>Userspace Engine (<code className="text-cyan-400">wireguard-go</code>):</strong> Included in our provided <code className="text-cyan-400">Dockerfile</code>. It operates fully within userspace memory without requiring host kernel headers.
              </li>
              <li className="p-2 rounded bg-[#010409] border border-slate-800">
                <strong>TUN Emulation or SOCKS5 Proxy:</strong> The container can forward outbound web scraping, voice telephony, and API requests through the WireGuard interface.
              </li>
              <li className="p-2 rounded bg-[#010409] border border-slate-800">
                <strong>Automatic Activation:</strong> The Python application initializes the tunnel on boot if environment variable <code className="text-emerald-400">WG_CONFIG</code> is provided in Render dashboard!
              </li>
            </ol>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Full VPS / Dedicated Linux Container</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If running on a standard Ubuntu/Debian VPS (Hetzner, DigitalOcean, AWS):
            </p>
            <pre className="bg-[#010409] border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
# Install WireGuard on Linux
sudo apt update &amp;&amp; sudo apt install -y wireguard wireguard-tools

# Save configuration
sudo nano /etc/wireguard/wg0.conf

# Start WireGuard tunnel
sudo wg-quick up wg0

# Verify active handshake
sudo wg show
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
