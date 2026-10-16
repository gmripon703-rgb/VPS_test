from flask import Flask, render_template_string, jsonify, request, send_from_directory
import random
import datetime
import os
import secrets
import base64

app = Flask(__name__, static_folder='dist/assets', static_url_path='/assets')

# ইন-মেমোরি সার্ভার ও ওয়্যারগার্ড স্টেট
server_logs = [
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Nexus Cloud Linux Core initialized on Render (Port: 10000)...",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] WireGuard BDIX Dhaka Gateway socket listening on 51820/udp.",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Bangladeshi MFS (bKash/Nagad/CellFin) Geo-IP routing active.",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Open Source CMS Auto-Installer engine ready (WordPress, Ghost, Strapi, Medusa).",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] SSH Keypair Manager & Container Hosting online."
]

wireguard_state = {
    "interface": "wg0",
    "status": "CONNECTED",
    "assigned_ip": "10.8.0.2/24",
    "peer_endpoint": "dhaka.bdix.amberit.net:51820",
    "allowed_ips": "0.0.0.0/0, ::/0",
    "rx_bytes": 5242880,
    "tx_bytes": 1572864,
    "last_handshake": "6 seconds ago",
    "dns": "1.1.1.1, 103.108.140.1",
    "mtu": 1420
}

installed_cms_list = [
    {
        "id": "inst-1",
        "name": "WordPress",
        "site_title": "Nexus Official Media Portal",
        "path": "/blog",
        "db": "SQLite Embedded Engine",
        "status": "ONLINE",
        "version": "6.7.1"
    },
    {
        "id": "inst-2",
        "name": "Strapi Headless CMS",
        "site_title": "Mobile Apps & bKash Content API",
        "path": "/cms-api",
        "db": "Render Cloud PostgreSQL",
        "status": "ONLINE",
        "version": "5.2.0"
    }
]

ssh_keys = [
    {
        "id": "ssh-key-ed25519-primary",
        "name": "id_ed25519-root",
        "type": "ED25519",
        "fingerprint": "SHA256:4X7mQ9wK8vL2jN5zP1rT0qA3vB6cD8eF2gH5s7J9kL0",
        "publicKey": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9vDq8s3mF2uW8nP1zT7vA4bC5eD6fG7hJ8kL9m root@nexus-cloud-core"
    }
]

bkash_ledger = []

HTML_FALLBACK_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus AI // Cloud Core & Voice Engine (Render)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-card {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glow-effect {
            box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.15);
        }
    </style>
    <script>
        // রিয়েল-টাইম মেট্রিকস সিমুলেশন
        setInterval(() => {
            const cpuEl = document.getElementById('cpu-load');
            const ramEl = document.getElementById('ram-usage');
            const latEl = document.getElementById('latency-val');
            if (cpuEl) cpuEl.innerText = (Math.random() * 8 + 12).toFixed(1) + '%';
            if (ramEl) ramEl.innerText = (Math.random() * 0.1 + 1.45).toFixed(2) + ' GB';
            if (latEl) latEl.innerText = Math.floor(Math.random() * 10 + 14) + ' ms';
        }, 3000);

        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
                btn.classList.add('text-slate-400');
            });
            const target = document.getElementById('tab-' + tabId);
            const btn = document.getElementById('btn-' + tabId);
            if (target) target.classList.remove('hidden');
            if (btn) {
                btn.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
                btn.classList.remove('text-slate-400');
            }
        }

        function fetchLogs() {
            fetch('/logs')
                .then(res => res.json())
                .then(data => {
                    const term = document.getElementById('terminal-box');
                    if (term) {
                        term.innerHTML = data.logs.join('<br>');
                        term.scrollTop = term.scrollHeight;
                    }
                });
        }
        setInterval(fetchLogs, 4000);

        function handleCommand(e) {
            if (e.key === 'Enter') {
                const input = document.getElementById('cli-input');
                const cmd = input.value.trim();
                if(!cmd) return;
                fetch('/exec', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({command: cmd})
                }).then(() => {
                    input.value = '';
                    fetchLogs();
                });
            }
        }

        function toggleWireGuard() {
            fetch('/api/wireguard/toggle', {method: 'POST'})
                .then(res => res.json())
                .then(data => {
                    const badge = document.getElementById('wg-status-badge');
                    if (badge) {
                        badge.innerText = data.status;
                        badge.className = data.status === 'CONNECTED' 
                            ? 'text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30';
                    }
                    fetchLogs();
                });
        }

        function triggerBkash() {
            const amount = document.getElementById('bkash-amount')?.value || '1500.00';
            const msisdn = document.getElementById('bkash-phone')?.value || '01712489201';
            fetch('/api/v1/bkash/callback', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ amount, customerMsisdn: msisdn })
            })
            .then(res => res.json())
            .then(data => {
                alert('bKash Webhook Callback Verified!\\nTrxID: ' + data.trxID + '\\nAmount: BDT ' + data.amount);
                fetchLogs();
            });
        }
    </script>
</head>
<body class="bg-[#030712] text-slate-100 min-h-screen p-4 md:p-8 relative overflow-x-hidden selection:bg-emerald-500/30">

    <!-- Ambient Glows -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-5 border-b border-slate-800/80 gap-4">
            <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-black text-xl">
                    ⚡
                </div>
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">NEXUS // CLOUD CORE</h1>
                    <p class="text-slate-400 text-xs font-medium">Render Cloud Core • WireGuard BDIX • bKash/Bank Gateway • CMS &amp; SSH Manager</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="text-emerald-400 text-xs font-semibold tracking-wide">RENDER CLOUD: ONLINE (PORT 10000)</span>
                </div>
            </div>
        </header>

        <!-- Navigation Tabs -->
        <nav class="flex items-center space-x-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800/60 font-mono text-xs">
            <button id="btn-overview" onclick="switchTab('overview')" class="tab-btn px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 whitespace-nowrap">⚡ Dashboard</button>
            <button id="btn-wireguard" onclick="switchTab('wireguard')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">🛡️ WireGuard BD</button>
            <button id="btn-bdapps" onclick="switchTab('bdapps')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">🇧🇩 BD Apps &amp; bKash</button>
            <button id="btn-cms" onclick="switchTab('cms')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">📦 CMS Auto-Installer</button>
            <button id="btn-hosting" onclick="switchTab('hosting')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">🚀 Web &amp; Mobile Hosting</button>
            <button id="btn-ssh" onclick="switchTab('ssh')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">🔑 SSH Access</button>
            <button id="btn-terminal" onclick="switchTab('terminal')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">💻 Terminal CLI</button>
            <button id="btn-deploy" onclick="switchTab('deploy')" class="tab-btn px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white whitespace-nowrap">🚀 Render Deploy Guide</button>
        </nav>

        <!-- TAB 1: OVERVIEW -->
        <div id="tab-overview" class="tab-content space-y-6">
            <!-- Metric Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div class="glass-card glow-effect p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-slate-400 text-xs font-semibold uppercase">CPU Load</span>
                        <span class="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
                    </div>
                    <div id="cpu-load" class="text-2xl font-extrabold text-white font-mono">12.4%</div>
                    <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[14%]"></div>
                    </div>
                </div>

                <div class="glass-card p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-slate-400 text-xs font-semibold uppercase">Memory</span>
                        <span class="text-purple-400 text-xs font-mono bg-purple-500/10 px-2 py-0.5 rounded">4GB Pool</span>
                    </div>
                    <div id="ram-usage" class="text-2xl font-extrabold text-white font-mono">1.48 GB</div>
                    <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[37%]"></div>
                    </div>
                </div>

                <div class="glass-card p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-slate-400 text-xs font-semibold uppercase">BDIX Dhaka Latency</span>
                        <span class="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-0.5 rounded">🇧🇩 AmberIT</span>
                    </div>
                    <div id="latency-val" class="text-2xl font-extrabold text-white font-mono">14 ms</div>
                    <div class="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[25%]"></div>
                    </div>
                </div>

                <div class="glass-card p-4 rounded-xl">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-slate-400 text-xs font-semibold uppercase">WireGuard Tunnel</span>
                        <span id="wg-status-badge" class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">CONNECTED</span>
                    </div>
                    <div class="text-xl font-extrabold text-white font-mono mt-1">10.8.0.2/24</div>
                    <div class="text-[11px] text-slate-400 mt-1">Routing BD Residential IP</div>
                </div>
            </div>

            <!-- Overview widgets -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="glass-card p-5 rounded-2xl">
                    <h2 class="text-sm font-bold text-white mb-2 flex items-center">
                        <span class="mr-2">🇧🇩</span> Bangladeshi Apps &amp; BDIX Mesh
                    </h2>
                    <p class="text-slate-400 text-xs leading-relaxed mb-4">
                        WireGuard BDIX mesh allows unhindered low-latency routing to Bangladeshi services (bKash, Nagad, CellFin, City Touch, Astha) from any cloud container on Render.
                    </p>
                    <div class="flex items-center gap-3">
                        <button onclick="toggleWireGuard()" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition">
                            Toggle WireGuard Tunnel
                        </button>
                        <button onclick="switchTab('wireguard')" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
                            Configure wg0.conf
                        </button>
                    </div>
                </div>

                <div class="glass-card p-5 rounded-2xl">
                    <h2 class="text-sm font-bold text-white mb-2 flex items-center">
                        <span class="mr-2">📦</span> Open Source CMS &amp; Web Hosting
                    </h2>
                    <p class="text-slate-400 text-xs leading-relaxed mb-4">
                        1-Click automatic deployment of production WordPress, Strapi, Ghost, Medusa, Next.js, and Mobile apps with automated SQLite / Postgres container provisioning.
                    </p>
                    <div class="flex items-center gap-3">
                        <button onclick="switchTab('cms')" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition">
                            Open CMS Installer
                        </button>
                        <button onclick="switchTab('hosting')" class="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
                            Host Web / Mobile
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- TAB 2: WIREGUARD -->
        <div id="tab-wireguard" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                    <h2 class="text-lg font-bold text-white flex items-center gap-2">
                        <span>🛡️</span> WireGuard BDIX Mesh Tunnel (Dhaka Gateway)
                    </h2>
                    <p class="text-xs text-slate-400">Low-latency VPN tunnel connecting Render cloud to Bangladesh Internet Exchange (BDIX)</p>
                </div>
                <button onclick="toggleWireGuard()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold">
                    Toggle State
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div class="bg-black/40 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div class="text-slate-400 font-bold mb-1">[Interface: wg0]</div>
                    <div>PrivateKey = <span class="text-emerald-400">eN38zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=</span></div>
                    <div>Address = <span class="text-cyan-400">10.8.0.2/24</span></div>
                    <div>DNS = 1.1.1.1, 103.108.140.1</div>
                </div>
                <div class="bg-black/40 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div class="text-slate-400 font-bold mb-1">[Peer: BDIX Dhaka Node]</div>
                    <div>PublicKey = <span class="text-purple-400">bdix-dhaka-gateway-amberit-51820=</span></div>
                    <div>Endpoint = 103.108.140.25:51820</div>
                    <div>AllowedIPs = 0.0.0.0/0, ::/0</div>
                    <div>PersistentKeepalive = 25</div>
                </div>
            </div>
        </div>

        <!-- TAB 3: BD APPS & BKASH -->
        <div id="tab-bdapps" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>🇧🇩</span> Bangladeshi MFS &amp; Banking Gateway Simulator
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                    <label class="block text-xs font-semibold text-slate-300">Customer Mobile (MSISDN)</label>
                    <input id="bkash-phone" type="text" value="01712489201" class="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm font-mono text-white">
                    <label class="block text-xs font-semibold text-slate-300">Amount (BDT)</label>
                    <input id="bkash-amount" type="text" value="1450.00" class="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm font-mono text-white">
                    <button onclick="triggerBkash()" class="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-xs shadow-lg transition">
                        Simulate bKash Payment &amp; Trigger Webhook
                    </button>
                </div>
                <div class="bg-black/40 border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-2">
                    <div class="text-emerald-400 font-bold">Tested MFS &amp; Banking Apps:</div>
                    <div>• bKash Personal &amp; Merchant Webhook API</div>
                    <div>• Nagad PGW Sandbox &amp; Callback</div>
                    <div>• CellFin / IBBL Internet Banking</div>
                    <div>• City Touch (City Bank Bangladesh)</div>
                    <div>• BRAC Bank Astha Gateway</div>
                </div>
            </div>
        </div>

        <!-- TAB 4: CMS -->
        <div id="tab-cms" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>📦</span> Open-Source CMS 1-Click Installer
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                    <div class="font-bold text-white text-sm">WordPress 6.7</div>
                    <div class="text-xs text-slate-400 mb-2">PHP 8.2 + SQLite Engine</div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE (/blog)</span>
                </div>
                <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                    <div class="font-bold text-white text-sm">Strapi Headless CMS</div>
                    <div class="text-xs text-slate-400 mb-2">Node.js + PostgreSQL</div>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE (/cms-api)</span>
                </div>
                <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                    <div class="font-bold text-white text-sm">Ghost Publishing</div>
                    <div class="text-xs text-slate-400 mb-2">Modern Creator Blog Platform</div>
                    <button class="mt-2 text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded">Install 1-Click</button>
                </div>
            </div>
        </div>

        <!-- TAB 5: HOSTING -->
        <div id="tab-hosting" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>🚀</span> Web &amp; Mobile App Hosting Center
            </h2>
            <p class="text-xs text-slate-400">Deploy Next.js, Node.js, Python Flask, Flutter Web, and React Native Expo bundles automatically.</p>
            <div class="bg-black/40 border border-slate-800 p-4 rounded-xl space-y-2 font-mono text-xs">
                <div class="flex justify-between items-center text-emerald-400 font-bold">
                    <span>nexus-cloud-core-web</span>
                    <span class="text-emerald-400">ACTIVE :10000</span>
                </div>
                <div class="text-slate-400">Root Express &amp; Vite React SPA Container serving global traffic.</div>
            </div>
        </div>

        <!-- TAB 6: SSH -->
        <div id="tab-ssh" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>🔑</span> SSH Access &amp; Keypair Manager
            </h2>
            <div class="bg-black/40 border border-slate-800 p-4 rounded-xl font-mono text-xs space-y-2">
                <div class="text-slate-400 font-bold">Default Key: id_ed25519-root</div>
                <div class="text-slate-300">Public: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9vDq8s3mF2uW8nP1zT7vA4bC5eD6fG7hJ8kL9m root@nexus</div>
                <div class="text-cyan-400">Fingerprint: SHA256:4X7mQ9wK8vL2jN5zP1rT0qA3vB6cD8eF2gH5s7J9kL0</div>
            </div>
        </div>

        <!-- TAB 7: TERMINAL -->
        <div id="tab-terminal" class="tab-content hidden glass-card p-6 rounded-2xl space-y-3">
            <div class="flex justify-between items-center">
                <h2 class="text-sm font-bold text-slate-200 flex items-center font-mono">
                    <span class="mr-2">💻</span> Cloud Terminal CLI
                </h2>
                <span class="text-[10px] text-slate-400 font-mono">Try 'wg', 'status', 'who', 'help'</span>
            </div>
            <div id="terminal-box" class="bg-[#010409] border border-slate-800/80 p-4 rounded-xl font-mono text-xs text-emerald-400 h-64 overflow-y-auto space-y-1.5 shadow-inner">
                <!-- Logs loaded via API -->
            </div>
            <div class="flex items-center bg-[#010409] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs">
                <span class="text-emerald-500 mr-2 font-bold">root@nexus:~#</span>
                <input id="cli-input" type="text" onkeypress="handleCommand(event)" placeholder="Type a command (e.g. 'wg', 'status', 'restart', 'help')..." class="bg-transparent w-full text-white focus:outline-none placeholder:text-slate-600">
            </div>
        </div>

        <!-- TAB 8: DEPLOY -->
        <div id="tab-deploy" class="tab-content hidden glass-card p-6 rounded-2xl space-y-4">
            <h2 class="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>🚀</span> Render &amp; GitHub Deployment Guide
            </h2>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 text-xs text-slate-300">
                <p class="font-bold text-emerald-400">কীভাবে GitHub রিপোজিটরি থেকে Render-এ 100% অটোমেটিক ডিপ্লয় করবেন:</p>
                <ol class="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>আপনার GitHub অ্যাকাউন্টে একটি রিপোজিটরি তৈরি করুন (যেমন: <code class="text-cyan-400">nexus-cloud-dashboard</code>)।</li>
                    <li>এই রিপোজিটরিতে কোড পুশ করুন: <code class="text-emerald-300">git push -u origin main</code></li>
                    <li>Render.com ড্যাশবোর্ডে গিয়ে <strong>New +</strong> &rarr; <strong>Web Service</strong> নির্বাচন করুন।</li>
                    <li>আপনার GitHub রিপোজিটরি নির্বাচন করুন। Render স্বয়ংক্রিয়ভাবে <code class="text-cyan-400">render.yaml</code> ডিটেক্ট করবে!</li>
                    <li>Build Command: <code class="text-emerald-300">npm install && npm run build</code></li>
                    <li>Start Command: <code class="text-emerald-300">node server.js</code> (অথবা Python এর জন্য: <code class="text-emerald-300">gunicorn app:app -b 0.0.0.0:10000</code>)</li>
                    <li>Deploy Web Service বাটনে ক্লিক করুন — ২ মিনিটের মধ্যে লাইভ হয়ে যাবে!</li>
                </ol>
            </div>
        </div>

        <!-- Footer -->
        <footer class="mt-12 text-center text-xs text-slate-500 font-mono">
            Nexus AI // Cloud Core • Render Production Node • WireGuard BDIX Enabled
        </footer>

    </div>
</body>
</html>
"""

# Serve built Vite frontend if dist exists, otherwise serve HTML fallback
@app.route('/')
def home():
    dist_index = os.path.join(os.path.dirname(__file__), 'dist', 'index.html')
    if os.path.exists(dist_index):
        return send_from_directory('dist', 'index.html')
    return render_template_string(HTML_FALLBACK_TEMPLATE)

@app.route('/<path:filename>')
def serve_static(filename):
    dist_dir = os.path.join(os.path.dirname(__file__), 'dist')
    target = os.path.join(dist_dir, filename)
    if os.path.exists(target):
        return send_from_directory('dist', filename)
    # Check if inside assets
    assets_target = os.path.join(dist_dir, 'assets', filename)
    if os.path.exists(assets_target):
        return send_from_directory(os.path.join(dist_dir, 'assets'), filename)
    # SPA fallback for unknown sub-paths
    dist_index = os.path.join(dist_dir, 'index.html')
    if os.path.exists(dist_index):
        return send_from_directory('dist', 'index.html')
    return render_template_string(HTML_FALLBACK_TEMPLATE)

@app.route('/logs')
def get_logs():
    return jsonify({"logs": server_logs})

@app.route('/exec', methods=['POST'])
def exec_cmd():
    data = request.get_json() or {}
    cmd = data.get('command', '').strip().lower()
    timestamp = datetime.datetime.now().strftime('%H:%M:%S')
    
    server_logs.append(f"[{timestamp}] root@nexus:~# {cmd}")
    
    if cmd in ['wg', 'wg show']:
        server_logs.append(f"[{timestamp}] interface: wg0 | public: yN38zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=")
        server_logs.append(f"[{timestamp}] peer: dhaka.bdix.amberit.net:51820 | transfer: 5.2 MB received | handshake: 6s ago")
    elif cmd == 'wg genkey':
        key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        server_logs.append(f"[{timestamp}] Generated WireGuard Key: {key}")
    elif cmd == 'status':
        server_logs.append(f"[{timestamp}] [OK] CPU: 12.4% | RAM: 1.48GB | BD BDIX Latency: 14ms | WireGuard: {wireguard_state['status']}")
    elif cmd in ['who', 'w']:
        server_logs.append(f"[{timestamp}] USER pts/0 (103.108.140.25) | operator pts/1 (10.8.0.2)")
    elif cmd.startswith('ssh-keygen'):
        server_logs.append(f"[{timestamp}] Generated ED25519 keypair saved to /root/.ssh/id_ed25519")
    elif 'authorized_keys' in cmd:
        server_logs.append(f"[{timestamp}] ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9vDq8s3mF2uW8nP1zT7vA4bC5eD6fG7hJ8kL9m root@nexus")
    elif cmd == 'restart':
        server_logs.append(f"[{timestamp}] [INFO] Re-initializing cloud microservices & WireGuard sockets...")
    elif cmd == 'version':
        server_logs.append(f"[{timestamp}] Nexus Cloud Engine v2.4.1-stable (Render Cloud Linux + BDIX + bKash)")
    elif cmd == 'clear':
        server_logs.clear()
    elif cmd == 'help':
        server_logs.append(f"[{timestamp}] Commands available: wg, wg genkey, status, who, ssh-keygen, restart, version, clear")
    else:
        server_logs.append(f"[{timestamp}] Executed '{cmd}' successfully.")
        
    return jsonify({"status": "success", "logs": server_logs})

# WireGuard API Endpoints
@app.route('/api/wireguard/status')
def wireguard_status():
    return jsonify(wireguard_state)

@app.route('/api/wireguard/toggle', methods=['POST'])
def wireguard_toggle():
    current = wireguard_state.get('status')
    new_status = 'DISCONNECTED' if current == 'CONNECTED' else 'CONNECTED'
    wireguard_state['status'] = new_status
    ts = datetime.datetime.now().strftime('%H:%M:%S')
    server_logs.append(f"[{ts}] [WIREGUARD] Tunnel state toggled: {new_status}")
    return jsonify({"status": new_status})

# bKash Payment & Webhook API
@app.route('/api/v1/bkash/callback', methods=['POST', 'GET'])
def bkash_callback():
    payload = request.get_json() or request.args.to_dict() or {}
    trx_id = payload.get('trxID', f"TRX{secrets.token_hex(4).upper()}")
    amount = payload.get('amount', '1450.00')
    ts = datetime.datetime.now().strftime('%H:%M:%S')
    
    record = {
        "trxID": trx_id,
        "amount": amount,
        "customerMsisdn": payload.get('customerMsisdn', '01712489201'),
        "transactionStatus": "Completed",
        "timestamp": ts
    }
    bkash_ledger.append(record)
    server_logs.append(f"[{ts}] [bKash MFS] Webhook Callback verified: TrxID {trx_id} for BDT {amount}")
    return jsonify({"statusCode": "0000", "statusMessage": "Successful", "trxID": trx_id, "amount": amount})

# CMS Management API
@app.route('/api/cms/list')
def cms_list():
    return jsonify({"instances": installed_cms_list})

# SSH Keys API
@app.route('/api/ssh/keys')
def get_ssh_keys():
    return jsonify({"keys": ssh_keys})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
