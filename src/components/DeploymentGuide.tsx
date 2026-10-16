import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Terminal, Shield, Play } from 'lucide-react';
import {
  PYTHON_APP_CODE,
  REQUIREMENTS_CODE,
  RENDER_YAML_CODE,
  DOCKERFILE_CODE,
} from '../data/serverData.ts';

export const DeploymentGuide: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'app.py' | 'requirements.txt' | 'render.yaml' | 'Dockerfile'>('app.py');
  const [copied, setCopied] = useState<string | null>(null);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'app.py':
        return PYTHON_APP_CODE;
      case 'requirements.txt':
        return REQUIREMENTS_CODE;
      case 'render.yaml':
        return RENDER_YAML_CODE;
      case 'Dockerfile':
        return DOCKERFILE_CODE;
    }
  };

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1-CLICK PRODUCTION READY
              </span>
              <span className="text-slate-400 text-xs">Flask 3.0 + Gunicorn 22.0</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Render &amp; VPS Cloud Deployment Center
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              নিচে দেওয়া ফাইলগুলো সরাসরি আপনার GitHub রিপোজিটরিতে সেভ করে Render-এ ফ্রি প্ল্যানে হোস্ট করতে পারবেন। পোর্ট 10000 এবং হোস্ট 0.0.0.0 কনফিগার করা আছে।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadFile('app.py', PYTHON_APP_CODE)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
            <button
              onClick={() => downloadFile('requirements.txt', REQUIREMENTS_CODE)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Tab Buttons */}
        <div className="flex items-center justify-between bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center space-x-1">
            {(['app.py', 'requirements.txt', 'render.yaml', 'Dockerfile'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition cursor-pointer ${
                  activeCodeTab === tab
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCode(getActiveCode(), activeCodeTab)}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              {copied === activeCodeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <button
              onClick={() => downloadFile(activeCodeTab, getActiveCode())}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition cursor-pointer"
              title={`Download ${activeCodeTab}`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-4 bg-black/90 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed selection:bg-emerald-600/30">
          <code>{getActiveCode()}</code>
        </pre>
      </div>

      {/* Step by step deployment guide (Bengali & English) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Step-by-Step Render Deployment Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚀</span>
            <div>
              <h3 className="text-base font-bold text-emerald-400">
                Render Deployment Guide (রেন্ডার ডিপ্লয়মেন্ট গাইড)
              </h3>
              <p className="text-[11px] text-slate-400">
                Host your 24/7 live AI Cloud Server Dashboard on Render Free Cloud in 4 simple steps
              </p>
            </div>
          </div>
          <ol className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed list-decimal list-inside">
            <li className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-slate-100">Step 1: Upload to GitHub (গিটহাবে কোড আপলোড করুন)</span>
              <p className="text-slate-400 mt-1">
                Create a new repository on your GitHub account and commit/upload <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">app.py</code> and <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">requirements.txt</code>.
              </p>
            </li>
            <li className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-slate-100">Step 2: Connect Web Service on Render (রেন্ডার ড্যাশবোর্ড)</span>
              <p className="text-slate-400 mt-1">
                Go to <a href="https://dashboard.render.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold underline inline-flex items-center gap-1">
                  Render Dashboard <ExternalLink className="w-3 h-3" />
                </a>. Click <strong className="text-white">New + &gt; Web Service</strong> and select your GitHub repository.
              </p>
            </li>
            <li className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-slate-100">Step 3: Specify Build &amp; Start Commands (বিল্ড ও স্টার্ট কমান্ড)</span>
              <div className="mt-2 space-y-1.5 font-mono text-[11px]">
                <div className="bg-black/80 p-2 rounded border border-slate-800 flex items-center justify-between text-cyan-300">
                  <span>Build Command: pip install -r requirements.txt</span>
                </div>
                <div className="bg-black/80 p-2 rounded border border-slate-800 flex items-center justify-between text-emerald-300">
                  <span>Start Command: gunicorn app:app -b 0.0.0.0:10000</span>
                </div>
              </div>
            </li>
            <li className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="font-semibold text-slate-100">Step 4: Select Free Plan &amp; Deploy (ফ্রি প্ল্যানে চালু করুন)</span>
              <p className="text-slate-400 mt-1">
                Select the <strong className="text-emerald-400">Free Plan</strong> instance type and click <strong className="text-white">Create Web Service</strong>. Your cloud dashboard will be online 24/7 with zero configuration!
              </p>
            </li>
          </ol>
        </div>

        {/* VPS & Docker Guide */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-cyan-400">
              Self-Hosted VPS &amp; Docker Setup
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">Docker 1-Liner:</span>
              <pre className="bg-black/70 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto">
docker build -t ai-cloud-server .
docker run -d -p 10000:10000 ai-cloud-server
              </pre>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-semibold text-slate-100 block mb-1">Direct Linux VPS Execution:</span>
              <pre className="bg-black/70 p-2 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto">
python3 -m venv venv &amp;&amp; source venv/bin/activate
pip install -r requirements.txt
gunicorn app:app -b 0.0.0.0:10000 --workers 2
              </pre>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-100 block">Host &amp; Port Binding:</span>
                <span className="text-slate-400 text-[11px]">Binds to all network interfaces on port 10000</span>
              </div>
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
