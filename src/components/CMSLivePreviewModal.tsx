import React, { useState } from 'react';
import { ExternalLink, Lock, RotateCcw, Monitor, Smartphone, Tablet, Sparkles, Send, ShoppingBag, BookOpen, Layers, Check, MessageSquare } from 'lucide-react';
import type { InstalledCMSInstance } from '../types.ts';

interface CMSLivePreviewModalProps {
  instance: InstalledCMSInstance;
  onClose: () => void;
  onAddLog: (msg: string) => void;
}

export const CMSLivePreviewModal: React.FC<CMSLivePreviewModalProps> = ({
  instance,
  onClose,
  onAddLog,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Interactive WordPress blog state
  const [wpPosts, setWpPosts] = useState([
    {
      id: 1,
      title: 'Welcome to Nexus Cloud & WireGuard BDIX Routing',
      date: 'October 16, 2026',
      author: 'admin',
      content: 'This WordPress instance is running autonomously on Render.com free cloud tier, optimized with 512MB RAM memory limits and SQLite zero-config database.',
      commentsCount: 3,
    },
    {
      id: 2,
      title: 'Low-Memory PHP 8.3 & OPcache Acceleration Tips',
      date: 'October 14, 2026',
      author: 'admin',
      content: 'By restricting worker threads to 1 and enabling OPcache bytecode caching, memory consumption stays under 128MB even during peak ingress.',
      commentsCount: 5,
    },
  ]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Strapi state
  const [strapiEndpoint, setStrapiEndpoint] = useState('/api/articles');
  const [strapiData, setStrapiData] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handlePublishWpPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    setIsPublishing(true);

    setTimeout(() => {
      setIsPublishing(false);
      setWpPosts((prev) => [
        {
          id: Date.now(),
          title: newPostTitle,
          date: 'Just now',
          author: instance.adminUsername || 'admin',
          content: newPostContent,
          commentsCount: 0,
        },
        ...prev,
      ]);
      onAddLog(`[WP REST API] Published new post: "${newPostTitle}" on ${instance.installPath}`);
      setNewPostTitle('');
      setNewPostContent('');
    }, 400);
  };

  const handleFetchStrapi = () => {
    const mock = {
      data: [
        {
          id: 1,
          attributes: {
            title: 'Render Cloud Core API Integration',
            slug: 'render-cloud-core-api',
            locale: 'en',
            createdAt: new Date().toISOString(),
            status: 'published',
            author: instance.adminEmail,
          },
        },
        {
          id: 2,
          attributes: {
            title: 'bKash Webhook Callback Schema v2',
            slug: 'bkash-webhook-callback-v2',
            locale: 'bn-BD',
            createdAt: new Date().toISOString(),
            status: 'published',
            author: 'mfs-gateway',
          },
        },
      ],
      meta: {
        pagination: { page: 1, pageSize: 25, total: 2 },
        server: 'Render Node.js 20.x Cluster',
        memoryUsage: '148MB / 512MB',
      },
    };
    setStrapiData(JSON.stringify(mock, null, 2));
    onAddLog(`[STRAPI REST API] GET ${strapiEndpoint} HTTP/1.1 (200 OK)`);
  };

  const containerWidthClass =
    device === 'mobile'
      ? 'max-w-sm'
      : device === 'tablet'
      ? 'max-w-2xl'
      : 'max-w-4xl';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className={`glass-card w-full ${containerWidthClass} rounded-2xl border border-slate-700 shadow-2xl overflow-hidden my-4 flex flex-col transition-all duration-300`}>
        {/* Browser Top Chrome / Address Bar */}
        <div className="bg-[#0b0f19] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 select-none">
          {/* Window control dots */}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          {/* URL Address Bar */}
          <div className="flex-1 max-w-lg bg-[#010409] border border-slate-800 rounded-lg px-3 py-1 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-emerald-400">https://</span>
              <span className="text-white">nexus-ai-panel.onrender.com</span>
              <span className="text-cyan-400">{instance.installPath}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-slate-500 hover:text-white p-0.5 cursor-pointer"
              title="Reload frame"
            >
              <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Device Switcher & Close */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 bg-[#010409] p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1 rounded cursor-pointer ${device === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'}`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-1 rounded cursor-pointer ${device === 'tablet' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'}`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1 rounded cursor-pointer ${device === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'}`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-bold text-sm p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body: Simulated Real Hosting Render */}
        <div className="bg-slate-950 min-h-[460px] max-h-[70vh] overflow-y-auto p-4 sm:p-6 text-slate-100 font-sans">
          {/* MAINTENANCE MODE BANNER */}
          {instance.status === 'MAINTENANCE' ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-8">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-white">Under Scheduled Cloud Maintenance</h2>
              <p className="text-sm text-slate-400 max-w-md">
                {instance.maintenanceMessage || 'This instance is undergoing routine container updates on Render Cloud.'}
              </p>
              <div className="text-xs font-mono text-slate-500 bg-[#010409] p-3 rounded-xl border border-slate-800">
                Nexus Cloud Core &bull; Port {instance.installPath} &bull; HTTP 503 Maintenance
              </div>
            </div>
          ) : instance.cmsId === 'cms-wordpress' ? (
            /* WORDPRESS INTERACTIVE BLOG */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Site Header */}
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{instance.siteTitle}</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Powered by WordPress {instance.version} on Render Cloud (512MB RAM)</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    Engine: PHP 8.3 + SQLite
                  </span>
                </div>
              </div>

              {/* Add New Post interactive form */}
              <form onSubmit={handlePublishWpPost} className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Publish New Blog Post (Live Test)</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">wp_insert_post()</span>
                </div>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Post title (e.g. 'Deploying to Render via GitHub')..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <textarea
                  rows={2}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Post content summary..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish to WordPress'}</span>
                  </button>
                </div>
              </form>

              {/* Blog Posts Feed */}
              <div className="space-y-4">
                {wpPosts.map((post) => (
                  <article key={post.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition">
                    <div className="flex justify-between items-start">
                      <h2 className="text-base font-bold text-white hover:text-amber-400 cursor-pointer">{post.title}</h2>
                      <span className="text-[11px] font-mono text-slate-500">{post.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                      <span>Posted by: {post.author}</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>{post.commentsCount} comments</span>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : instance.cmsId === 'cms-strapi' ? (
            /* STRAPI HEADLESS CMS INTERACTIVE VIEW */
            <div className="space-y-5 max-w-3xl mx-auto">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <span>{instance.siteTitle}</span>
                  </h1>
                  <p className="text-xs text-slate-400">Strapi Headless Content Manager v{instance.version}</p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  PostgreSQL Active
                </span>
              </div>

              {/* Endpoint tester */}
              <div className="p-4 rounded-xl bg-[#010409] border border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Live Content API Explorer:</span>
                  <button
                    onClick={handleFetchStrapi}
                    className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>Execute GET Request</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1.5 rounded bg-black border border-slate-800 font-mono text-xs text-emerald-400">GET</span>
                  <input
                    type="text"
                    value={strapiEndpoint}
                    onChange={(e) => setStrapiEndpoint(e.target.value)}
                    className="flex-1 bg-black border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* JSON Result */}
              {strapiData ? (
                <div className="p-4 rounded-xl bg-black border border-slate-800 font-mono text-xs text-purple-300 overflow-x-auto">
                  <pre>{strapiData}</pre>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono bg-black/40 rounded-xl border border-slate-800">
                  Click &quot;Execute GET Request&quot; to test the live REST response returned by the Strapi instance.
                </div>
              )}
            </div>
          ) : (
            /* GENERIC CMS / WEB VIEW */
            <div className="max-w-2xl mx-auto space-y-6 py-6 text-center">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl">
                🌐
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{instance.siteTitle}</h1>
                <p className="text-xs text-slate-400 mt-1">Platform: {instance.name} v{instance.version} &bull; Route: {instance.installPath}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#010409] border border-slate-800 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Container Status:</span>
                  <span className="text-emerald-400 font-bold">ONLINE &bull; 200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Memory:</span>
                  <span className="text-white">{instance.memoryLimitMb || 128}MB / 512MB RAM Pool</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Database Driver:</span>
                  <span className="text-cyan-400">{instance.databaseType}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0b0f19] px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Render Free Tier Web Service (512MB RAM Engine)</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
