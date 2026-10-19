import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, LogOut } from 'lucide-react';
import { updateStoredCredentials, getStoredCredentials, clearActiveSession, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from '../utils/auth.ts';
import type { AdminAuthState } from '../types.ts';

interface AdminSecurityModalProps {
  session: AdminAuthState;
  onClose: () => void;
  onLogout: () => void;
  onAddLog: (msg: string) => void;
  onSessionUpdated: (session: AdminAuthState) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  session,
  onClose,
  onLogout,
  onAddLog,
  onSessionUpdated,
}) => {
  const [newUsername, setNewUsername] = useState(session.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('NEXUS-RECOVERY-9482-BDIX-7712');

  const activeCreds = getStoredCredentials();

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (currentPassword !== activeCreds.password) {
      setErrorMsg('Current password is incorrect. Please verify and try again.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    const updated = updateStoredCredentials(newUsername, newPassword);
    if (updated) {
      const updatedSession: AdminAuthState = {
        ...session,
        username: newUsername.trim(),
        adminEmail: `${newUsername.trim()}@nexus-cloud.local`,
      };
      onSessionUpdated(updatedSession);
      setSuccessMsg('Administrator credentials updated successfully!');
      onAddLog(`[SECURITY AUDIT] Master admin username updated to "${newUsername.trim()}". Password changed.`);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg('Failed to persist credentials to storage.');
    }
  };

  const handleResetToDefault = () => {
    updateStoredCredentials(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
    const updatedSession: AdminAuthState = {
      ...session,
      username: DEFAULT_ADMIN_USERNAME,
      adminEmail: `${DEFAULT_ADMIN_USERNAME}@nexus-cloud.local`,
    };
    onSessionUpdated(updatedSession);
    setNewUsername(DEFAULT_ADMIN_USERNAME);
    setSuccessMsg('Credentials reset to system default (admin / NexusCloud2026!#).');
    onAddLog('[SECURITY AUDIT] Master credentials reset to default factory values.');
  };

  const handleGenerateEmergencyKey = () => {
    const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `NEXUS-RECOVERY-${p1}-DHAKA-${p2}`;
    setEmergencyCode(key);
    onAddLog(`[SECURITY AUDIT] Generated new emergency root recovery token: ${key}`);
  };

  const copySessionToken = () => {
    navigator.clipboard.writeText(session.sessionToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card max-w-lg w-full p-6 sm:p-7 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Admin Security &amp; Credentials Center
              </h3>
              <p className="text-xs text-slate-400">Manage root authentication, password &amp; sessions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
            aria-label="Close Security Modal"
          >
            ✕
          </button>
        </div>

        {/* Active Session Info Box */}
        <div className="bg-[#010409] p-3.5 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Current Root User:</span>
            <span className="text-white font-bold">{session.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Authorization Level:</span>
            <span className="text-emerald-400 font-semibold">{session.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Session Initialized:</span>
            <span className="text-slate-300">{session.lastLogin}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-500">Session Token:</span>
            <button
              onClick={copySessionToken}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedToken ? 'Copied' : session.sessionToken.substring(0, 18) + '...'}</span>
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleUpdateCredentials} className="space-y-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Change Administrator Username &amp; Password</span>
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">New Administrator Username:</label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-sans focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-semibold">Current Secret Passphrase:</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password..."
              className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">New Passphrase:</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Confirm New Passphrase:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
            >
              Reset to Factory Default
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>

        {/* Emergency Access Key Box */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Offline Emergency Recovery Key</span>
            </span>
            <button
              type="button"
              onClick={handleGenerateEmergencyKey}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Regenerate</span>
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-300 font-mono text-xs flex justify-between items-center">
            <span>{emergencyCode}</span>
            <span className="text-[10px] text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded">VALID</span>
          </div>
        </div>

        {/* Logout / Lock Session */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock &amp; Sign Out</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
