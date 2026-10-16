import type { ServerNode, VoiceAgent, ScheduledTask, SSHKey } from '../types.ts';

export const INITIAL_NODES: ServerNode[] = [
  {
    id: 'node-render-512m',
    name: '⚡ Render Cloud Core (512MB)',
    region: 'singapore (Render Cloud)',
    location: 'Singapore / Oregon',
    ip: '198.51.100.42',
    provider: 'Render.com (512MB Free Tier)',
    port: 10000,
    status: 'ONLINE',
    uptimeSeconds: 242850,
    os: 'Linux Ubuntu (Render 512MB Free Tier)',
    kernel: '6.6.137-cloud-amd64',
    cpuModel: '0.1 Shared vCPU (Low Footprint)',
    cpuCores: 1,
    totalRamGb: 0.5,
    totalDiskGb: 10.0,
  },
  {
    id: 'node-bd-dhaka',
    name: '🇧🇩 Dhaka BDIX Core 02',
    region: 'bd-central (Dhaka IX)',
    location: 'Dhaka, Bangladesh',
    ip: '103.108.140.22',
    provider: 'AmberIT / BDIX Peering',
    port: 10000,
    status: 'ONLINE',
    uptimeSeconds: 142850,
    os: 'Ubuntu 24.04 LTS (WireGuard BD)',
    kernel: '6.6.137-cloud-amd64',
    cpuModel: 'AMD EPYC 7763 (BDIX Fiber)',
    cpuCores: 1,
    totalRamGb: 0.5,
    totalDiskGb: 10.0,
  },
  {
    id: 'node-vps-edge',
    name: 'Hetzner Micro VPS 03',
    region: 'eu-central (Frankfurt)',
    location: 'Germany',
    ip: '159.69.142.18',
    provider: 'Hetzner Cloud',
    port: 10000,
    status: 'ONLINE',
    uptimeSeconds: 842100,
    os: 'Debian 12 Bookworm (Micro)',
    kernel: '6.1.0-21-amd64',
    cpuModel: 'Intel Xeon Shared vCPU',
    cpuCores: 1,
    totalRamGb: 0.5,
    totalDiskGb: 10.0,
  },
];

export const INITIAL_BD_GEOIP = {
  ip: '103.108.140.22',
  country: 'Bangladesh',
  countryCode: 'BD',
  city: 'Dhaka',
  isp: 'AmberIT / BTCL National Internet Exchange (BDIX)',
  asn: 'AS58682',
  isBDIP: true,
  status: 'BYPASS_ACTIVE' as const,
};

export const INITIAL_WIREGUARD_TUNNEL = {
  interfaceName: 'wg0',
  status: 'CONNECTED' as const,
  assignedIp: '10.8.0.2/24',
  publicKey: 'yN38zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=',
  privateKey: '4N18zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=',
  peerEndpoint: 'dhaka.bdix.amberit.net:51820',
  peerPublicKey: '9kLmN8vR4xT1wQ2yP7aB3cD5eF6gH7s8J0kL1mN2oP3=',
  allowedIps: '0.0.0.0/0, ::/0',
  rxBytes: 5242880,
  txBytes: 1572864,
  lastHandshake: '8 seconds ago',
  dns: '1.1.1.1, 103.108.140.1',
  persistentKeepalive: 25,
  mtu: 1420,
  serverLocation: 'Dhaka, Bangladesh 🇧🇩',
  ispName: 'BDIX National Peering Gateway',
};

export const INITIAL_BD_APPS = [
  {
    id: 'app-bkash',
    name: 'bKash MFS & Merchant Gateway',
    category: 'MFS' as const,
    icon: '💳',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://tokenized.pay.bka.sh/v1.2.0-beta',
    latencyToDhakaMs: 14,
    requiresBDIP: true,
    sslPinningStatus: 'TLS 1.3 Bypassed via wg0 BD Tunnel',
  },
  {
    id: 'app-nagad',
    name: 'Nagad Postal Digital Banking',
    category: 'MFS' as const,
    icon: '📮',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://api.nagad.com.bd/api/dfs',
    latencyToDhakaMs: 16,
    requiresBDIP: true,
    sslPinningStatus: 'Active & Verified',
  },
  {
    id: 'app-cellfin',
    name: 'CellFin (Islami Bank IBBL)',
    category: 'BANK' as const,
    icon: '🏦',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://cellfin.islamibankbd.com/api',
    latencyToDhakaMs: 18,
    requiresBDIP: true,
    sslPinningStatus: 'BD Residential IP Routing',
  },
  {
    id: 'app-rocket',
    name: 'Rocket / DBBL NexusPay',
    category: 'MFS' as const,
    icon: '🚀',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://rocket.dutchbanglabank.com/api/v2',
    latencyToDhakaMs: 15,
    requiresBDIP: true,
    sslPinningStatus: 'Active Session Active',
  },
  {
    id: 'app-astha',
    name: 'BRAC Bank Astha App',
    category: 'BANK' as const,
    icon: '🏛️',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://astha.bracbank.com/api',
    latencyToDhakaMs: 19,
    requiresBDIP: true,
    sslPinningStatus: 'Encrypted via WireGuard',
  },
  {
    id: 'app-citytouch',
    name: 'City Touch (City Bank)',
    category: 'BANK' as const,
    icon: '🏙️',
    status: 'UNLOCKED' as const,
    gatewayUrl: 'https://citytouch.thecitybank.com',
    latencyToDhakaMs: 17,
    requiresBDIP: true,
    sslPinningStatus: 'BD IP Verified',
  },
];

export const INITIAL_HOSTED_APPS = [
  {
    id: 'host-1',
    name: 'bKash Auto-Payment Webhook Listener',
    type: 'MOBILE_API' as const,
    endpoint: '/api/v1/bkash/callback',
    framework: 'Python Flask + WireGuard BD Routing',
    status: 'RUNNING' as const,
    requests24h: 3840,
    lastDeployed: '10 mins ago',
  },
  {
    id: 'host-2',
    name: 'Mobile App Backend & Push Notification Hub',
    type: 'MOBILE_API' as const,
    endpoint: '/api/v1/mobile',
    framework: 'FastAPI / Node.js Microservice',
    status: 'RUNNING' as const,
    requests24h: 14210,
    lastDeployed: '1 hour ago',
  },
  {
    id: 'host-3',
    name: 'E-Commerce & Digital Services Web Portal',
    type: 'WEBSITE' as const,
    endpoint: '/sites/store',
    framework: 'React 19 + Tailwind CSS Web App',
    status: 'RUNNING' as const,
    requests24h: 6290,
    lastDeployed: '3 hours ago',
  },
  {
    id: 'host-4',
    name: 'BD WireGuard SOCKS5 / HTTP Proxy Gateway',
    type: 'MICROSERVICE' as const,
    endpoint: '0.0.0.0:1080 -> wg0 (Dhaka BDIX)',
    framework: 'wireguard-go + Privoxy',
    status: 'RUNNING' as const,
    requests24h: 28410,
    lastDeployed: '20 mins ago',
  },
];

export const AVAILABLE_CMS_SCRIPTS = [
  {
    id: 'cms-wordpress',
    name: 'WordPress',
    slug: 'wordpress',
    category: 'BLOG_SITE' as const,
    icon: '🌐',
    description: "World's most popular open-source CMS & blogging platform with full plugin ecosystem & SQLite/MySQL.",
    version: '6.7.1 (LTS)',
    database: ['SQLite', 'MySQL 8.0', 'MariaDB', 'Render Postgres (via PG4WP)'],
    recommendedRamMb: 512,
    officialRepo: 'https://github.com/WordPress/WordPress',
    isInstalled: true,
    installPath: '/blog',
    adminUrl: '/blog/wp-admin',
    installCommand: 'curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && ./wp-cli.phar core download --path=/var/www/blog',
  },
  {
    id: 'cms-ghost',
    name: 'Ghost CMS',
    slug: 'ghost',
    category: 'BLOG_SITE' as const,
    icon: '👻',
    description: 'High-performance Node.js publishing platform designed for modern creators, newsletters & media teams.',
    version: '5.98.0',
    database: ['SQLite3 (Default)', 'MySQL 8.0'],
    recommendedRamMb: 512,
    officialRepo: 'https://github.com/TryGhost/Ghost',
    isInstalled: false,
    installPath: '/journal',
    adminUrl: '/journal/ghost',
    installCommand: 'npm install -g ghost-cli@latest && ghost install --no-prompt --db=sqlite3 --dir=/var/www/ghost',
  },
  {
    id: 'cms-strapi',
    name: 'Strapi Headless CMS',
    slug: 'strapi',
    category: 'HEADLESS_API' as const,
    icon: '🚀',
    description: 'Top open-source Node.js headless CMS with auto-generated REST & GraphQL APIs for Mobile & Web apps.',
    version: '5.2.0',
    database: ['PostgreSQL (Render Cloud)', 'SQLite', 'MySQL'],
    recommendedRamMb: 1024,
    officialRepo: 'https://github.com/strapi/strapi',
    isInstalled: true,
    installPath: '/cms-api',
    adminUrl: '/cms-api/admin',
    installCommand: 'npx create-strapi-app@latest /app/strapi --quickstart --no-run',
  },
  {
    id: 'cms-directus',
    name: 'Directus',
    slug: 'directus',
    category: 'HEADLESS_API' as const,
    icon: '🐰',
    description: 'Instant REST & GraphQL API for any SQL database, with a dynamic, collaborative admin app.',
    version: '11.1.2',
    database: ['PostgreSQL', 'SQLite', 'MySQL', 'CockroachDB'],
    recommendedRamMb: 512,
    officialRepo: 'https://github.com/directus/directus',
    isInstalled: false,
    installPath: '/directus',
    adminUrl: '/directus/admin',
    installCommand: 'npx create-directus-project /app/directus --no-install',
  },
  {
    id: 'cms-medusa',
    name: 'Medusa.js E-Commerce',
    slug: 'medusa',
    category: 'ECOMMERCE' as const,
    icon: '🛍️',
    description: 'Open-source modular Headless commerce engine (Shopify alternative) with multi-currency & bKash support.',
    version: '2.1.0',
    database: ['PostgreSQL', 'Redis'],
    recommendedRamMb: 1024,
    officialRepo: 'https://github.com/medusajs/medusa',
    isInstalled: false,
    installPath: '/shop-core',
    adminUrl: '/shop-core/app',
    installCommand: 'npx create-medusa-app@latest /app/shop --skip-db',
  },
  {
    id: 'cms-wikijs',
    name: 'Wiki.js',
    slug: 'wikijs',
    category: 'WIKI_COMMUNITY' as const,
    icon: '📚',
    description: 'Extensible open-source wiki and documentation engine built on Node.js and Markdown.',
    version: '2.5.303',
    database: ['PostgreSQL', 'SQLite', 'MySQL'],
    recommendedRamMb: 512,
    officialRepo: 'https://github.com/Requarks/wiki',
    isInstalled: false,
    installPath: '/docs',
    adminUrl: '/docs/login',
    installCommand: 'curl -sS https://raw.githubusercontent.com/Requarks/wiki-install/master/install.sh | bash',
  },
];

export const INITIAL_INSTALLED_CMS = [
  {
    id: 'inst-1',
    cmsId: 'cms-wordpress',
    name: 'WordPress',
    siteTitle: 'Nexus Official Blog & Media Portal',
    installPath: '/blog',
    adminEmail: 'admin@nexus-cloud.local',
    databaseType: 'SQLite Embedded Engine',
    status: 'ONLINE' as const,
    version: '6.7.1',
    installedAt: '2 days ago',
    adminUrl: '/blog/wp-admin',
  },
  {
    id: 'inst-2',
    cmsId: 'cms-strapi',
    name: 'Strapi Headless CMS',
    siteTitle: 'Mobile Apps & bKash Content API',
    installPath: '/cms-api',
    adminEmail: 'developer@nexus-cloud.local',
    databaseType: 'Render PostgreSQL',
    status: 'ONLINE' as const,
    version: '5.2.0',
    installedAt: '5 hours ago',
    adminUrl: '/cms-api/admin',
  },
];

export const INITIAL_SSH_KEYS: SSHKey[] = [
  {
    id: 'ssh-key-ed25519-primary',
    name: 'id_ed25519-root',
    type: 'ED25519',
    fingerprint: 'SHA256:4X7mQ9wK8vL2jN5zP1rT0qA3vB6cD8eF2gH5s7J9kL0',
    publicKey: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIILjK9eY3wX1Z8qV2pT0mA4sB6cD8eF2gH5s7J9kL1mN root@nexus-cloud',
    privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCC4yvXmN8F9WfKl9qT0mA4sB6cD8eF2gH5s7J9kL1mNQAAAJB5i63OeY
ut7gAAAAtzc2gtZWQyNTUxOQAAACCC4yvXmN8F9WfKl9qT0mA4sB6cD8eF2gH5s7J9kL
1mNQAAAEC+sV95qQe1FhI9zJ8aW7eL4k2M0vP8rA5sD3eF1gH9s4LjK9eY3wX1Z8qV2p
T0mA4sB6cD8eF2gH5s7J9kL1mNQAAABEcm9vdEBuZXh1cy1jbG91ZAECAwQ=
-----END OPENSSH PRIVATE KEY-----
`,
    createdAt: 'Active (Provisioned on setup)',
    comment: 'root@nexus-cloud',
    isAuthorized: true,
    lastUsed: 'Just now (pts/0)',
  },
  {
    id: 'ssh-key-rsa-deploy',
    name: 'id_rsa-deploy',
    type: 'RSA_4096',
    fingerprint: 'SHA256:9aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB8',
    publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDF8kL2mX9wZ2vK4n5pQ7rT8uV1wX3yZ5aB7cD9eF1gH3s5LjK7eY9wX1Z3qV5pT7mA9sB1cD3eF5gH7s9J1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5s7LjK9eY1wX3Z5qV7pT9mA1sB3cD5eF7gH9s1J3kL5mN7oP9qR1s== deploy@render-edge',
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAxfJC9pm8Q4zV2kL1mN3oP5qR7sT9uV1wX2yZ4aB6cD8eF0gH
2s4LjK6eY8wX0Z2qV4pT6mA8sB0cD2eF4gH6s8J0kL2mN4oP6qR8sT0uV2wX4yZ6
aB8cD0eF2gH4s6LjK8eY0wX2Z4qV6pT8mA0sB2cD4eF6gH8s0J2kL4mN6oP8qR0s
-----END RSA PRIVATE KEY-----
`,
    createdAt: 'Yesterday',
    comment: 'deploy@render-edge',
    isAuthorized: true,
    lastUsed: '1 hour ago (CI/CD Deploy)',
  },
];

export const INITIAL_VOICE_AGENTS: VoiceAgent[] = [
  {
    id: 'agent-elevenlabs',
    name: 'ElevenLabs + Twilio SIP Agent',
    model: 'ElevenLabs Multilingual v2',
    language: 'English & Bengali (en-US / bn-BD)',
    status: 'STREAMING',
    totalRequests: 1420,
    avgLatencyMs: 98,
    confidence: 99.4,
  },
  {
    id: 'agent-gemini-live',
    name: 'Gemini Live Voice Worker',
    model: 'Gemini 2.5 Flash Audio Pipeline',
    language: 'Multilingual Real-time',
    status: 'IDLE',
    totalRequests: 890,
    avgLatencyMs: 112,
    confidence: 99.1,
  },
  {
    id: 'agent-whisper-stt',
    name: 'Whisper Telephony Transcriber',
    model: 'Whisper-large-v3-turbo',
    language: 'Global Telephony Stream',
    status: 'SYNTHESIZING',
    totalRequests: 3412,
    avgLatencyMs: 64,
    confidence: 99.8,
  },
];

export const INITIAL_TASKS: ScheduledTask[] = [
  {
    id: 'task-1',
    name: 'Cloud Telemetry Snapshot Sync',
    schedule: 'Every 5 minutes',
    description: 'Collects CPU, RAM, and voice latency metrics and persists to telemetry storage.',
    status: 'SUCCESS',
    lastRun: '2 mins ago',
    nextRun: 'in 3 mins',
  },
  {
    id: 'task-2',
    name: 'AI Voice Cache & Audio Buffer Purge',
    schedule: 'Every hour',
    description: 'Clears cached raw PCM audio streams older than 30 minutes to conserve memory.',
    status: 'IDLE',
    lastRun: '42 mins ago',
    nextRun: 'in 18 mins',
  },
  {
    id: 'task-3',
    name: 'Twilio Webhook Health Check',
    schedule: 'Every 15 minutes',
    description: 'Pings incoming SIP trunk endpoints to ensure 0ms webhook dropping.',
    status: 'SUCCESS',
    lastRun: '8 mins ago',
    nextRun: 'in 7 mins',
  },
  {
    id: 'task-4',
    name: 'Render Free Tier Keep-Alive Ping',
    schedule: 'Every 14 minutes',
    description: 'Sends simulated keep-alive heartbeat to prevent container idling.',
    status: 'SUCCESS',
    lastRun: '4 mins ago',
    nextRun: 'in 10 mins',
  },
];

export const PYTHON_APP_CODE = `from flask import Flask, render_template_string, jsonify, request
import random
import datetime

app = Flask(__name__)

# ইন-মেমোরি সার্ভার লগস
server_logs = [
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Neural Cloud Node initialized successfully...",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Secure Webhooks & ElevenLabs TTS pipeline online.",
    f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Listening for inbound SIM / SIP telemetry."
]

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexus AI // Cloud Core & Voice Engine</title>
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
            document.getElementById('latency-val').innerText = Math.floor(Math.random() * 15 + 32) + ' ms';
        }, 3000);

        // লগ রিংফ্রেশ
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
        
        <!-- Top Navigation / Header -->
        <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-800/80 gap-4">
            <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-black text-xl">
                    ⚡
                </div>
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">NEXUS // CLOUD CORE</h1>
                    <p class="text-slate-400 text-xs font-medium">Autonomous Telephony & AI Voice Node</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span class="text-emerald-400 text-xs font-semibold tracking-wide">RENDER CLOUD: ONLINE</span>
                </div>
            </div>
        </header>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            
            <!-- Metric 1 -->
            <div class="glass-card glow-effect p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">CPU Load</span>
                    <span class="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Optimal</span>
                </div>
                <div id="cpu-load" class="text-3xl font-extrabold text-white font-mono">14.2%</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[14%] rounded-full"></div>
                </div>
            </div>

            <!-- Metric 2 -->
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

            <!-- Metric 3 -->
            <div class="glass-card p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">Edge Latency</span>
                    <span class="text-cyan-400 text-xs font-mono bg-cyan-500/10 px-2 py-0.5 rounded">US-East</span>
                </div>
                <div id="latency-val" class="text-3xl font-extrabold text-white font-mono">38 ms</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[25%] rounded-full"></div>
                </div>
            </div>

            <!-- Metric 4 -->
            <div class="glass-card p-5 rounded-2xl">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Voice Model</span>
                    <span class="text-amber-400 text-xs font-mono bg-amber-500/10 px-2 py-0.5 rounded">Active</span>
                </div>
                <div class="text-2xl font-extrabold text-white font-mono mt-1">ElevenLabs v2</div>
                <div class="text-xs text-slate-400 mt-1">Custom Voice Cloning Synced</div>
            </div>

        </div>

        <!-- Secondary Section: AI Voice Telephony & Config -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            
            <div class="glass-card p-6 rounded-2xl md:col-span-1 flex flex-col justify-between">
                <div>
                    <h2 class="text-lg font-bold text-white mb-2 flex items-center">
                        <span class="mr-2">🎙️</span> Auto-Answer Agent
                    </h2>
                    <p class="text-slate-400 text-xs leading-relaxed mb-4">
                        Inbound SIP webhooks route calls automatically to LLM core with zero local device friction.
                    </p>
                </div>
                <div class="bg-black/40 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                        <span class="text-[10px] text-slate-400 block uppercase tracking-wider">Pipeline Status</span>
                        <span class="text-emerald-400 font-bold text-sm">Listening (Port 10000)</span>
                    </div>
                    <div class="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>

            <!-- Terminal / CLI Section -->
            <div class="glass-card p-6 rounded-2xl md:col-span-2 flex flex-col">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-sm font-bold text-slate-200 flex items-center font-mono">
                        <span class="mr-2">💻</span> Cloud Terminal & Telemetry
                    </h2>
                    <span class="text-[10px] text-slate-400 font-mono">Type 'help' for commands</span>
                </div>
                <div id="terminal-box" class="bg-[#010409] border border-slate-800/80 p-4 rounded-xl font-mono text-xs text-emerald-400 h-36 overflow-y-auto space-y-1.5 shadow-inner mb-3">
                    <!-- Logs dynamically loaded -->
                </div>
                <div class="flex items-center bg-[#010409] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs">
                    <span class="text-emerald-500 mr-2 font-bold">root@nexus:~#</span>
                    <input id="cli-input" type="text" onkeypress="handleCommand(event)" placeholder="Type a command (e.g. 'status', 'restart', 'help')..." class="bg-transparent w-full text-white focus:outline-none placeholder:text-slate-600">
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
    data = request.get_json()
    cmd = data.get('command', '').strip().lower()
    timestamp = datetime.datetime.now().strftime('%H:%M:%S')
    
    server_logs.append(f"[{timestamp}] root@nexus:~# {cmd}")
    
    if cmd == 'status':
        server_logs.append(f"[{timestamp}] [OK] CPU: 14.2% | RAM: 1.48GB | All systems nominal.")
    elif cmd == 'restart':
        server_logs.append(f"[{timestamp}] [INFO] Re-initializing cloud microservices...")
    elif cmd == 'help':
        server_logs.append(f"[{timestamp}] Commands available: status, restart, clear, version")
    elif cmd == 'clear':
        server_logs.clear()
    elif cmd == 'version':
        server_logs.append(f"[{timestamp}] Nexus Cloud Engine v2.4.1-stable")
    else:
        server_logs.append(f"[{timestamp}] Executed '{cmd}' successfully.")
        
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
`;

export const REQUIREMENTS_CODE = `flask==3.0.3
gunicorn==22.0.0
requests==2.31.0
`;

export const RENDER_YAML_CODE = `services:
  - type: web
    name: ai-cloud-server-dashboard
    env: python
    region: oregon
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app -b 0.0.0.0:10000
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.8
      - key: PORT
        value: 10000
`;

export const DOCKERFILE_CODE = `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

CMD ["gunicorn", "app:app", "-b", "0.0.0.0:10000", "--workers", "2", "--timeout", "120"]
`;
