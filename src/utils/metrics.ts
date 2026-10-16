import type { MetricSnapshot, ServerNode, LogEntry, ServerStatus, LogLevel } from '../types.ts';

/**
 * Format uptime seconds into human readable duration (e.g. 3d 14h 22m 10s)
 */
export function formatUptime(seconds: number): string {
  if (seconds < 0) return '0s';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Format bytes or megabytes
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Generate simulated next telemetry metrics with realistic jitter and bounds
 */
export function simulateNextMetrics(
  prev: MetricSnapshot,
  totalRamGb: number,
  _totalDiskGb: number
): MetricSnapshot {
  // CPU variation between 8% and 65% normally with occasional spikes
  const cpuDelta = (Math.random() - 0.48) * 8;
  const nextCpu = parseFloat(clamp(prev.cpuUsage + cpuDelta, 6.5, 96.0).toFixed(1));

  // RAM variation around current value scaled by totalRamGb
  // For 512MB RAM (0.5GB), keep usage realistically between 110MB and 260MB (healthy for Node/Render)
  const isLowMem = totalRamGb <= 1.0;
  const ramMin = isLowMem ? 0.11 : 0.8;
  const ramMax = totalRamGb * 0.82;
  const ramDelta = isLowMem ? (Math.random() - 0.5) * 0.012 : (Math.random() - 0.5) * 0.08;
  const nextRam = parseFloat(
    clamp(prev.ramUsedGb + ramDelta, ramMin, ramMax).toFixed(isLowMem ? 3 : 2)
  );

  // Network I/O jitter
  const nextNetIn = parseFloat(
    clamp(prev.networkInMbps + (Math.random() - 0.48) * 4, 1.2, 85.0).toFixed(1)
  );
  const nextNetOut = parseFloat(
    clamp(prev.networkOutMbps + (Math.random() - 0.48) * 3, 0.8, 62.0).toFixed(1)
  );

  // AI Voice latency jitter
  const nextVoiceLat = Math.round(
    clamp(prev.aiVoiceLatencyMs + (Math.random() - 0.5) * 15, 65, 340)
  );

  // Keep last 25 datapoints for smooth charts
  const nextCpuHistory = [...prev.cpuHistory.slice(1), nextCpu];
  const nextRamHistory = [...prev.ramHistory.slice(1), nextRam];
  const nextNetHistory = [
    ...prev.networkHistory.slice(1),
    { in: nextNetIn, out: nextNetOut },
  ];

  const load1 = parseFloat((nextCpu / 25).toFixed(2));
  const load5 = parseFloat((load1 * 0.85 + Math.random() * 0.1).toFixed(2));
  const load15 = parseFloat((load5 * 0.9 + Math.random() * 0.05).toFixed(2));

  const nextEdgeLat = Math.round(clamp(32 + (Math.random() * 15), 25, 60));

  return {
    ...prev,
    cpuUsage: nextCpu,
    cpuHistory: nextCpuHistory,
    ramUsedGb: nextRam,
    ramHistory: nextRamHistory,
    networkInMbps: nextNetIn,
    networkOutMbps: nextNetOut,
    networkHistory: nextNetHistory,
    loadAverage: [load1, load5, load15],
    aiVoiceLatencyMs: nextVoiceLat,
    edgeLatencyMs: nextEdgeLat,
    diskReadMb: parseFloat((Math.random() * 2.5 + 0.1).toFixed(1)),
    diskWriteMb: parseFloat((Math.random() * 1.8 + 0.2).toFixed(1)),
    activeProcesses: Math.round(clamp(prev.activeProcesses + (Math.random() > 0.5 ? 1 : -1), 38, 54)),
    tcpConnections: Math.round(clamp(prev.tcpConnections + (Math.random() > 0.5 ? 2 : -2), 12, 120)),
  };
}

/**
 * Executes a simulated Linux terminal command and returns output
 */
export function executeTerminalCommand(
  rawCommand: string,
  context: { node: ServerNode; metrics: MetricSnapshot }
): { output: string; statusChange?: ServerStatus } {
  const trimmed = rawCommand.trim();
  const args = trimmed.split(/\s+/);
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case 'version':
      return {
        output: 'Nexus Cloud Engine v2.4.1-stable (Build: #2026-X86_64-RENDER with WireGuard userspace module)',
      };

    case 'wg':
    case 'wg show':
      return {
        output: `interface: wg0
  public key: yN38zK47Jk/e8Wb9U5Z6r8T1mP0qA2vB4cD5eF6gH7s=
  private key: (hidden)
  listening port: 51820

peer: 9kLmN8vR4xT1wQ2yP7aB3cD5eF6gH7s8J0kL1mN2oP3=
  endpoint: 198.51.100.120:51820
  allowed ips: 0.0.0.0/0, ::/0
  latest handshake: 14 seconds ago
  transfer: 4.82 MiB received, 1.24 MiB sent
  persistent keepalive: every 25 seconds`,
      };

    case 'wg genkey': {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let key = '';
      for (let i = 0; i < 43; i++) key += chars[Math.floor(Math.random() * chars.length)];
      key += '=';
      return {
        output: `${key}  (generated WireGuard Curve25519 private key)`,
      };
    }

    case 'wg-quick':
      return {
        output: `Usage: wg-quick [ up | down | strip ] [ CONFIG_FILE | INTERFACE ]
Examples:
  wg-quick up wg0
  wg-quick down wg0`,
      };

    case 'help':
      return {
        output: `Available Nexus Commands:
  • status        - Show node health, uptime, and resource usage
  • wg / wg show  - Display active WireGuard tunnel interface and peers
  • wg genkey     - Generate new WireGuard Curve25519 private key
  • wg-quick up   - Initialize WireGuard VPN tunnel (wg0)
  • version       - Display engine release version
  • top / htop    - List active running processes & CPU/RAM allocation
  • voice-test    - Simulate an AI voice inference pipeline ping
  • restart       - Re-initialize cloud microservices
  • clear         - Clear terminal screen
  • free -m       - Display physical and swap memory allocation
  • df -h         - Check disk partitions and NVMe storage usage
  • curl <url>    - Perform HTTP probe (e.g. curl http://0.0.0.0:10000)
  • ssh           - Display OpenSSH client usage and connection string
  • ssh-keygen    - Generate local OpenSSH ED25519 keypair
  • who / w       - List authenticated active SSH sessions
  • deploy        - Trigger Render / GitHub automated webhook build`,
      };

    case 'status':
      return {
        output: `NODE STATUS REPORT [${context.node.name}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:          ${context.node.status}
Host / Bind:     0.0.0.0:${context.node.port}
Provider:        ${context.node.provider} (${context.node.region})
Public IP:       ${context.node.ip}
Uptime:          ${formatUptime(context.node.uptimeSeconds)}
CPU Load:        ${context.metrics.cpuUsage}% (Cores: ${context.node.cpuCores})
RAM:             ${context.metrics.ramUsedGb} GB / ${context.node.totalRamGb} GB (${Math.round((context.metrics.ramUsedGb / context.node.totalRamGb) * 100)}%)
Disk Space:      ${context.metrics.diskUsedGb} GB / ${context.node.totalDiskGb} GB
Active TCP Conns:${context.metrics.tcpConnections}
Voice Latency:   ${context.metrics.aiVoiceLatencyMs} ms (Healthy)`,
      };

    case 'top':
    case 'htop':
      return {
        output: `PID   USER      PR  NI  VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 104  gunicorn  20   0  342M   84M    24M S  12.4   2.1   1:42.10 gunicorn: worker [flask]
 105  gunicorn  20   0  344M   86M    24M S  11.8   2.1   1:39.42 gunicorn: worker [flask]
  48  voice-ai  20   0  1.2G  410M    68M S   8.2  10.2   4:18.05 python3 worker_tts.py
   1  root      20   0   18M    4M     2M S   0.2   0.1   0:04.12 /sbin/init
  82  systemd   20   0   24M    6M     4M S   0.1   0.1   0:01.88 systemd-journald
 110  nginx     20   0   52M   12M     8M S   0.8   0.3   0:14.33 nginx: worker`,
      };

    case 'free':
    case 'free -m':
      return {
        output: `               total        used        free      shared  buff/cache   available
Mem:            4096        ${Math.round(context.metrics.ramUsedGb * 1024)}        ${Math.round((4 - context.metrics.ramUsedGb) * 1024)}         128         512        ${Math.round((4 - context.metrics.ramUsedGb + 0.4) * 1024)}
Swap:           2048          64        1984`,
      };

    case 'df':
    case 'df -h':
      return {
        output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p1   40G   ${context.metrics.diskUsedGb}G   ${context.node.totalDiskGb - context.metrics.diskUsedGb}G  ${Math.round((context.metrics.diskUsedGb / context.node.totalDiskGb) * 100)}% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
/dev/nvme0n1p2  512M   48M  464M  10% /boot/efi`,
      };

    case 'voice-test':
      return {
        output: `[VOICE-PIPELINE] Initiating synthetic audio pipeline benchmark...
[1/4] Connecting to local TTS worker on unix:///tmp/tts.sock... [CONNECTED]
[2/4] Dispatching 24-character test phoneme payload: "Node health optimal."
[3/4] Neural vocoder synthesis completed in ${context.metrics.aiVoiceLatencyMs}ms (24kHz 16-bit PCM).
[4/4] Stream buffer verified: 0 dropped packets, jitter 1.4ms.
>>> VOICE PIPELINE BENCHMARK: PASS (Status: EXCELLENT)`,
      };

    case 'reboot':
      return {
        output: `[SYSTEM] Broadcast message from root@${context.node.id}:
The system is going down for graceful reboot NOW!
Sending SIGTERM to gunicorn, nginx, and voice-worker...
Container restart in progress...`,
        statusChange: 'RESTARTING',
      };

    case 'clear':
      return {
        output: '__CLEAR__',
      };

    case 'uname':
    case 'uname -a':
      return {
        output: `${context.node.os} ${context.node.name} ${context.node.kernel} #1 SMP PREEMPT x86_64 GNU/Linux`,
      };

    case 'curl':
      return {
        output: `HTTP/1.1 200 OK
Server: gunicorn/21.2.0
Date: ${new Date().toUTCString()}
Content-Type: text/html; charset=utf-8
Content-Length: 2184
Connection: keep-alive

<!DOCTYPE html>
<html><head><title>AI Cloud Server & VPS Panel</title>...</html>`,
      };

    case 'ps':
    case 'ps aux':
      return {
        output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  22556  4120 ?        Ss   08:00   0:01 /sbin/init
root        88  0.0  0.2  45120  8210 ?        Ss   08:00   0:00 /usr/sbin/sshd -D
render     101  1.2  1.8 351200 74200 ?        S    08:00   1:10 python app.py
render     104  4.5  2.2 362400 88200 ?        S    08:00   2:45 /usr/local/bin/gunicorn app:app -b 0.0.0.0:10000`,
      };

    case 'ssh':
      return {
        output: `OpenSSH_9.6p1 Ubuntu-3ubuntu13, OpenSSL 3.0.13 30 Jan 2024
usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]
           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
           [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
           [-i identity_file] [-J [user@]host[:port]] [-L address]
           [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
           [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
           [-w local_tun[:remote_tun]] destination [command [argument ...]]
Quick Connect: ssh -i ~/.ssh/id_ed25519 root@${context.node.ip}`,
      };

    case 'ssh-keygen':
      return {
        output: `Generating public/private ed25519 key pair.
Your identification has been saved in ~/.ssh/id_ed25519
Your public key has been saved in ~/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:4X7mQ9wK8vL2jN5zP1rT0qA3vB6cD8eF2gH5s7J9kL0 root@nexus-cloud
The key's randomart image is:
+--[ED25519 256]--+
|      .o.        |
|     .o..        |
|    . .o o .     |
|     o..o =      |
|    . =.S=       |
|   . o.*+o+      |
|    o.o=Bo .     |
|   . ..++o       |
|    E.. o=       |
+----[SHA256]-----+`,
      };

    case 'who':
    case 'w':
      return {
        output: `USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
root     pts/0    103.108.140.45   08:14    0.00s  0.12s  0.02s w (BDIX WireGuard Dhaka)
deploy   pts/1    198.51.100.12    07:30    1:02m  0.45s  0.10s python3 worker.py`,
      };

    case 'cat':
      if (args[1]?.includes('authorized_keys') || trimmed.includes('.ssh/authorized_keys')) {
        return {
          output: `# ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIILjK9eY3wX1Z8qV2pT0mA4sB6cD8eF2gH5s7J9kL1mN root@nexus-cloud
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDF8kL2mX9wZ2vK4n5pQ7rT8uV1wX3yZ5aB7cD9eF1gH3s5LjK7eY9wX1Z3qV5pT7mA9sB1cD3eF5gH7s9J1kL3mN5oP7qR9sT1uV3wX5yZ7aB9cD1eF3gH5s7LjK9eY1wX3Z5qV7pT9mA1sB3cD5eF7gH9s1J3kL5mN7oP9qR1s== deploy@render-edge`,
        };
      }
      if (args[1]?.includes('wg0.conf') || trimmed.includes('wg0')) {
        return {
          output: `[Interface]
Address = 10.8.0.2/24
PrivateKey = (Protected in memory)
ListenPort = 51820
DNS = 1.1.1.1, 103.108.140.1

[Peer]
PublicKey = 9kLmN8vR4xT1wQ2yP7aB3cD5eF6gH7s8J0kL1mN2oP3=
Endpoint = dhaka.bdix.amberit.net:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`,
        };
      }
      if (args[1] === 'app.py' || !args[1]) {
        return {
          output: `# Flask Server app.py snippet:
from flask import Flask, render_template_string
app = Flask(__name__)

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)`,
        };
      }
      return {
        output: `cat: ${args[1]}: No such file or directory`,
      };

    case 'deploy':
      return {
        output: `[DEPLOY] Triggering Render Cloud Webhook deployment...
Fetching latest commit from main branch...
Running build: pip install -r requirements.txt... Done.
Starting gunicorn app:app on 0.0.0.0:10000...
New release v1.4.2 LIVE on edge network.`,
      };

    case '':
      return { output: '' };

    default:
      return {
        output: `bash: ${cmd}: command not found. Type 'help' for a list of simulated commands.`,
      };
  }
}

/**
 * Initial boot logs
 */
export function createInitialLogs(): LogEntry[] {
  return [
    {
      id: 'log-1',
      timestamp: '00:01:02',
      level: 'SYSTEM',
      service: 'kernel',
      message: 'System boot sequence initiated on Linux x86_64 container.',
    },
    {
      id: 'log-2',
      timestamp: '00:01:03',
      level: 'INFO',
      service: 'docker',
      message: 'Virtualization container cgroups allocated: 4.0 GB RAM, 2 vCPUs.',
    },
    {
      id: 'log-3',
      timestamp: '00:01:04',
      level: 'INFO',
      service: 'voice-ai',
      message: 'Loading neural voice synthesis checkpoint [Gemini-Voice-Fast]...',
    },
    {
      id: 'log-4',
      timestamp: '00:01:05',
      level: 'SUCCESS',
      service: 'network',
      message: 'Network interface bound to 0.0.0.0:10000 successfully.',
    },
    {
      id: 'log-5',
      timestamp: '00:01:06',
      level: 'SUCCESS',
      service: 'gunicorn',
      message: 'Listening at: http://0.0.0.0:10000 (PID: 104, Workers: 2)',
    },
    {
      id: 'log-6',
      timestamp: '00:01:08',
      level: 'INFO',
      service: 'voice-ai',
      message: 'Voice WebSocket channel opened. Audio streaming pipeline ready.',
    },
    {
      id: 'log-7',
      timestamp: '00:01:10',
      level: 'SUCCESS',
      service: 'render',
      message: 'Health check probe GET / -> 200 OK (latency: 12ms). Node is ONLINE.',
    },
  ];
}

const SAMPLE_LOG_MESSAGES = [
  { level: 'INFO', service: 'http', message: 'GET /api/v1/metrics -> 200 OK (4ms)' },
  { level: 'SUCCESS', service: 'voice-ai', message: 'Processed speech synthesis packet: 3.2s audio streamed' },
  { level: 'INFO', service: 'cron', message: 'Automated telemetry snapshot synced to persistent store' },
  { level: 'SUCCESS', service: 'network', message: 'TLS 1.3 handshake completed from edge CDN' },
  { level: 'INFO', service: 'gunicorn', message: 'Worker 104 handling keep-alive connection pool' },
  { level: 'INFO', service: 'system', message: 'Garbage collection completed: 18MB heap freed' },
  { level: 'WARN', service: 'voice-ai', message: 'Audio buffer jitter temporarily reached 18ms (auto-adjusted)' },
];

export function generateRandomLog(): LogEntry {
  const item = SAMPLE_LOG_MESSAGES[Math.floor(Math.random() * SAMPLE_LOG_MESSAGES.length)];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timeStr,
    level: item.level as LogLevel,
    service: item.service,
    message: item.message,
  };
}
