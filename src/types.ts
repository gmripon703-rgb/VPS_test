export type ServerStatus = 'ONLINE' | 'DEGRADED' | 'RESTARTING' | 'OFFLINE';

export interface ServerNode {
  id: string;
  name: string;
  region: string;
  location: string;
  ip: string;
  provider: string;
  port: number;
  status: ServerStatus;
  uptimeSeconds: number;
  os: string;
  kernel: string;
  cpuModel: string;
  cpuCores: number;
  totalRamGb: number;
  totalDiskGb: number;
}

export interface MetricSnapshot {
  cpuUsage: number;
  cpuHistory: number[];
  ramUsedGb: number;
  ramHistory: number[];
  diskUsedGb: number;
  diskReadMb: number;
  diskWriteMb: number;
  networkInMbps: number;
  networkOutMbps: number;
  networkHistory: { in: number; out: number }[];
  loadAverage: [number, number, number];
  activeProcesses: number;
  tcpConnections: number;
  aiVoiceLatencyMs: number;
  edgeLatencyMs: number;
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SYSTEM';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
}

export interface VoiceAgent {
  id: string;
  name: string;
  model: string;
  language: string;
  status: 'IDLE' | 'STREAMING' | 'SYNTHESIZING';
  totalRequests: number;
  avgLatencyMs: number;
  confidence: number;
}

export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'IDLE';
  lastRun: string;
  nextRun: string;
}

export interface WireguardTunnel {
  interfaceName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';
  assignedIp: string;
  publicKey: string;
  privateKey: string;
  peerEndpoint: string;
  peerPublicKey: string;
  allowedIps: string;
  rxBytes: number;
  txBytes: number;
  lastHandshake: string;
  dns: string;
  persistentKeepalive: number;
  mtu: number;
  serverLocation: string;
  ispName: string;
}

export interface BDAppProfile {
  id: string;
  name: string;
  category: 'MFS' | 'BANK' | 'TELECOM' | 'GOV';
  icon: string;
  status: 'UNLOCKED' | 'ROUTING_BD_IP' | 'CHECKING';
  gatewayUrl: string;
  latencyToDhakaMs: number;
  requiresBDIP: boolean;
  sslPinningStatus: string;
}

export interface HostedApp {
  id: string;
  name: string;
  type: 'WEBSITE' | 'WEB_APP' | 'MOBILE_API' | 'MICROSERVICE';
  endpoint: string;
  framework: string;
  status: 'RUNNING' | 'DEPLOYING' | 'PAUSED';
  requests24h: number;
  lastDeployed: string;
}

export interface BDGeoIP {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  asn: string;
  isBDIP: boolean;
  status: 'OPTIMAL' | 'BYPASS_ACTIVE' | 'NEEDS_BD_VPN';
}

export interface CMSItem {
  id: string;
  name: string;
  slug: string;
  category: 'BLOG_SITE' | 'HEADLESS_API' | 'ECOMMERCE' | 'WIKI_COMMUNITY';
  icon: string;
  description: string;
  version: string;
  database: string[];
  recommendedRamMb: number;
  officialRepo: string;
  isInstalled: boolean;
  installPath?: string;
  adminUrl?: string;
  installCommand: string;
}

export interface InstalledCMSInstance {
  id: string;
  cmsId: string;
  name: string;
  siteTitle: string;
  installPath: string;
  adminEmail: string;
  databaseType: string;
  status: 'ONLINE' | 'INSTALLING' | 'MAINTENANCE';
  version: string;
  installedAt: string;
  adminUrl: string;
}

export interface SSHKey {
  id: string;
  name: string;
  type: 'ED25519' | 'RSA_4096' | 'RSA_2048';
  fingerprint: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
  comment: string;
  isAuthorized: boolean;
  lastUsed?: string;
}

export interface SSHSession {
  id: string;
  username: string;
  remoteIp: string;
  port: number;
  keyType: string;
  loginTime: string;
  state: 'ESTABLISHED' | 'IDLE';
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tokensUsed?: number;
}
