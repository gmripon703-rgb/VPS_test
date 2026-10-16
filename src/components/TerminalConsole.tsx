import React, { useState, useRef, useEffect } from 'react';
import { LogEntry, ServerNode, MetricSnapshot } from '../types.ts';
import { Copy, Trash2, Pause, Play, Check } from 'lucide-react';
import { executeTerminalCommand } from '../utils/metrics.ts';

interface TerminalConsoleProps {
  logs: LogEntry[];
  node: ServerNode;
  metrics: MetricSnapshot;
  onClearLogs: () => void;
  onAddLog: (entry: LogEntry) => void;
  onRestart: () => void;
  soundEnabled: boolean;
  expandedHeight?: boolean;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  node,
  metrics,
  onClearLogs,
  onAddLog,
  onRestart,
  soundEnabled,
  expandedHeight = false,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const playTerminalBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.07);
    } catch {
      // Ignore audio errors
    }
  };

  const handleExecute = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    playTerminalBeep();
    const timestamp = new Date().toTimeString().split(' ')[0];

    // Log the command under root@nexus:~#
    onAddLog({
      id: `cmd-${Date.now()}`,
      timestamp,
      level: 'SYSTEM',
      service: 'cli',
      message: `root@nexus:~# ${trimmed}`,
    });

    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInputVal('');

    const lower = trimmed.toLowerCase();
    if (lower === 'restart' || lower === 'reboot') {
      onRestart();
      return;
    }

    if (lower === 'clear') {
      onClearLogs();
      return;
    }

    const result = executeTerminalCommand(trimmed, { node, metrics });
    if (result.output && result.output !== '__CLEAR__') {
      const lines = result.output.split('\n');
      lines.forEach((line) => {
        onAddLog({
          id: `out-${Date.now()}-${Math.random()}`,
          timestamp,
          level: line.includes('ERROR') || line.includes('not found') ? 'ERROR' : 'INFO',
          service: 'core',
          message: line,
        });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecute(inputVal);
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputVal('');
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(commandHistory[nextIdx]);
        }
      }
    }
  };

  const copyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickCommands = ['status', 'version', 'help', 'restart', 'voice-test', 'clear'];

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between transition-all duration-300">
      {/* Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center font-mono">
            <span className="mr-2">💻</span> Cloud Terminal &amp; Telemetry
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Type &apos;help&apos; for commands
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume logs' : 'Pause logs'}
              aria-label={isPaused ? 'Resume logs' : 'Pause logs'}
              className="p-1 rounded bg-[#010409] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              onClick={copyLogs}
              title="Copy output"
              aria-label="Copy output"
              className="p-1 rounded bg-[#010409] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              onClick={onClearLogs}
              title="Clear terminal"
              aria-label="Clear terminal"
              className="p-1 rounded bg-[#010409] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Command pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 font-mono text-[11px]">
          <span className="text-slate-500 text-[10px]">Pills:</span>
          {quickCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleExecute(cmd)}
              className="px-2 py-0.5 rounded-md bg-[#010409] hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer text-[10px]"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Terminal Box (Exact ID id="terminal-box" with #010409 background and text-emerald-400) */}
        <div
          id="terminal-box"
          ref={terminalRef}
          role="log"
          aria-live="polite"
          className={`bg-[#010409] border border-slate-800/80 p-4 rounded-xl font-mono text-xs text-emerald-400 ${
            expandedHeight ? 'h-80 sm:h-96' : 'h-40 sm:h-48'
          } overflow-y-auto space-y-1.5 shadow-inner mb-3 leading-relaxed`}
        >
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-2">
              Terminal buffer cleared. Ready for input.
            </div>
          ) : (
            logs.map((log) => {
              let textClass = 'text-emerald-400';
              if (log.level === 'WARN') textClass = 'text-amber-300';
              if (log.level === 'ERROR') textClass = 'text-rose-400';
              if (log.level === 'SYSTEM') textClass = 'text-cyan-300 font-bold';

              return (
                <div key={log.id} className="leading-relaxed break-words hover:bg-white/[0.02] px-1 rounded transition-colors">
                  <span className="text-slate-600 select-none mr-2 font-mono text-[11px]">[{log.timestamp}]</span>
                  <span className={textClass}>{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CLI Input Line (Exact ID id="cli-input" and root@nexus:~# prompt) */}
      <div className="flex items-center bg-[#010409] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs focus-within:border-emerald-500/80 transition">
        <span className="text-emerald-500 mr-2 font-bold select-none whitespace-nowrap">
          root@nexus:~#
        </span>
        <input
          id="cli-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (e.g. 'status', 'restart', 'help')..."
          className="bg-transparent w-full text-white focus:outline-none placeholder:text-slate-600 font-mono"
        />
        <button
          onClick={() => handleExecute(inputVal)}
          disabled={!inputVal.trim()}
          className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-sans font-semibold border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:opacity-20 cursor-pointer"
        >
          Exec
        </button>
      </div>
    </div>
  );
};
