# PWA Mobile Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the GiA portal into a PWA with native-feeling mobile navigation (bottom tab bar), offline support, and mobile-optimized chat.

**Architecture:** Install `vite-plugin-pwa` for service worker generation with Workbox. Add a `BottomTabBar` component visible only on mobile (`lg:hidden`). Adapt `FloatingChat` to use a full-screen bottom sheet on mobile via Framer Motion. Add install prompt and offline banner components.

**Tech Stack:** vite-plugin-pwa, Workbox (generateSW), Framer Motion, React Router, Tailwind CSS, Lucide icons, i18next

---

### Task 1: Install vite-plugin-pwa and configure service worker

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts:1-17`
- Modify: `src/main.tsx:1-17`

**Step 1: Install the dependency**

Run: `cd /c/Users/fbrom/OneDrive/Desktop/Gouvernance/siteweb/gouvernance && npm install vite-plugin-pwa -D`
Expected: Added to devDependencies

**Step 2: Update vite.config.ts to add PWA plugin**

```ts
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: false, // We use our own manifest.json in public/
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase API GET requests
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
})
```

**Step 3: Register service worker in main.tsx**

Add at the end of `src/main.tsx`, after the `createRoot` call:

```ts
// PWA service worker registration
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    // New content available — auto-update silently
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})
```

**Step 4: Verify build compiles**

Run: `cd /c/Users/fbrom/OneDrive/Desktop/Gouvernance/siteweb/gouvernance && npx tsc --noEmit`
Expected: No errors

Note: If TypeScript complains about `virtual:pwa-register`, add to `src/vite-env.d.ts`:
```ts
/// <reference types="vite-plugin-pwa/client" />
```

**Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/main.tsx src/vite-env.d.ts
git commit -m "feat: ajout vite-plugin-pwa avec service worker et cache offline"
```

---

### Task 2: Update manifest.json, icons, and meta tags

**Files:**
- Modify: `public/manifest.json`
- Modify: `index.html:16-22`
- Create: `public/icons/icon-192x192.png` (generated from favicon.svg)
- Create: `public/icons/icon-512x512.png`
- Create: `public/icons/icon-maskable-512x512.png`
- Create: `public/icons/apple-touch-icon.png` (180x180)

**Step 1: Update manifest.json**

```json
{
  "name": "Cercle de Gouvernance de l'IA",
  "short_name": "GiA",
  "description": "Plateforme de gouvernance responsable de l'intelligence artificielle",
  "start_url": "/dashboard",
  "display": "standalone",
  "theme_color": "#57886c",
  "background_color": "#f7f6f4",
  "lang": "fr",
  "orientation": "portrait-primary",
  "categories": ["business", "productivity"],
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

**Step 2: Generate PNG icons from favicon.svg**

Use a script or puppeteer (already in devDependencies) to convert SVG to PNG at the required sizes. Create `scripts/generate-icons.mjs`:

```js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.resolve(__dirname, '../public/favicon.svg');
const outDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svg = fs.readFileSync(svgPath, 'utf-8');
const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-maskable-512x512.png', size: 512, maskable: true },
];

const browser = await puppeteer.launch();

for (const { name, size, maskable } of sizes) {
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size });

  const bgColor = maskable ? '#57886c' : 'transparent';
  const padding = maskable ? Math.round(size * 0.1) : 0;
  const innerSize = size - padding * 2;

  const html = `
    <html><body style="margin:0;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:${bgColor};">
      <div style="width:${innerSize}px;height:${innerSize}px;">${svg}</div>
    </body></html>`;

  await page.setContent(html);
  await page.screenshot({ path: path.join(outDir, name), omitBackground: !maskable });
  await page.close();
}

await browser.close();
console.log('Icons generated in public/icons/');
```

Run: `cd /c/Users/fbrom/OneDrive/Desktop/Gouvernance/siteweb/gouvernance && node scripts/generate-icons.mjs`
Expected: 4 PNG files created in `public/icons/`

**Step 3: Update index.html meta tags**

Replace lines 16-22 of `index.html`:

```html
    <!-- Favicon & PWA -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#57886c" />
    <meta name="msapplication-TileColor" content="#57886c" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

**Step 4: Verify build**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add public/manifest.json public/icons/ index.html scripts/generate-icons.mjs
git commit -m "feat: mise a jour manifest PWA, icones PNG et meta tags"
```

---

### Task 3: Create BottomTabBar component

**Files:**
- Create: `src/portail/layout/BottomTabBar.tsx`
- Modify: `src/portail/layout/nav-config.ts` (add `CATEGORY_LABELS` export)
- Modify: `src/i18n/locales/fr/portail.json` (add mobile tab labels)
- Modify: `src/i18n/locales/en/portail.json` (add mobile tab labels)

**Step 1: Add short mobile labels to nav-config.ts**

Add after line 50 (after `CATEGORY_ICONS`), a mapping of category to default route:

```ts
/** Default route for each category (used by mobile bottom tab bar) */
export const CATEGORY_DEFAULT_ROUTES: Record<string, string> = {
  overview: "/dashboard",
  inventory: "/ai-systems",
  governance: "/governance",
  risks: "/risks",
  operations: "/monitoring",
  organization: "/membres",
};
```

**Step 2: Add i18n keys for mobile tabs**

In `src/i18n/locales/fr/portail.json`, add inside the `"rail"` object (or create if it doesn't exist) — check the existing keys first. The `rail` keys likely already exist based on `AppIconRail.tsx` line 54 referencing `rail.${group.category}`. These short labels will be reused by the bottom tab bar.

Also add new keys for the bottom tab sheet:

```json
{
  "mobileNav": {
    "subpagesTitle": "Naviguer"
  }
}
```

Same for `en/portail.json`:
```json
{
  "mobileNav": {
    "subpagesTitle": "Navigate"
  }
}
```

**Step 3: Create BottomTabBar.tsx**

```tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  navGroups,
  CATEGORY_ICONS,
  CATEGORY_DEFAULT_ROUTES,
  getCategoryForPath,
} from "./nav-config";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function BottomTabBar() {
  const { t } = useTranslation("portail");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [subpagesOpen, setSubpagesOpen] = useState(false);
  const [sheetCategory, setSheetCategory] = useState<string | null>(null);

  const activeCategory = getCategoryForPath(pathname);

  const handleTabClick = (category: string) => {
    if (category === activeCategory) {
      // Already on this category — open subpages sheet
      setSheetCategory(category);
      setSubpagesOpen(true);
    } else {
      // Navigate to category default route
      navigate(CATEGORY_DEFAULT_ROUTES[category] ?? "/dashboard");
    }
  };

  const sheetGroup = sheetCategory
    ? navGroups.find((g) => g.category === sheetCategory)
    : null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-16 items-stretch">
          {navGroups.map((group) => {
            const Icon = CATEGORY_ICONS[group.category];
            const isActive = activeCategory === group.category;

            return (
              <button
                key={group.category}
                type="button"
                onClick={() => handleTabClick(group.category)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive
                    ? "text-brand-forest"
                    : "text-neutral-400 active:text-neutral-600"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive && "drop-shadow-[0_0_4px_rgba(87,136,108,0.4)]"
                    )}
                  />
                )}
                <span className="text-[10px] font-medium leading-tight">
                  {t(`rail.${group.category}`)}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-forest" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Subpages Sheet — opens when tapping active tab */}
      <Sheet open={subpagesOpen} onOpenChange={setSubpagesOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">
              {sheetGroup ? t(sheetGroup.labelKey) : t("mobileNav.subpagesTitle")}
            </SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {sheetGroup?.items.map((item) => {
              const Icon = item.icon;
              const isItemActive = pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSubpagesOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors",
                    isItemActive
                      ? "bg-brand-forest/10 text-brand-forest"
                      : "text-neutral-600 active:bg-neutral-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium leading-tight">
                    {t(`nav.${item.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
```

**Step 4: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/portail/layout/BottomTabBar.tsx src/portail/layout/nav-config.ts src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "feat: ajout composant BottomTabBar pour navigation mobile"
```

---

### Task 4: Integrate BottomTabBar into PortailLayout and adapt header

**Files:**
- Modify: `src/portail/layout/PortailLayout.tsx:1-90`
- Modify: `src/portail/layout/AppHeader.tsx:105-116`

**Step 1: Update PortailLayout.tsx**

Replace the full file content:

```tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppIconRail } from "./AppIconRail";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { getCategoryForPath } from "./nav-config";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePageContext } from "@/hooks/usePageContext";
import { useAiChat } from "@/hooks/useAiChat";
import { FloatingChat } from "@/portail/components/FloatingChat";

export function PortailLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();

  const [activeCategory, setActiveCategory] = useState(() => getCategoryForPath(pathname));
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    setActiveCategory(getCategoryForPath(pathname));
  }, [pathname]);

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) {
      setSidebarVisible((v) => !v);
    } else {
      setActiveCategory(category);
      setSidebarVisible(true);
    }
  };

  const pageContext = usePageContext();
  const { messages, sendMessage, isStreaming, error, resetChat } =
    useAiChat(pageContext);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50/50">
      {/* Desktop: Icon Rail + Detail Sidebar */}
      <div className="hidden lg:flex">
        <AppIconRail
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        {sidebarVisible && (
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeCategory={activeCategory}
            filteredMode
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4 pb-20 lg:py-8 lg:pb-8">
            <ErrorBoundary key={pathname}>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />

      {/* Floating AI Chat Widget */}
      <FloatingChat
        messages={messages}
        onSend={sendMessage}
        isStreaming={isStreaming}
        error={error}
        onReset={resetChat}
      />
    </div>
  );
}
```

Key changes:
- Removed `mobileOpen` state and the mobile `Sheet` sidebar — replaced by `BottomTabBar`
- Removed `onMobileMenuToggle` prop from `AppHeader`
- Added `pb-20 lg:pb-8` to main content for bottom bar spacing on mobile
- Added `py-4` on mobile (was `py-6`)

**Step 2: Update AppHeader to remove mobile hamburger**

In `AppHeader.tsx`, remove the `onMobileMenuToggle` prop and the hamburger button.

Change the interface (line 23-25):
```ts
// Remove the interface entirely since no props needed now
```

Change the component signature (line 81):
```ts
export function AppHeader() {
```

Remove lines 109-116 (the hamburger Button).

Remove the `Menu` import from lucide-react (line 5).

Update the left section (line 108) to show a mobile page title instead:
```tsx
<div className="flex items-center gap-3 min-w-0">
  {/* Mobile: show current page title */}
  <span className="lg:hidden text-sm font-semibold text-neutral-900 truncate">
    {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ""}
  </span>

  {/* Breadcrumbs — desktop only */}
  <nav className="hidden lg:flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
    {breadcrumbs.map((crumb, i) => (
      // ... existing breadcrumb code unchanged
    ))}
  </nav>
</div>
```

**Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add src/portail/layout/PortailLayout.tsx src/portail/layout/AppHeader.tsx
git commit -m "feat: integration BottomTabBar dans le portail, suppression hamburger mobile"
```

---

### Task 5: Adapt FloatingChat for mobile (full-screen bottom sheet)

**Files:**
- Modify: `src/portail/components/FloatingChat.tsx:1-255`

**Step 1: Rewrite FloatingChat with mobile bottom sheet**

The key changes:
- On mobile (`< lg`): chat opens as full-screen overlay sliding up from bottom (Framer Motion)
- On desktop: unchanged behavior (floating panel)
- Floating button position: on mobile, sits above bottom tab bar (`bottom: 80px`)

Replace the full file:

```tsx
import { useRef, useEffect, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage } from "@/hooks/useAiChat";
import { cn } from "@/lib/utils";

interface FloatingChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isStreaming: boolean;
  error: string | null;
  onReset: () => void;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-brand-forest text-white rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function ChatPanel({
  messages,
  onSend,
  isStreaming,
  error,
  onReset,
  onClose,
  className,
}: FloatingChatProps & { onClose: () => void; className?: string }) {
  const { t } = useTranslation("aiChat");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-brand-forest text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-tight">{t("title")}</h3>
            <p className="text-[11px] text-white/70 leading-tight">{t("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            title={t("newConversation")}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("thinking")}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs shrink-0"
            onClick={() => {
              const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
              if (lastUserMsg) onSend(lastUserMsg.content);
            }}
          >
            {t("retry")}
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 p-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}>
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            className="min-h-[40px] max-h-[100px] resize-none text-sm rounded-xl border-border/60"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-brand-forest hover:bg-brand-forest/90"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FloatingChat(props: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const { messages } = props;

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const hasUnread =
    !open && messages.length > 1 && messages[messages.length - 1]?.role === "assistant";

  return (
    <>
      {/* ---- Desktop panel ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 hidden lg:flex w-[380px] h-[520px] rounded-2xl border border-border/60 shadow-2xl overflow-hidden"
          >
            <ChatPanel {...props} onClose={() => setOpen(false)} className="w-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Mobile full-screen sheet ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex lg:hidden"
          >
            <ChatPanel {...props} onClose={() => setOpen(false)} className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Floating Bubble ---- */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
            "bg-brand-forest text-white hover:bg-brand-forest/90",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2",
            // Mobile: above bottom tab bar. Desktop: bottom corner.
            "bottom-[88px] lg:bottom-6"
          )}
          aria-label="Ouvrir le chat"
        >
          <MessageSquare className="h-6 w-6 transition-transform duration-200 hover:scale-110" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
            </span>
          )}
        </button>
      )}
    </>
  );
}
```

**Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/portail/components/FloatingChat.tsx
git commit -m "feat: FloatingChat en bottom sheet plein ecran sur mobile"
```

---

### Task 6: Create useOnlineStatus hook and OfflineBanner component

**Files:**
- Create: `src/hooks/useOnlineStatus.ts`
- Create: `src/components/OfflineBanner.tsx`
- Modify: `src/portail/layout/PortailLayout.tsx` (add OfflineBanner)
- Modify: `src/i18n/locales/fr/portail.json` (add offline key)
- Modify: `src/i18n/locales/en/portail.json` (add offline key)

**Step 1: Create useOnlineStatus hook**

```ts
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
```

**Step 2: Create OfflineBanner component**

```tsx
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useTranslation("portail");

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white">
      <WifiOff className="h-3.5 w-3.5" />
      <span>{t("offlineBanner")}</span>
    </div>
  );
}
```

**Step 3: Add i18n keys**

FR `portail.json`: add `"offlineBanner": "Mode hors ligne — donnees de la derniere visite"`
EN `portail.json`: add `"offlineBanner": "Offline mode — showing cached data"`

**Step 4: Add OfflineBanner to PortailLayout**

In `PortailLayout.tsx`, import `OfflineBanner` and add it just above `<AppHeader />`:

```tsx
import { OfflineBanner } from "@/components/OfflineBanner";

// ... inside the main content div, before AppHeader:
<OfflineBanner />
<AppHeader />
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/hooks/useOnlineStatus.ts src/components/OfflineBanner.tsx src/portail/layout/PortailLayout.tsx src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "feat: ajout indicateur hors ligne avec useOnlineStatus hook"
```

---

### Task 7: Create PWA install prompt

**Files:**
- Create: `src/hooks/usePWAInstall.ts`
- Create: `src/components/PWAInstallPrompt.tsx`
- Modify: `src/portail/layout/PortailLayout.tsx` (add prompt)
- Modify: `src/i18n/locales/fr/portail.json`
- Modify: `src/i18n/locales/en/portail.json`

**Step 1: Create usePWAInstall hook**

```ts
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "gia-pwa-install-dismissed";
const VISIT_COUNT_KEY = "gia-pwa-visit-count";
const MIN_VISITS = 3;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Count visits
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? "0", 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));

    if (count < MIN_VISITS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setCanShow(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setCanShow(false);
  };

  return { canShow, install, dismiss };
}
```

**Step 2: Create PWAInstallPrompt component**

```tsx
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const { canShow, install, dismiss } = usePWAInstall();
  const { t } = useTranslation("portail");

  if (!canShow) return null;

  return (
    <div className="flex items-center gap-3 bg-brand-forest px-4 py-2 text-white text-sm">
      <Download className="h-4 w-4 shrink-0" />
      <span className="flex-1">{t("installPrompt.message")}</span>
      <Button
        size="sm"
        variant="secondary"
        className="h-7 px-3 text-xs font-semibold bg-white text-brand-forest hover:bg-white/90"
        onClick={install}
      >
        {t("installPrompt.install")}
      </Button>
      <button
        onClick={dismiss}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
```

**Step 3: Add i18n keys**

FR `portail.json`:
```json
{
  "installPrompt": {
    "message": "Installez GiA sur votre appareil pour un acces rapide",
    "install": "Installer"
  }
}
```

EN `portail.json`:
```json
{
  "installPrompt": {
    "message": "Install GiA on your device for quick access",
    "install": "Install"
  }
}
```

**Step 4: Add to PortailLayout**

Import and add above OfflineBanner:

```tsx
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Inside the main content div, before OfflineBanner:
<PWAInstallPrompt />
<OfflineBanner />
<AppHeader />
```

**Step 5: Verify TypeScript**

Run: `npx tsc --noEmit`

**Step 6: Commit**

```bash
git add src/hooks/usePWAInstall.ts src/components/PWAInstallPrompt.tsx src/portail/layout/PortailLayout.tsx src/i18n/locales/fr/portail.json src/i18n/locales/en/portail.json
git commit -m "feat: ajout invite d'installation PWA discrete apres 3 visites"
```

---

### Task 8: Final build verification and push

**Files:** None (verification only)

**Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Full build**

Run: `npm run build`
Expected: Build succeeds, service worker generated in `dist/`

**Step 3: Verify service worker output**

Run: `ls dist/sw.js dist/workbox-*.js 2>/dev/null`
Expected: Service worker files present

**Step 4: Push to remote**

Run: `git push`
Expected: All commits pushed to origin/main
