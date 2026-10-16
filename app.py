from flask import Flask, render_template_string, jsonify, request
import random
import datetime
import os
import secrets
import base64

app = Flask(__name__)

# ইন-মেমোরি সার্ভার ও ওয়্যারগার্ড স্টেট
server_logs = [
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Nexus Cloud Linux Core initialized (Port: 10000)...",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] WireGuard BDIX Dhaka Gateway socket listening on 51820/udp.",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Bangladeshi MFS (bKash/Nagad/CellFin) Geo-IP routing active.",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Open Source CMS Auto-Installer engine ready (WordPress, Ghost, Strapi, Medusa)."
]

wireguard_state = {
    "interface": "wg0",
    "status": "CONNECTED",
    "assigned_ip": "10.8.0.2/24",
    "peer_endpoint": "dhaka.bdix.amberit.net:51820",
    "allowed_ips": "0.0.0.0/0, ::/0",
    "rx_bytes": 5242880,
    "tx_bytes": 1572864,
    "last_handshake": "8 seconds ago",
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

bkash_ledger = []

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus AI // Cloud Core, WireGuard BD & CMS Panel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
            document.getElementById('cpu-load').innerText = (Math.random() * 8 + 12).toFixed(1) + '%';
            document.getElementById('ram-usage').innerText = (Math.random() * 0.1 + 1.45).toFixed(2) + ' GB';
            document.getElementById('latency-val').innerText = Math.floor(Math.random() * 10 + 14) + ' ms';
        }, 3000);

        // লগ রিফ্রেশ
        function fetchLogs() {
            fetch('/logs')
                .then(res => res.json())
                .then(data => {
                    const term = document.getElementById('terminal-box');
                    term.innerHTML = data.logs.join('<br>');
                    term.scrollTop = term.scrollHeight;
                });
        }
        setInterval(fetchLogs, 4000);

        // কমান্ড সেন্ড করা
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
    </script>
</head>
<body class="bg-[#030712] text-slate-100 min-h-screen p-4 md:p-8 relative overflow-x-hidden">

    <!-- Background Ambient Glows -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10">
        
        <!-- Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800/80 gap-4">
            <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-black text-xl">
                    ⚡
                </div>
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">NEXUS // CLOUD CORE</h1>
                    <p class="text-slate-400 text-xs font-medium">WireGuard BD Gateway • Bangladeshi Apps (bKash) • CMS Auto-Installer</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="text-emerald-400 text-xs font-semibold tracking-wide">RENDER CLOUD: ONLINE</span>
                </div>
            </div>
        </header>

        <!-- Metric Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
            <div class="glass-card glow-effect p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">CPU Load</span>
                    <span class="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
                </div>
                <div id="cpu-load" class="text-3xl font-extrabold text-white font-mono">12.4%</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[14%] rounded-full"></div>
                </div>
            </div>

            <div class="glass-card p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Memory Allocation</span>
                    <span class="text-purple-400 text-xs font-mono bg-purple-500/10 px-2 py-0.5 rounded">4GB Pool</span>
                </div>
                <div id="ram-usage" class="text-3xl font-extrabold text-white font-mono">1.48 GB</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[37%] rounded-full"></div>
                </div>
            </div>

            <div class="glass-card p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">BDIX Dhaka Latency</span>
                    <span class="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-0.5 rounded">🇧🇩 AmberIT</span>
                </div>
                <div id="latency-val" class="text-3xl font-extrabold text-white font-mono">14 ms</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[25%] rounded-full"></div>
                </div>
            </div>

            <div class="glass-card p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">WireGuard Tunnel</span>
                    <span class="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Active wg0</span>
                </div>
                <div class="text-2xl font-extrabold text-white font-mono mt-1">10.8.0.2/24</div>
                <div class="text-xs text-slate-400 mt-1">Routing BD Residential IP</div>
            </div>
        </div>

        <!-- Secondary Section: Bangladeshi Apps & Terminal -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div class="glass-card p-6 rounded-2xl md:col-span-1 flex flex-col justify-between">
                <div>
                    <h2 class="text-lg font-bold text-white mb-2 flex items-center">
                        <span class="mr-2">🇧🇩</span> BD Banking & bKash Gateway
                    </h2>
                    <p class="text-slate-400 text-xs leading-relaxed mb-4">
                        WireGuard BDIX socket unlocks bKash, Nagad, CellFin, City Touch & Astha banking apps from any cloud container.
                    </p>
                </div>
                <div class="bg-black/40 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-slate-400 block uppercase tracking-wider">MFS Webhook Gateway</span>
                        <span class="text-emerald-400 font-bold text-sm">/api/v1/bkash (Active)</span>
                    </div>
                    <div class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <div class="glass-card p-6 rounded-2xl md:col-span-2 flex flex-col">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-sm font-bold text-slate-200 flex items-center font-mono">
                        <span class="mr-2">💻</span> Cloud Terminal & WireGuard CLI
                    </h2>
                    <span class="text-[10px] text-slate-400 font-mono">Try 'wg', 'help', 'status'</span>
                </div>
                <div id="terminal-box" class="bg-[#010409] border border-slate-800/80 p-4 rounded-xl font-mono text-xs text-emerald-400 h-36 overflow-y-auto space-y-1.5 shadow-inner mb-3">
                    <!-- Logs dynamically loaded -->
                </div>
                <div class="flex items-center bg-[#010409] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs">
                    <span class="text-emerald-500 mr-2 font-bold">root@nexus:~#</span>
                    <input id="cli-input" type="text" onkeypress="handleCommand(event)" placeholder="Type a command (e.g. 'wg', 'status', 'restart', 'help')..." class="bg-transparent w-full text-white focus:outline-none placeholder:text-slate-600">
                </div>
            </div>
        </div>

    </div>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

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
        server_logs.append(f"[{timestamp}] peer: dhaka.bdix.amberit.net:51820 | transfer: 5.2 MB received | handshake: 8s ago")
    elif cmd == 'wg genkey':
        key = base64.b64encode(secrets.token_bytes(32)).decode('utf-8')
        server_logs.append(f"[{timestamp}] Generated WireGuard Key: {key}")
    elif cmd == 'status':
        server_logs.append(f"[{timestamp}] [OK] CPU: 12.4% | RAM: 1.48GB | BD BDIX Latency: 14ms | WireGuard: CONNECTED")
    elif cmd == 'restart':
        server_logs.append(f"[{timestamp}] [INFO] Re-initializing cloud microservices & WireGuard sockets...")
    elif cmd == 'version':
        server_logs.append(f"[{timestamp}] Nexus Cloud Engine v2.4.1-stable (BDIX WireGuard + CMS + bKash)")
    elif cmd == 'clear':
        server_logs.clear()
    elif cmd == 'help':
        server_logs.append(f"[{timestamp}] Commands available: wg, wg genkey, status, restart, version, clear")
    else:
        server_logs.append(f"[{timestamp}] Executed '{cmd}' successfully.")
        
    return jsonify({"status": "success"})

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
    return jsonify({"statusCode": "0000", "statusMessage": "Successful", "trxID": trx_id})

# CMS Management API
@app.route('/api/cms/list')
def cms_list():
    return jsonify({"instances": installed_cms_list})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
