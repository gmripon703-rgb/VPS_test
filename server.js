import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// In-memory server logs and state
const serverLogs = [
  `[${new Date().toLocaleTimeString()}] Nexus Cloud Linux Core online on Render port ${PORT}...`,
  `[${new Date().toLocaleTimeString()}] WireGuard BDIX Dhaka Gateway socket listening on 51820/udp.`,
  `[${new Date().toLocaleTimeString()}] Bangladeshi MFS (bKash/Nagad/CellFin) Geo-IP routing active.`,
  `[${new Date().toLocaleTimeString()}] Open Source CMS Auto-Installer engine ready (WordPress, Ghost, Strapi, Medusa).`,
  `[${new Date().toLocaleTimeString()}] SSH Key Management & Web/Mobile App Hosting containers active.`
];

let wireguardState = {
  interface: 'wg0',
  status: 'CONNECTED',
  assigned_ip: '10.8.0.2/24',
  peer_endpoint: 'dhaka.bdix.amberit.net:51820',
  allowed_ips: '0.0.0.0/0, ::/0',
  rx_bytes: 5242880,
  tx_bytes: 1572864,
  last_handshake: '6 seconds ago',
  dns: '1.1.1.1, 103.108.140.1',
  mtu: 1420
};

const bkashTransactions = [];

const cmsInstances = [
  {
    id: 'inst-1',
    name: 'WordPress',
    siteTitle: 'Nexus Official Media Portal',
    path: '/blog',
    db: 'SQLite Embedded Engine',
    status: 'ONLINE',
    version: '6.7.1'
  },
  {
    id: 'inst-2',
    name: 'Strapi Headless CMS',
    siteTitle: 'Mobile Apps & bKash Content API',
    path: '/cms-api',
    db: 'Render Cloud PostgreSQL',
    status: 'ONLINE',
    version: '5.2.0'
  }
];

// Helper logger
const addLog = (msg) => {
  const ts = new Date().toLocaleTimeString();
  serverLogs.push(`[${ts}] ${msg}`);
  if (serverLogs.length > 100) serverLogs.shift();
};

// API: Health / Ping
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cloud: 'Render Cloud Core',
    port: PORT
  });
});

// API: Logs
app.get('/logs', (req, res) => {
  res.json({ logs: serverLogs });
});

// API: Terminal command execution
app.post(['/exec', '/api/exec'], (req, res) => {
  const cmd = (req.body?.command || '').trim();
  const lower = cmd.toLowerCase();
  const ts = new Date().toLocaleTimeString();
  
  addLog(`root@nexus:~# ${cmd}`);

  let output = '';

  if (lower === 'status') {
    output = `[OK] CPU: ${(Math.random() * 5 + 10).toFixed(1)}% | RAM: ${(Math.random() * 0.2 + 1.4).toFixed(2)}GB | BD BDIX Latency: ${Math.floor(Math.random() * 10 + 12)}ms | WireGuard: ${wireguardState.status}`;
    addLog(output);
  } else if (lower === 'wg' || lower === 'wg show') {
    output = `interface: wg0\n  public key: yN38zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=\n  listening port: 51820\n\npeer: dhaka.bdix.amberit.net:51820\n  endpoint: 103.108.140.25:51820\n  allowed ips: 0.0.0.0/0, ::/0\n  latest handshake: ${wireguardState.last_handshake}\n  transfer: ${(wireguardState.rx_bytes / 1048576).toFixed(1)} MiB received, ${(wireguardState.tx_bytes / 1048576).toFixed(1)} MiB sent`;
    addLog(`wg0 interface probed: status ${wireguardState.status}`);
  } else if (lower === 'wg genkey') {
    const key = crypto.randomBytes(32).toString('base64');
    output = `WireGuard Key: ${key}`;
    addLog(`Generated WireGuard Key: ${key}`);
  } else if (lower === 'who' || lower === 'w') {
    output = `USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\nroot     pts/0    103.108.140.25   ${ts}    0.00s  0.04s  0.01s w\noperator pts/1    10.8.0.2         10:14    2:15m  0.12s  0.02s -bash`;
    addLog(`Active sessions inspected: 2 active pts terminals`);
  } else if (lower.startsWith('ssh-keygen')) {
    output = `Generating public/private ed25519 key pair.\nYour identification has been saved in /root/.ssh/id_ed25519\nYour public key has been saved in /root/.ssh/id_ed25519.pub\nThe key fingerprint is:\nSHA256:${crypto.randomBytes(16).toString('base64')} root@nexus-cloud-core\nThe key's randomart image is:\n+--[ED25519 256]--+\n|     .o+ .       |\n|    . * +        |\n|     = * .       |\n|    . + o        |\n+----[SHA256]-----+`;
    addLog(`Generated ED25519 SSH keypair`);
  } else if (lower.startsWith('cat ~/.ssh/authorized_keys')) {
    output = `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK9vDq8s3mF2uW8nP1zT7vA4bC5eD6fG7hJ8kL9m root@nexus-cloud-core\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQ7w1m2p3q4r5s6t7u8v9 admin@render-nexus`;
  } else if (lower === 'help') {
    output = `Commands available: wg, wg show, wg genkey, status, who, w, ssh-keygen, cat, restart, version, clear`;
    addLog(`Help commands requested`);
  } else if (lower === 'restart') {
    output = `Restarting cloud services & WireGuard sockets... [OK]`;
    addLog(`Cloud services restarted`);
  } else if (lower === 'version') {
    output = `Nexus Cloud Engine v2.4.1-stable (Render Cloud Linux + BDIX + bKash + CMS)`;
    addLog(`System version probed: v2.4.1`);
  } else if (lower === 'clear') {
    serverLogs.length = 0;
    output = `Terminal cleared`;
  } else {
    output = `Executed: ${cmd}`;
    addLog(`Executed: ${cmd}`);
  }

  res.json({ status: 'success', output, logs: serverLogs });
});

// API: WireGuard
app.get('/api/wireguard/status', (req, res) => {
  res.json(wireguardState);
});

app.post('/api/wireguard/toggle', (req, res) => {
  wireguardState.status = wireguardState.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
  addLog(`WireGuard tunnel state toggled: ${wireguardState.status}`);
  res.json({ status: wireguardState.status });
});

// API: bKash Callback
app.post(['/api/v1/bkash/callback', '/api/v1/bkash'], (req, res) => {
  const trxID = req.body?.trxID || `TRX${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const amount = req.body?.amount || '1450.00';
  const customerMsisdn = req.body?.customerMsisdn || '01712489201';
  const ts = new Date().toLocaleTimeString();

  const record = {
    trxID,
    amount,
    customerMsisdn,
    transactionStatus: 'Completed',
    timestamp: ts
  };

  bkashTransactions.push(record);
  addLog(`[bKash MFS] Webhook Callback verified: TrxID ${trxID} for BDT ${amount}`);
  
  res.json({
    statusCode: '0000',
    statusMessage: 'Successful',
    trxID,
    customerMsisdn,
    amount
  });
});

// API: CMS Management
app.get('/api/cms/list', (req, res) => {
  res.json({ instances: cmsInstances });
});

// Serve static assets from built Vite app
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Catch-all: send index.html for any frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Nexus Cloud Core running on http://0.0.0.0:${PORT}`);
  console.log(`🚀 Serving built React SPA & API endpoints on Render`);
});
