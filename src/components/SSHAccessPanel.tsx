import React, { useState } from 'react';
import { Key, Download, Copy, Check, Shield, Trash2, Plus, Terminal, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SSHKey, SSHSession } from '../types.ts';
import { generateSSHKeyPair } from '../utils/sshCrypto.ts';

interface SSHAccessPanelProps {
  keys: SSHKey[];
  setKeys: React.Dispatch<React.SetStateAction<SSHKey[]>>;
  onAddLog: (msg: string) => void;
  serverIp: string;
}

export const SSHAccessPanel: React.FC<SSHAccessPanelProps> = ({
  keys,
  setKeys,
  onAddLog,
  serverIp,
}) => {
  const [keyType, setKeyType] = useState<'ED25519' | 'RSA_4096'>('ED25519');
  const [comment, setComment] = useState('root@nexus-cloud');
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestKey, setLatestKey] = useState<SSHKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedKeyName, setImportedKeyName] = useState('');
  const [importedPublicKey, setImportedPublicKey] = useState('');
  const [activeSessions] = useState<SSHSession[]>([
    {
      id: 'sess-1',
      username: 'root',
      remoteIp: '103.108.140.45 (BDIX Dhaka)',
      port: 22,
      keyType: 'ssh-ed25519',
      loginTime: '24 mins ago',
      state: 'ESTABLISHED',
    },
    {
      id: 'sess-2',
      username: 'deploy',
      remoteIp: '198.51.100.12 (Render Edge)',
      port: 22,
      keyType: 'ssh-rsa (4096)',
      loginTime: '1 hour ago',
      state: 'IDLE',
    },
  ]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadPrivateKey = (key: SSHKey) => {
    const filename = key.type === 'ED25519' ? 'id_ed25519' : 'id_rsa';
    const blob = new Blob([key.privateKey], { type: 'application/x-pem-file;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddLog(`[SSH ACCESS] Downloaded private key file '${filename}' for ${key.name}`);
  };

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    onAddLog(`[SSH ENGINE] Generating cryptographically secure ${keyType} keypair for ${comment}...`);

    try {
      const newKey = await generateSSHKeyPair(keyType, comment);
      setKeys((prev) => [newKey, ...prev]);
      setLatestKey(newKey);
      onAddLog(`[SSH ENGINE] Generated ${keyType} keypair. Fingerprint: ${newKey.fingerprint}`);
    } catch (e) {
      onAddLog(`[SSH ERROR] Failed to generate key: ${String(e)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAuthorize = (id: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, isAuthorized: !k.isAuthorized } : k
      )
    );
    const target = keys.find((k) => k.id === id);
    onAddLog(`[SSH ACCESS] Toggled authorization for key: ${target?.name} (Authorized: ${!target?.isAuthorized})`);
  };

  const handleDeleteKey = (id: string) => {
    const target = keys.find((k) => k.id === id);
    setKeys((prev) => prev.filter((k) => k.id !== id));
    if (latestKey?.id === id) setLatestKey(null);
    onAddLog(`[SSH ACCESS] Removed SSH key: ${target?.name} from authorized_keys`);
  };

  const handleImportKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importedPublicKey.trim()) return;

    const cleanPub = importedPublicKey.trim();
    const type = cleanPub.startsWith('ssh-ed25519') ? 'ED25519' : 'RSA_4096';
    const newKey: SSHKey = {
      id: `ssh-imported-${Date.now()}`,
      name: importedKeyName.trim() || `imported-${type.toLowerCase()}`,
      type,
      fingerprint: `SHA256:${Math.random().toString(36).slice(2, 12)}...`,
      publicKey: cleanPub,
      privateKey: '(Managed by client - external)',
      createdAt: 'Just now',
      comment: cleanPub.split(' ')[2] || 'user@external',
      isAuthorized: true,
    };

    setKeys((prev) => [newKey, ...prev]);
    onAddLog(`[SSH ACCESS] Imported public key '${newKey.name}' into ~/.ssh/authorized_keys`);
    setImportedKeyName('');
    setImportedPublicKey('');
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-2xl glow-effect">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-cyan-500/20">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  SSH Terminal Access &amp; Keypair Manager
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OPENSSH 9.6P1
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Generate and manage high-security ED25519 &amp; RSA-4096 cryptographic keypairs with 1-click private key download.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import Public Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column: Key Generator & SSH Quick Connect */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Box (Col 1-2) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Generate New Secure SSH Keypair</span>
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">RFC 8709 Compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-mono">Algorithm / Key Type:</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as 'ED25519' | 'RSA_4096')}
                className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ED25519">ED25519 (256-bit Edwards Curve - Recommended)</option>
                <option value="RSA_4096">RSA (4096-bit Prime Factorization)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono">Key Comment / Identity:</label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. user@nexus-cloud"
                className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <div className="text-[11px] text-slate-500 font-mono">
              Key format: OpenSSH standard format &bull; 0 plaintext exposure
            </div>
            <button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Crypto Keypair...' : 'Generate SSH Keypair'}</span>
            </button>
          </div>

          {/* Newly Generated Key Showcase */}
          {latestKey && (
            <div className="mt-4 p-4 bg-[#010409] border border-emerald-500/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Generated {latestKey.type} Keypair ({latestKey.name})
                  </span>
                </div>
                <button
                  onClick={() => downloadPrivateKey(latestKey)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Private Key</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>OpenSSH Public Key (Added to authorized_keys):</span>
                  <button
                    onClick={() => copyText(latestKey.publicKey, 'latest-pub')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'latest-pub' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'latest-pub' ? 'Copied' : 'Copy Public Key'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-emerald-400 break-all select-all">
                  {latestKey.publicKey}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300/90 bg-amber-950/40 border border-amber-800/40 p-2 rounded">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Security Notice: Set private key permissions before connecting: <code>chmod 600 id_{latestKey.type === 'ED25519' ? 'ed25519' : 'rsa'}</code></span>
              </div>
            </div>
          )}
        </div>

        {/* SSH Connection Helper (Col 3) */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Terminal Connection String</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Connect to your virtual Linux server or Render container using the generated private key.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#010409] p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">SSH Port 22 (Direct):</span>
                <div className="text-emerald-400 text-xs break-all select-all">
                  ssh -i id_ed25519 root@{serverIp}
                </div>
                <button
                  onClick={() => copyText(`ssh -i id_ed25519 root@${serverIp}`, 'ssh-cmd')}
                  className="mt-1 text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === 'ssh-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === 'ssh-cmd' ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>

              <div className="bg-[#010409] p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">Via WireGuard BD Mesh:</span>
                <div className="text-cyan-400 text-xs break-all select-all">
                  ssh -i id_ed25519 root@10.8.0.2
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">&bull; Password Auth:</span> Disabled<br />
            <span className="text-emerald-400 font-bold">&bull; Root Login:</span> Prohibit-Password (Key only)
          </div>
        </div>
      </div>

      {/* AUTHORIZED KEYS TABLE */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Authorized SSH Keys (~/.ssh/authorized_keys)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Only keys listed here can authenticate to the server terminal.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {keys.filter((k) => k.isAuthorized).length} Active Keys
          </span>
        </div>

        <div className="space-y-3">
          {keys.map((k) => (
            <div
              key={k.id}
              className="bg-[#010409] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{k.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300">
                    {k.type}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    k.isAuthorized
                      ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {k.isAuthorized ? 'AUTHORIZED' : 'REVOKED'}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  {k.publicKey}
                </div>
                <div className="text-slate-500 text-[10px]">
                  Fingerprint: {k.fingerprint} &bull; Created: {k.createdAt}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {k.privateKey && !k.privateKey.includes('external') && (
                  <button
                    onClick={() => downloadPrivateKey(k)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                    title="Download Private Key"
                    aria-label={`Download private key for ${k.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => copyText(k.publicKey, k.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                  title="Copy Public Key"
                  aria-label={`Copy public key for ${k.name}`}
                >
                  {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => toggleAuthorize(k.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    k.isAuthorized
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {k.isAuthorized ? 'Revoke' : 'Authorize'}
                </button>
                <button
                  onClick={() => handleDeleteKey(k.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                  title="Delete key"
                  aria-label={`Delete key ${k.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVE SSH SESSIONS */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Active SSH Daemon Sessions (sshd)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeSessions.map((sess) => (
            <div key={sess.id} className="bg-[#010409] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="text-white font-bold">{sess.username}@{sess.remoteIp}</div>
                <div className="text-slate-500 text-[10px]">Auth via {sess.keyType} &bull; Logged in {sess.loginTime}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {sess.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* IMPORT KEY MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleImportKey} className="glass-card max-w-lg w-full p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Import Existing Public Key</h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-mono">Key Name / Label:</label>
              <input
                type="text"
                value={importedKeyName}
                onChange={(e) => setImportedKeyName(e.target.value)}
                placeholder="e.g. macbook-pro-ed25519"
                className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 text-xs font-mono">OpenSSH Public Key String:</label>
              <textarea
                rows={4}
                value={importedPublicKey}
                onChange={(e) => setImportedPublicKey(e.target.value)}
                placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... user@host"
                className="w-full bg-[#010409] border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                Import to authorized_keys
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
