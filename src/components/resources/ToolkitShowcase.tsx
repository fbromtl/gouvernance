import { FileText, Sparkles, CheckCircle2 } from "lucide-react";

/* ================================================================== */
/*  Toolkit Showcase – Animated mockup demonstrating AI doc generation */
/*  12 s cycle: form → doc select → AI generate → PDF preview         */
/* ================================================================== */

export function ToolkitShowcase() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      {/* Scoped keyframe animations (12 s cycle) */}
      <style>{`
        /* ── Phase 1: Form appears (0-17%) ── */
        @keyframes tkFormIn {
          0%,4%   { opacity:0; transform:translateY(18px); }
          8%      { opacity:1; transform:translateY(0); }
          88%     { opacity:1; transform:translateY(0); }
          92%,100%{ opacity:0; }
        }

        /* ── Phase 1b: Field auto-type (width reveal) ── */
        @keyframes tkType1 {
          0%,8%   { width:0; opacity:0; }
          10%     { opacity:1; width:0; }
          17%     { width:100%; }
          88%     { width:100%; opacity:1; }
          92%,100%{ opacity:0; }
        }
        @keyframes tkType2 {
          0%,13%  { width:0; opacity:0; }
          15%     { opacity:1; width:0; }
          22%     { width:100%; }
          88%     { width:100%; opacity:1; }
          92%,100%{ opacity:0; }
        }

        /* ── Phase 2: Doc selector cycles (17-33%) ── */
        @keyframes tkDocCycle {
          0%,17%  { opacity:0; transform:translateY(6px); }
          20%     { opacity:1; transform:translateY(0); }
          88%     { opacity:1; }
          92%,100%{ opacity:0; }
        }
        @keyframes tkDocText1 {
          0%,20%,27%,100% { opacity:0; }
          21%,25%         { opacity:1; }
        }
        @keyframes tkDocText2 {
          0%,25%,31%,100% { opacity:0; }
          26%,29%         { opacity:1; }
        }
        @keyframes tkDocFinal {
          0%,29%  { opacity:0; }
          31%     { opacity:1; }
          88%     { opacity:1; }
          92%,100%{ opacity:0; }
        }

        /* ── Phase 3: Generate button pulse (33-42%) ── */
        @keyframes tkBtnPulse {
          0%,33%,42%,100% { box-shadow: 0 0 0 0 transparent; }
          36%              { box-shadow: 0 0 0 0 rgba(171,84,243,.5); }
          39%              { box-shadow: 0 0 0 8px rgba(171,84,243,.15); }
          41%              { box-shadow: 0 0 0 12px rgba(171,84,243,0); }
        }
        @keyframes tkBtnIn {
          0%,30%  { opacity:0; transform:translateY(6px); }
          33%     { opacity:1; transform:translateY(0); }
          88%     { opacity:1; }
          92%,100%{ opacity:0; }
        }

        /* ── Phase 4: Progress bar (42-65%) ── */
        @keyframes tkProgressBar {
          0%,42%  { opacity:0; }
          44%     { opacity:1; }
          65%     { opacity:1; }
          67%,100%{ opacity:0; }
        }
        @keyframes tkProgressFill {
          0%,42%  { width:0; }
          44%     { width:5%; }
          63%     { width:100%; }
          100%    { width:100%; }
        }

        /* ── Phase 4b: Text lines appear (50-65%) ── */
        @keyframes tkLine1 {
          0%,48%  { opacity:0; transform:translateX(-8px); }
          52%     { opacity:1; transform:translateX(0); }
          65%     { opacity:1; }
          67%,100%{ opacity:0; }
        }
        @keyframes tkLine2 {
          0%,53%  { opacity:0; transform:translateX(-8px); }
          57%     { opacity:1; transform:translateX(0); }
          65%     { opacity:1; }
          67%,100%{ opacity:0; }
        }
        @keyframes tkLine3 {
          0%,58%  { opacity:0; transform:translateX(-8px); }
          62%     { opacity:1; transform:translateX(0); }
          65%     { opacity:1; }
          67%,100%{ opacity:0; }
        }

        /* ── Phase 5: PDF preview slides in (65-90%) ── */
        @keyframes tkPdfSlide {
          0%,65%  { opacity:0; transform:translateY(20px) scale(.96); }
          70%     { opacity:1; transform:translateY(0) scale(1); }
          88%     { opacity:1; transform:translateY(0) scale(1); }
          92%,100%{ opacity:0; transform:translateY(-6px) scale(.98); }
        }
        @keyframes tkPdfBadge {
          0%,72%  { opacity:0; transform:scale(.6); }
          76%     { opacity:1; transform:scale(1.1); }
          78%     { opacity:1; transform:scale(1); }
          88%     { opacity:1; }
          92%,100%{ opacity:0; }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="toolkit-anim"] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden group hover:[&_*]:[animation-play-state:paused]">
        {/* ── Mockup header ── */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-semibold text-neutral-800">
              Générateur de documents
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
            <Sparkles className="h-3 w-3" />
            IA
          </span>
        </div>

        {/* ── Mockup body ── */}
        <div className="px-5 py-5 min-h-[360px] relative">

          {/* ═══ FORM PHASE ═══ */}
          <div
            className="toolkit-anim space-y-3"
            style={{ animation: "tkFormIn 12s ease-in-out infinite" }}
          >
            {/* Field: Entreprise */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Entreprise
              </label>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-2 overflow-hidden">
                <div
                  className="toolkit-anim text-sm text-neutral-800 font-medium whitespace-nowrap overflow-hidden"
                  style={{ animation: "tkType1 12s ease-in-out infinite" }}
                >
                  Acme Corp
                </div>
              </div>
            </div>

            {/* Field: Secteur */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Secteur
              </label>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 px-3 py-2 overflow-hidden">
                <div
                  className="toolkit-anim text-sm text-neutral-800 font-medium whitespace-nowrap overflow-hidden"
                  style={{ animation: "tkType2 12s ease-in-out infinite" }}
                >
                  Services financiers
                </div>
              </div>
            </div>

            {/* Document type selector */}
            <div
              className="toolkit-anim"
              style={{ animation: "tkDocCycle 12s ease-in-out infinite" }}
            >
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                Type de document
              </label>
              <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2 relative h-[34px] overflow-hidden">
                {/* Cycling text options */}
                <span
                  className="toolkit-anim absolute inset-x-3 text-sm text-violet-700 font-medium"
                  style={{ animation: "tkDocText1 12s ease-in-out infinite" }}
                >
                  Politique d&apos;IA générative
                </span>
                <span
                  className="toolkit-anim absolute inset-x-3 text-sm text-violet-700 font-medium"
                  style={{ animation: "tkDocText2 12s ease-in-out infinite" }}
                >
                  Code d&apos;éthique IA
                </span>
                <span
                  className="toolkit-anim absolute inset-x-3 text-sm text-violet-700 font-medium"
                  style={{ animation: "tkDocFinal 12s ease-in-out infinite" }}
                >
                  Charte d&apos;utilisation de l&apos;IA
                </span>
              </div>
            </div>
          </div>

          {/* ═══ GENERATE BUTTON ═══ */}
          <div
            className="toolkit-anim mt-4"
            style={{ animation: "tkBtnIn 12s ease-in-out infinite" }}
          >
            <button
              className="toolkit-anim w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#ab54f3] to-[#8b3fd4] px-4 py-2.5 text-sm font-semibold text-white"
              style={{ animation: "tkBtnPulse 12s ease-in-out infinite" }}
              tabIndex={-1}
            >
              <Sparkles className="h-4 w-4" />
              Générer avec l&apos;IA
            </button>
          </div>

          {/* ═══ PROGRESS BAR ═══ */}
          <div
            className="toolkit-anim mt-4 rounded-full bg-neutral-100 h-2 overflow-hidden"
            style={{ animation: "tkProgressBar 12s ease-in-out infinite" }}
          >
            <div
              className="toolkit-anim h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
              style={{ animation: "tkProgressFill 12s ease-in-out infinite" }}
            />
          </div>

          {/* ═══ GENERATED TEXT LINES ═══ */}
          <div className="mt-4 space-y-2">
            {[
              { text: "1. Objectif et portée de la charte", anim: "tkLine1" },
              { text: "2. Principes directeurs", anim: "tkLine2" },
              { text: "3. Rôles et responsabilités", anim: "tkLine3" },
            ].map(({ text, anim }) => (
              <div
                key={anim}
                className="toolkit-anim flex items-center gap-2"
                style={{ animation: `${anim} 12s ease-in-out infinite` }}
              >
                <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <p className="text-[11px] text-neutral-600">{text}</p>
              </div>
            ))}
          </div>

          {/* ═══ PDF PREVIEW ═══ */}
          <div
            className="toolkit-anim mt-5 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
            style={{ animation: "tkPdfSlide 12s ease-in-out infinite" }}
          >
            {/* PDF header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800 leading-tight">
                    Charte d&apos;utilisation de l&apos;IA
                  </p>
                  <p className="text-[10px] text-neutral-400">Acme Corp</p>
                </div>
              </div>
              <div
                className="toolkit-anim inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5"
                style={{ animation: "tkPdfBadge 12s ease-in-out infinite" }}
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600">PDF prêt</span>
              </div>
            </div>

            {/* PDF content placeholder lines */}
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded bg-neutral-200/70" />
              <div className="h-2 w-4/5 rounded bg-neutral-200/70" />
              <div className="h-2 w-3/5 rounded bg-neutral-200/70" />
              <div className="h-2 w-full rounded bg-neutral-200/70 mt-3" />
              <div className="h-2 w-5/6 rounded bg-neutral-200/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
