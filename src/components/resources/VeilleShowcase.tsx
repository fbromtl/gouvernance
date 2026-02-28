import {
  Newspaper,
  Sparkles,
  Star,
  Building2,
  CheckCircle2,
} from "lucide-react";

/* ================================================================== */
/*  Veille Showcase – Animated mockup demonstrating regulatory watch   */
/*  12 s cycle: article → AI summary → favorite → share to org        */
/* ================================================================== */

export function VeilleShowcase() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      {/* Scoped keyframe animations (12 s cycle, staggered) */}
      <style>{`
        @keyframes veilleCardIn {
          0%,8%   { opacity:0; transform:translateY(24px) scale(.97); }
          12%     { opacity:1; transform:translateY(0) scale(1); }
          88%     { opacity:1; transform:translateY(0) scale(1); }
          94%,100%{ opacity:0; transform:translateY(-8px) scale(.98); }
        }
        @keyframes veillePulseBtn {
          0%,14%,22%,100% { box-shadow: 0 0 0 0 transparent; }
          16%              { box-shadow: 0 0 0 0 rgba(139,92,246,.5); }
          19%              { box-shadow: 0 0 0 6px rgba(139,92,246,.2); }
          21%              { box-shadow: 0 0 0 10px rgba(139,92,246,0); }
        }
        @keyframes veilleSummaryIn {
          0%,23%,78%,100% { opacity:0; max-height:0; padding-top:0; padding-bottom:0; margin-top:0; }
          28%              { opacity:1; max-height:200px; padding-top:12px; padding-bottom:12px; margin-top:12px; }
          75%              { opacity:1; max-height:200px; padding-top:12px; padding-bottom:12px; margin-top:12px; }
        }
        @keyframes veilleBullet1 {
          0%,30%,78%,100% { opacity:0; transform:translateX(-6px); }
          34%              { opacity:1; transform:translateX(0); }
          75%              { opacity:1; transform:translateX(0); }
        }
        @keyframes veilleBullet2 {
          0%,35%,78%,100% { opacity:0; transform:translateX(-6px); }
          39%              { opacity:1; transform:translateX(0); }
          75%              { opacity:1; transform:translateX(0); }
        }
        @keyframes veilleBullet3 {
          0%,40%,78%,100% { opacity:0; transform:translateX(-6px); }
          44%              { opacity:1; transform:translateX(0); }
          75%              { opacity:1; transform:translateX(0); }
        }
        @keyframes veilleStar {
          0%,56%,78%,100% { opacity:0; transform:scale(.3); }
          60%              { opacity:1; transform:scale(1.2); }
          63%              { opacity:1; transform:scale(1); }
          75%              { opacity:1; transform:scale(1); }
        }
        @keyframes veilleFavBadge {
          0%,61%,78%,100% { opacity:0; transform:translateY(4px); }
          64%              { opacity:1; transform:translateY(0); }
          75%              { opacity:1; transform:translateY(0); }
        }
        @keyframes veilleOrgPulse {
          0%,66%,74%,100% { box-shadow: 0 0 0 0 transparent; }
          68%              { box-shadow: 0 0 0 0 rgba(59,130,246,.5); }
          71%              { box-shadow: 0 0 0 6px rgba(59,130,246,.2); }
          73%              { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
        }
        @keyframes veilleOrgBadge {
          0%,72%,88%,100% { opacity:0; transform:translateY(4px); }
          75%              { opacity:1; transform:translateY(0); }
          85%              { opacity:1; transform:translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="veille-anim"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            max-height: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden group hover:[&_*]:[animation-play-state:paused]">
        {/* ── Mockup header ── */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-neutral-800">
              Veille réglementaire
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
            <Sparkles className="h-3 w-3" />
            IA
          </span>
        </div>

        {/* ── Mockup body ── */}
        <div className="px-5 py-5 min-h-[320px]">
          {/* ── Article card (slides in) ── */}
          <div
            className="veille-anim rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
            style={{ animation: "veilleCardIn 12s ease-in-out infinite" }}
          >
            {/* Article meta */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Québec
              </span>
              <span className="text-[10px] text-neutral-400">12 fév. 2026</span>
            </div>

            {/* Article title */}
            <p className="text-sm font-semibold text-neutral-800 leading-snug mb-3">
              Loi 25 — Nouvelles obligations de conformité IA pour 2026
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                className="veille-anim inline-flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-200 px-3 py-1.5 text-[11px] font-medium text-violet-700"
                style={{ animation: "veillePulseBtn 12s ease-in-out infinite" }}
                tabIndex={-1}
              >
                <Sparkles className="h-3 w-3" />
                Résumer
              </button>

              <button
                className="veille-anim inline-flex items-center gap-1 rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 text-[11px] text-neutral-500"
                tabIndex={-1}
              >
                <Star
                  className="veille-anim h-3.5 w-3.5"
                  style={{ animation: "veilleStar 12s ease-in-out infinite" }}
                  fill="currentColor"
                />
              </button>

              <button
                className="veille-anim inline-flex items-center gap-1 rounded-lg bg-neutral-50 border border-neutral-200 px-2.5 py-1.5 text-[11px] text-neutral-500"
                style={{ animation: "veilleOrgPulse 12s ease-in-out infinite" }}
                tabIndex={-1}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[10px]">+ Org</span>
              </button>
            </div>
          </div>

          {/* ── AI Summary panel (slides in after button pulse) ── */}
          <div
            className="veille-anim rounded-xl border border-violet-200 bg-violet-50/50 px-4 overflow-hidden"
            style={{ animation: "veilleSummaryIn 12s ease-in-out infinite" }}
          >
            <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Résumé IA
            </p>
            <div className="space-y-1.5">
              {[
                "Obligation de conformité IA pour toutes les organisations",
                "Échéance de mise en conformité : mars 2026",
                "Impact : secteurs public et privé au Québec",
              ].map((text, i) => (
                <div
                  key={text}
                  className="veille-anim flex items-start gap-2"
                  style={{
                    animation: `veilleBullet${i + 1} 12s ease-in-out infinite`,
                  }}
                >
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  <p className="text-[11px] text-neutral-700 leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Confirmation badges ── */}
          <div className="mt-3 space-y-2">
            <div
              className="veille-anim flex items-center gap-2 text-[11px] text-amber-600 font-medium"
              style={{ animation: "veilleFavBadge 12s ease-in-out infinite" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ajouté aux favoris
            </div>
            <div
              className="veille-anim flex items-center gap-2 text-[11px] text-blue-600 font-medium"
              style={{ animation: "veilleOrgBadge 12s ease-in-out infinite" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Partagé avec votre équipe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
