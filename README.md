# ⚡ Nexus AI // Cloud Core & Voice Engine

> **A-to-Z Deployment Guide for GitHub & Render.com**  
> Complete Dark Glassmorphism & Cyberpunk UI with WireGuard BDIX Dhaka Mesh, Bangladeshi MFS (bKash/Nagad) Gateway, Open-Source CMS Auto-Installer, Web & Mobile Hosting, SSH Keypair Manager, and Interactive Terminal CLI.

[![Render Deployment](https://img.shields.io/badge/Render-Deploy%20Ready-emerald?style=for-the-badge&logo=render)](https://render.com)
[![React 19](https://img.shields.io/badge/React-19.0-cyan?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-purple?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![WireGuard](https://img.shields.io/badge/WireGuard-BDIX%20Dhaka-red?style=for-the-badge&logo=wireguard)](https://wireguard.com)

---

## 🎯 How to Publish to GitHub and Deploy to Render.com (বাংলা ও English)

### 📌 ধাপ ১: গিটহাব রিপোজিটরিতে কোড পুশ করা (Push to GitHub)

আপনার কম্পিউটারে টার্মিনাল বা কমান্ড প্রম্পট খুলুন এবং নিচের কমান্ডগুলো ক্রমানুসারে চালান:

```bash
# ১. গিট ইনিশিয়ালাইজ করুন
git init

# ২. সকল ফাইল যোগ করুন
git add .

# ৩. কমিট করুন
git commit -m "Deploy Nexus Cloud Core to Render.com"

# ৪. মেইন ব্রাঞ্চ সেট করুন
git branch -M main

# ৫. আপনার গিটহাব রিপোজিটরির লিঙ্ক যোগ করুন (USERNAME এবং REPO পরিবর্তন করুন)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# ৬. গিটহাবে পুশ করুন
git push -u origin main
```

---

### 📌 ধাপ ২: Render.com-এ ১-ক্লিকে ডিপ্লয় করা (Deploy to Render)

#### পদ্ধতি ১: অটোমেটিক ব্লুপ্রিন্ট (Automatic Blueprint - রেকমেন্ডেড)
এই রিপোজিটরিতে ইতিমধ্যে `render.yaml` ফাইল দেওয়া আছে। তাই রেন্ডার স্বয়ংক্রিয়ভাবে সব কনফিগারেশন সেট করে নেবে:
1. [Render.com](https://render.com) এ লগইন করুন।
2. ড্যাশবোর্ডের উপরে ডানপাশে **New +** &rarr; **Blueprint** এ ক্লিক করুন।
3. আপনার GitHub রিপোজিটরি সিলেক্ট করুন।
4. **Apply** বাটনে ক্লিক করুন। Render স্বয়ংক্রিয়ভাবে বিল্ড করে লাইভ ইউআরএল দিয়ে দিবে!

#### পদ্ধতি ২: ম্যানুয়াল ওয়েব সার্ভিস (Manual Web Service)
1. Render ড্যাশবোর্ডে **New +** &rarr; **Web Service** এ ক্লিক করুন।
2. আপনার GitHub রিপোজিটরি কানেক্ট করুন।
3. নিচের সেটিংসগুলো দিন:
   - **Name:** `nexus-cloud-dashboard`
   - **Region:** `Singapore` (or Oregon / Frankfurt)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
### 🔐 অ্যাডমিন লগইন ও সিক্রেট অ্যাক্সেস (Administrator Credentials)
যেকোনো ব্রাউজার থেকে অ্যাপ ইউআরএল ওপেন করলে একটি সুরক্ষিত ডার্ক সাইবারপাঙ্ক লগইন পোর্টাল দেখতে পাবেন। ফিজিক্যাল কম্পিউটার বন্ধ করলেও Render.com এ সার্ভার ২৪/৭ চালু থাকবে এবং লগইন তথ্য সংরক্ষিত থাকবে:
- **Default Username:** `admin`
- **Default Password:** `NexusCloud2026!#`
- **Session Persistence:** "Keep session active across browser exits" চালু রাখলে ব্রাউজার ক্লোজ করলেও সেশন সচল থাকে।
- **Change Credentials:** ড্যাশবোর্ডের উপরে ডানপাশে Admin প্রোফাইল বাটনে ক্লিক করে যেকোনো সময় ইউজারনেম ও পাসওয়ার্ড পরিবর্তন করা যায়।

---

### ⚡ 512MB RAM অপ্টিমাইজেশন (Render Free Tier 512MB RAM)
Render Free Tier-এ সর্বোচ্চ ৫১২ মেগাবাইট মেমরি থাকে। অ্যাপটিকে OOM (Out Of Memory) ক্র্যাশ থেকে রক্ষা করতে:
- `render.yaml`-এ `NODE_OPTIONS="--max-old-space-size=384"` দেওয়া আছে যাতে Node.js ৩৮৪ মেগাবাইটের বেশি মেমরি ব্যবহার না করে।
- প্রতিটি CMS এবং অ্যাপে মেমরি লিমিট সিলেক্টর (64MB / 128MB / 192MB) দেওয়া আছে।
- OPcache এবং ইন-মেমরি ক্যাশ ক্লিনার যুক্ত আছে।

---

## 📂 প্রোজেক্টের ফাইল স্ট্রাকচার (Repository Structure)

| ফাইল / ফোল্ডার | বিবরণ |
|---|---|
| `render.yaml` | Render.com 1-Click Blueprint অটোমেশন ফাইল |
| `Dockerfile` | Multi-stage প্রোডাকশন ডকার ফাইল |
| `Procfile` | ওয়েব প্রসেস ডেফিনিশন (`web: node server.js`) |
| `server.js` | Express প্রোডাকশন সার্ভার (Vite SPA ও ব্যাকএন্ড API হ্যান্ডলার) |
| `app.py` | ডুয়াল-মোড পাইথন ফ্লাস্ক সার্ভার (Python রানটাইমে লাইভ UI সরবরাহ করে) |
| `requirements.txt` | পাইথন ডিপেনডেন্সি (`flask`, `gunicorn`, `requests`) |
| `package.json` | Node.js স্ক্রিপ্ট ও ডিপেনডেন্সি (`build`, `start: node server.js`) |
| `src/` | সম্পূর্ণ React 19 + TypeScript + Tailwind v4 অ্যাপ্লিকেশন সোর্স |
| `dist/` | Vite প্রোডাকশন অপ্টিমাইজড বিল্ড |

---

## 🌟 এই অ্যাপ্লিকেশনে যা যা রিয়েল-টাইম কাজ করে

1. **⚡ লাইভ ক্লাউড ড্যাশবোর্ড ও টেলিমেট্রি:**
   - রিয়েল-টাইম CPU, RAM ও ব্যান্ডউইথ মনিটরিং
   - BDIX ঢাকা লেটেন্সি মিটার (AmberIT গেটওয়ে)
   - ElevenLabs / Whisper AI ভয়েস পাইপলাইন সিমুলেশন
   - অডিও সিন্থেসাইজার ও সাউন্ড এফেক্টস

2. **🛡️ WireGuard BDIX ঢাকা টানেল:**
   - `wg0` ভার্চুয়াল ইন্টারফেস অন/অফ টগল
   - রিয়েল WireGuard কি-পেয়ার জেনারেটর (`wg genkey`)
   - `wg0.conf` কনফিগারেশন ভিউ ও ডাউনলোড
   - বাংলাদেশ রেসিডেন্সিয়াল আইপি রাউটিং সিমুলেশন

3. **🇧🇩 বাংলাদেশি ব্যাংক ও bKash গেটওয়ে:**
   - bKash, Nagad, CellFin, City Touch ও BRAC Bank Astha গেটওয়ে
   - লাইভ bKash পেমেন্ট সিমুলেটর ও অটোমেটিক কলব্যাক ওয়েবহুক ভেরিফিকেশন
   - BDT ট্রানজাকশন লেজার ট্র্যাকিং

4. **📦 ওপেন-সোর্স CMS অটো-ইন্সটলার:**
   - WordPress 6.7, Strapi Headless, Ghost, MedusaJS, Directus, Supabase Studio
   - ১-ক্লিকে ইনস্টল এবং আন-ইনস্টল অ্যাকশন
   - ডাটাবেস ইঞ্জিন ও পোর্ট ম্যাপিং

5. **🚀 ওয়েব ও মোবাইল অ্যাপ হোস্টিং সেন্টার:**
   - Next.js, Node.js, Python Flask, Flutter Web, React Native Expo কন্টেইনার
   - ১-ক্লিকে নতুন অ্যাপ ডেপ্লয়মেন্ট উইজার্ড
   - কনটেইনার স্ট্যাটাস কন্ট্রোল (Start/Stop/Restart)

6. **🔑 SSH অ্যাক্সেস ও কি-পেয়ার ম্যানেজার:**
   - আধুনিক ED25519 এবং RSA 4096 কি-পেয়ার জেনারেশন
   - OpenSSH পাবলিক কি কপি এবং ওয়ান-ক্লিক প্রাইভেট কি (`.pem`) ডাউনলোড
   - অ্যাক্টিভ SSH টার্মিনাল সেশনস মনিটরিং

7. **💻 ইন্টারেক্টিভ ক্লাউড টার্মিনাল CLI:**
   - রিয়েল কমান্ড এক্সিকিউশন: `wg`, `wg show`, `wg genkey`, `status`, `who`, `w`, `ssh-keygen`, `cat ~/.ssh/authorized_keys`, `help`, `deploy`, `curl`

---

## 🛠️ লোকাল মেশিনে রান করার নিয়ম (Local Development)

```bash
# ডিপেনডেন্সি ইনস্টল করুন
npm install

# ডেভেলপমেন্ট সার্ভার চালু করুন (Port 3000)
npm run dev

# প্রোডাকশন বিল্ড করুন
npm run build

# প্রোডাকশন সার্ভার টেস্ট করুন (Port 10000)
node server.js
```

Render.com-এ ডেপ্লয় করার পর লাইভ ডোমেইনে সম্পূর্ণ একই UI প্রদর্শিত হবে!
