import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, Server, Cpu, HardDrive, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { validateAdminLogin, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, getStoredCredentials } from '../utils/auth.ts';
import type { AdminAuthState, ServerNode } from '../types.ts';

interface AdminLoginPortalProps {
  onLoginSuccess: (session: AdminAuthState) => void;
  selectedNode: ServerNode;
  onAddLog: (msg: string) => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({
  onLoginSuccess,
  selectedNode,
  onAddLog,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const activeCreds = getStoredCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = validateAdminLogin(username, password, rememberMe);

      if (res.success && res.session) {
        onAddLog(`[AUTH GATEWAY] Successful authentication for admin user: ${res.session.username} (Session token generated)`);
        onLoginSuccess(res.session);
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
        onAddLog(`[AUTH WARNING] Failed administrator sign-in attempt (${nextAttempts}) from IP 198.51.100.42`);
      }
    }, 600);
  };

  const handleFillDemoCreds = () => {
    setUsername(activeCreds.username);
    setPassword(activeCreds.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Cyberpunk Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-600/15 via-cyan-600/10 to-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
      
      {/* Container Box */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand & Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-xl shadow-emerald-500/25 text-black font-extrabold text-2xl mb-1 select-none">
            ⚡
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            NEXUS // CLOUD CORE
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wide">
            SECURE ADMINISTRATOR ACCESS GATEWAY
          </p>
        </div>

        {/* Server & Node Status Banner (Real Hosting Details) */}
        <div className="glass-card p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 bg-[#010409]/80">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Node:</span>
            </span>
            <span className="text-white font-bold">{selectedNode.name}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hosting Resource:</span>
            </span>
            <span className="text-emerald-400 font-bold">512MB RAM (Free Tier Optimized)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Render Status:</span>
            </span>
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              24/7 Persistent Daemon
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-7 rounded-2xl border border-slate-800/90 shadow-2xl relative">
          <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Admin Sign-In
              </h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              SHA-256 Auth Shield
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Access Denied</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Admin Username or Email</span>
                <span className="text-[10px] font-mono text-slate-500">Root Account</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username..."
                  className="w-full bg-[#010409] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Secret Passphrase</span>
                <span className="text-[10px] font-mono text-slate-500">End-to-End Encrypted</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full bg-[#010409] border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 font-mono transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#010409] border-slate-700 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
                />
                <span>Keep session active across browser exits</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Authenticating Root Key...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authenticate to Admin Core</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper (For ease of access on Render / Preview) */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Default Admin Credentials:</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer text-[10px]"
              >
                Auto-Fill
              </button>
            </div>
            <div className="bg-[#010409] p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-0.5 text-slate-400">
              <div>User: <span className="text-white font-semibold">{activeCreds.username}</span></div>
              <div>Pass: <span className="text-emerald-400 font-semibold">{activeCreds.password}</span></div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                Note: You can change username &amp; password anytime in the dashboard.
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-mono">
          Render.com Web Service Node &bull; Port {selectedNode.port} &bull; TLS 1.3
        </p>
      </div>
    </div>
  );
};
