import React, { useState } from 'react';
import { Volume2, PhoneCall, Copy, Check, Sparkles } from 'lucide-react';
import { VoiceAgent } from '../types.ts';

interface VoiceConfigBoxProps {
  onSimulateCall: (message: string) => void;
  soundEnabled: boolean;
  voiceAgents: VoiceAgent[];
  latencyMs: number;
  port: number;
}

export const VoiceConfigBox: React.FC<VoiceConfigBoxProps> = ({
  onSimulateCall,
  soundEnabled,
  latencyMs,
  port,
}) => {
  const [testText, setTestText] = useState('Nexus AI voice node is online and ready for inbound calls.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const webhookEndpoint = `https://nexus-ai-panel.onrender.com/webhook/voice`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestSpeech = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    if ('speechSynthesis' in window && soundEnabled) {
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 2200);
    }

    onSimulateCall(`[TTS TEST] ElevenLabs model synthesized: "${testText.slice(0, 30)}..." (${latencyMs}ms)`);
  };

  const handleTriggerIncomingCall = () => {
    if (callActive) return;
    setCallActive(true);
    onSimulateCall('[SIP HOOK] Inbound telephony stream received from +1 (800) 555-0142. Auto-answer triggered.');

    let dur = 0;
    const interval = setInterval(() => {
      dur += 1;
      setCallDuration(dur);
      if (dur >= 5) {
        clearInterval(interval);
        setCallActive(false);
        setCallDuration(0);
        onSimulateCall('[SIP HOOK] Telephony session terminated gracefully. Audio buffer flushed.');
      }
    }, 1000);
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col justify-between transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="mr-2">🎙️</span> Auto-Answer Agent
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full">
            ElevenLabs v2
          </span>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed mb-4">
          Inbound SIP webhooks route calls automatically to LLM core with zero local device friction.
        </p>

        {/* Pipeline Status box matching user template */}
        <div className="bg-black/40 border border-slate-800/90 p-3.5 rounded-xl flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
              Pipeline Status
            </span>
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              Listening (Port {port})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {callActive ? (
              <span className="text-xs font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> {callDuration}s
              </span>
            ) : null}
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Interactive controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestSpeech}
            disabled={isSpeaking}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isSpeaking
                ? 'bg-purple-600 text-white animate-pulse'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Speaking...' : 'Test Voice'}</span>
          </button>

          <button
            onClick={handleTriggerIncomingCall}
            disabled={callActive}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Call</span>
          </button>
        </div>

        {/* Toggle details / copy webhook */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {isExpanded ? 'Hide Webhook' : 'View Webhook URL'}
          </button>

          <button
            onClick={copyWebhook}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 p-2 bg-black/60 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-300 break-all select-all">
            {webhookEndpoint}
          </div>
        )}
      </div>
    </div>
  );
};
