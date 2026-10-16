import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatUptime,
  clamp,
  formatBytes,
  executeTerminalCommand,
  simulateNextMetrics,
  createInitialLogs,
} from './metrics.ts';
import type { ServerNode, MetricSnapshot } from '../types.ts';

const mockNode: ServerNode = {
  id: 'node-render-01',
  name: 'AI Cloud Server Node-01',
  region: 'us-east (Render Free)',
  location: 'Oregon, USA',
  ip: '198.51.100.42',
  provider: 'Render Edge',
  port: 10000,
  status: 'ONLINE',
  uptimeSeconds: 90061, // 1d 1h 1m 1s
  os: 'Ubuntu 24.04 LTS Container',
  kernel: '6.6.137-cloud-amd64',
  cpuModel: 'AMD EPYC 7763 (Shared)',
  cpuCores: 2,
  totalRamGb: 4.0,
  totalDiskGb: 40.0,
};

const mockMetrics: MetricSnapshot = {
  cpuUsage: 14.2,
  cpuHistory: [12, 13, 14.2],
  ramUsedGb: 1.42,
  ramHistory: [1.4, 1.41, 1.42],
  diskUsedGb: 8.4,
  diskReadMb: 1.2,
  diskWriteMb: 0.8,
  networkInMbps: 4.2,
  networkOutMbps: 2.1,
  networkHistory: [{ in: 4.2, out: 2.1 }],
  loadAverage: [0.56, 0.48, 0.42],
  activeProcesses: 42,
  tcpConnections: 24,
  aiVoiceLatencyMs: 110,
  edgeLatencyMs: 38,
};

test('formatUptime formats seconds into human readable duration', () => {
  assert.equal(formatUptime(0), '0s');
  assert.equal(formatUptime(59), '59s');
  assert.equal(formatUptime(61), '1m 1s');
  assert.equal(formatUptime(3665), '1h 1m 5s');
  assert.equal(formatUptime(90061), '1d 1h 1m 1s');
});

test('clamp restricts numbers within bounds', () => {
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(7, 0, 10), 7);
});

test('formatBytes formats byte counts correctly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1048576), '1 MB');
  assert.equal(formatBytes(1073741824), '1 GB');
});

test('executeTerminalCommand handles status, help, and clear commands', () => {
  const helpResult = executeTerminalCommand('help', { node: mockNode, metrics: mockMetrics });
  assert.ok(helpResult.output.includes('Available Nexus Commands') || helpResult.output.includes('Commands'));

  const versionResult = executeTerminalCommand('version', { node: mockNode, metrics: mockMetrics });
  assert.ok(versionResult.output.includes('Nexus Cloud Engine'));

  const statusResult = executeTerminalCommand('status', { node: mockNode, metrics: mockMetrics });
  assert.ok(statusResult.output.includes('NODE STATUS REPORT'));
  assert.ok(statusResult.output.includes('0.0.0.0:10000'));

  const clearResult = executeTerminalCommand('clear', { node: mockNode, metrics: mockMetrics });
  assert.equal(clearResult.output, '__CLEAR__');

  const wgResult = executeTerminalCommand('wg show', { node: mockNode, metrics: mockMetrics });
  assert.ok(wgResult.output.includes('interface: wg0'));
  assert.ok(wgResult.output.includes('public key:'));

  const genkeyResult = executeTerminalCommand('wg genkey', { node: mockNode, metrics: mockMetrics });
  assert.ok(genkeyResult.output.includes('='));

  const restartResult = executeTerminalCommand('restart', { node: mockNode, metrics: mockMetrics });
  assert.ok(restartResult.output.length > 0);
});

test('simulateNextMetrics produces valid numbers and updates history arrays', () => {
  const next = simulateNextMetrics(mockMetrics, mockNode.totalRamGb, mockNode.totalDiskGb);
  assert.ok(next.cpuUsage >= 0 && next.cpuUsage <= 100);
  assert.ok(next.ramUsedGb > 0 && next.ramUsedGb <= mockNode.totalRamGb);
  assert.ok(next.cpuHistory.length > 0);
});

test('createInitialLogs returns expected initial seed items', () => {
  const logs = createInitialLogs();
  assert.ok(logs.length >= 5);
  assert.ok(logs.some((l) => l.message.includes('0.0.0.0:10000')));
});
