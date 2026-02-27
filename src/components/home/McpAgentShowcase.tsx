import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Plus,
  Server,
  Bell,
  Activity,
  CheckCircle2,
} from "lucide-react";

/* ================================================================== */
/*  MCP Agent Showcase – Marketing section with animated mockup        */
/* ================================================================== */

export function McpAgentShowcase() {
  return (
    <section className="border-y border-neutral-200 bg-white py-24">
      {/* Scoped keyframe animations (8 s cycle, staggered) */}
      <style>{`
        @keyframes mcpPulse {
          0%,17%,31%,100% { box-shadow: 0 0 0 0 transparent; }
          18%              { box-shadow: 0 0 0 0 rgba(171,84,243,.5); }
          24%              { box-shadow: 0 0 0 8px rgba(171,84,243,.25); }
          30%              { box-shadow: 0 0 0 12px rgba(171,84,243,0); }
        }
        @keyframes mcpSlideIn {
          0%,27%,100%  { opacity:0; transform:translateY(16px) scale(.96); }
          30%          { opacity:1; transform:translateY(0) scale(1); }
          48%          { opacity:1; transform:translateY(0) scale(1); }
          51%          { opacity:0; transform:translateY(-8px) scale(.97); }
        }
        @keyframes mcpAppear {
          0%,47%,83%,100% { opacity:0; transform:translateY(6px); }
          50%              { opacity:1; transform:translateY(0); }
          80%              { opacity:1; transform:translateY(0); }
        }
        @keyframes mcpTrace {
          0%,62%,83%,100% { opacity:0; transform:translateX(-8px); }
          65%              { opacity:1; transform:translateX(0); }
          80%              { opacity:1; transform:translateX(0); }
        }
        @keyframes mcpBadge {
          0%,77%,91%,100% { opacity:0; transform:scale(.5); }
          80%              { opacity:1; transform:scale(1.15); }
          83%              { opacity:1; transform:scale(1); }
          88%              { opacity:1; transform:scale(1); }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left column: marketing text ── */}
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ab54f3]/10 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[#ab54f3] mb-6">
              <Zap className="h-3.5 w-3.5" />
              Nouveau
            </span>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mb-5 leading-[1.15]">
              Connectez vos agents IA via le serveur{" "}
              <span className="text-[#ab54f3]">MCP</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
              Le protocole MCP (Model Context Protocol) permet a vos agents IA
              de reporter automatiquement leurs decisions algorithmiques sur la
              plateforme. Tracabilite, conformite et supervision en temps reel
              &mdash; sans effort supplementaire.
            </p>

            {/* CTA */}
            <Link
              to="/ressources"
              className="group inline-flex items-center gap-2 text-[#ab54f3] font-medium hover:text-[#8b3fd4] transition-colors"
            >
              Decouvrir le MCP
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ── Right column: animated mockup ── */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md lg:max-w-none bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
              {/* Mockup header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#ab54f3]" />
                  <span className="text-sm font-semibold text-neutral-800">
                    Activite des agents
                  </span>
                </div>

                {/* Bell with animated badge */}
                <div className="relative">
                  <Bell className="h-4 w-4 text-neutral-400" />
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ab54f3] text-[9px] font-bold text-white"
                    style={{ animation: "mcpBadge 8s ease-in-out infinite" }}
                  >
                    1
                  </span>
                </div>
              </div>

              {/* Mockup body */}
              <div className="relative px-5 py-5 min-h-[260px]">
                {/* Connect button with pulse */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-500 cursor-default"
                  style={{ animation: "mcpPulse 8s ease-in-out infinite" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Connecter Agent
                </button>

                {/* ── Slide-in config modal ── */}
                <div
                  className="absolute inset-x-5 top-14 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg"
                  style={{ animation: "mcpSlideIn 8s ease-in-out infinite" }}
                >
                  <p className="text-xs font-semibold text-neutral-800 mb-3">
                    Configuration de l&apos;agent
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Nom de l'agent", value: "Agent-Conformite-01" },
                      {
                        label: "Endpoint MCP",
                        value: "https://mcp.gouvernance.ai",
                      },
                      { label: "Cle API", value: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" },
                    ].map((field) => (
                      <div key={field.label}>
                        <span className="block text-[10px] font-medium text-neutral-400 mb-0.5">
                          {field.label}
                        </span>
                        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-700 font-mono">
                          {field.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Agent entry (appears after modal closes) ── */}
                <div
                  className="mt-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50/60 px-3.5 py-3"
                  style={{ animation: "mcpAppear 8s ease-in-out infinite" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ab54f3]/10">
                      <Server className="h-4 w-4 text-[#ab54f3]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">
                        Agent-Conformite-01
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#22c55e]">
                        <CheckCircle2 className="h-3 w-3" />
                        Connecte
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22c55e]">
                    Actif
                  </span>
                </div>

                {/* ── Decision trace ── */}
                <div
                  className="mt-3 flex items-start gap-2.5 rounded-lg border border-neutral-100 bg-white px-3.5 py-2.5"
                  style={{ animation: "mcpTrace 8s ease-in-out infinite" }}
                >
                  <span className="mt-1 block h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />
                  <div>
                    <p className="text-[11px] font-medium text-neutral-700">
                      Decision : approbation auto &mdash; scoring credit
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      il y a 2 s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
