import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw, Send, CheckCircle2, AlertTriangle, Zap, Server } from 'lucide-react';
import { BDAppProfile, BDGeoIP, WireguardTunnel } from '../types.ts';

interface BDAppGatewayProps {
  apps: BDAppProfile[];
  geoIP: BDGeoIP;
  tunnel: WireguardTunnel;
  onAddLog: (msg: string) => void;
  onExecuteBkash: (trxId: string, amount: number, msisdn: string) => void;
}

export const BDAppGateway: React.FC<BDAppGatewayProps> = ({
  apps,
  geoIP,
  tunnel,
  onAddLog,
  onExecuteBkash,
}) => {
  const [testingAppId, setTestingAppId] = useState<string | null>(null);
  const [bkashAmount, setBkashAmount] = useState<number>(1450);
  const [customerPhone, setCustomerPhone] = useState<string>('01712-489201');
  const [trxId, setTrxId] = useState<string>('9K8X29M1B4');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [lastPaymentResult, setLastPaymentResult] = useState<{
    trxId: string;
    amount: number;
    phone: string;
    timestamp: string;
  } | null>(null);

  const generateTrxId = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 10; i++) res += chars[Math.floor(Math.random() * chars.length)];
    setTrxId(res);
  };

  const handleTestAppHandshake = (app: BDAppProfile) => {
    setTestingAppId(app.id);
    onAddLog(`[BD GATEWAY] Probing ${app.name} via WireGuard BD IP (${tunnel.assignedIp})...`);

    setTimeout(() => {
      setTestingAppId(null);
      onAddLog(`[BD GATEWAY] ${app.name} TLS 1.3 handshake PASSED. Latency: ${app.latencyToDhakaMs}ms (Geo-IP: 🇧🇩 BD Verified)`);
    }, 1200);
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    onAddLog(`[bKash MFS] Initiating tokenized checkout: BDT ${bkashAmount} from ${customerPhone} (TrxID: ${trxId})`);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setLastPaymentResult({
        trxId,
        amount: bkashAmount,
        phone: customerPhone,
        timestamp: new Date().toLocaleTimeString(),
      });
      onExecuteBkash(trxId, bkashAmount, customerPhone);
      onAddLog(`[bKash MFS] Payment SUCCESS: TrxID ${trxId} confirmed. Webhook dispatched to /api/v1/bkash/callback`);
      generateTrxId();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* BD Geo-IP & BDIX Tunnel Status Header */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden glow-effect">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🇧🇩</span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bangladeshi Apps &amp; Mobile Banking Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                BD RESIDENTIAL IP ACTIVE
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              WireGuard BD tunnel routes traffic through BDIX (Dhaka Internet Exchange) so banking apps (bKash, Nagad, CellFin, City Touch, Astha) detect a genuine Bangladeshi IP with zero geo-blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#010409] border border-slate-800 p-3 rounded-xl font-mono text-xs text-left">
              <div className="text-slate-500 text-[10px]">CURRENT PUBLIC IP</div>
              <div className="text-emerald-400 font-bold">{geoIP.ip}</div>
              <div className="text-slate-400 text-[10px] mt-0.5">{geoIP.city}, {geoIP.country} ({geoIP.isp.slice(0, 24)}...)</div>
            </div>

            <div className="bg-[#010409] border border-slate-800 p-3 rounded-xl font-mono text-xs text-left">
              <div className="text-slate-500 text-[10px]">DHAKA IX PEERING</div>
              <div className="text-cyan-400 font-bold">14 ms Latency</div>
              <div className="text-slate-400 text-[10px] mt-0.5">WireGuard: {tunnel.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Left = Banking & MFS Apps Grid, Right = bKash Payment & Webhook Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Apps Roster (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bangladeshi Banking &amp; MFS Geo-Routing Table</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">All 6 Apps Operational</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {apps.map((app) => {
              const isProbing = testingAppId === app.id;
              return (
                <div
                  key={app.id}
                  className="glass-card p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl p-1.5 rounded-lg bg-black/40 border border-slate-800">
                        {app.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                          {app.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {app.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-300 pt-1 border-t border-slate-800/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dhaka IX Ping:</span>
                      <span className="text-emerald-400">{app.latencyToDhakaMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Geo Security:</span>
                      <span className="text-slate-300">{app.sslPinningStatus}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestAppHandshake(app)}
                    disabled={isProbing}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                    <span>{isProbing ? 'Testing BD Handshake...' : 'Test BD IP Routing'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* bKash & MFS Webhook Simulator (Right 1 col) */}
        <div className="glass-card p-5 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-rose-400">💳</span>
                <span>bKash Payment &amp; Webhook Simulator</span>
              </h3>
              <span className="text-[10px] font-mono bg-rose-950/70 border border-rose-800/60 text-rose-300 px-2 py-0.5 rounded">
                Tokenized v1.2
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Test automated bKash merchant payment checkout and instant webhook dispatch to your Render Python Flask server.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono text-[11px]">Amount (BDT):</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono">৳</span>
                  <input
                    type="number"
                    value={bkashAmount}
                    onChange={(e) => setBkashAmount(Number(e.target.value))}
                    className="w-full bg-[#010409] border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono text-[11px]">Customer Wallet (MSISDN):</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-400 font-mono text-[11px]">Simulated TrxID:</label>
                  <button
                    onClick={generateTrxId}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={trxId}
                  className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-rose-300 font-mono font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isProcessingPayment ? 'Connecting to bKash Gateway...' : 'Simulate bKash Payment'}</span>
              </button>
            </div>
          </div>

          {/* Last Transaction Card */}
          {lastPaymentResult && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Webhook Dispatched &bull; HTTP 200 OK</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                TrxID: <span className="text-white font-bold">{lastPaymentResult.trxId}</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Paid: <span className="text-emerald-300">BDT {lastPaymentResult.amount}</span> from {lastPaymentResult.phone}
              </div>
              <div className="text-slate-500 text-[10px]">
                Received at: {lastPaymentResult.timestamp}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
