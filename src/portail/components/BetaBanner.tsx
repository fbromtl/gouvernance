import { Info } from "lucide-react";

interface BetaBannerProps {
  onOpenBugReport: () => void;
}

export function BetaBanner({ onOpenBugReport }: BetaBannerProps) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-4 lg:px-6 py-2 text-sm text-amber-800">
      <Info className="h-4 w-4 shrink-0" />
      <p>
        <span className="font-medium">Portail en version bêta</span>
        {" — "}
        Certaines fonctionnalités ne sont pas entièrement finalisées. L'accès aux fonctionnalités est actuellement libre avec le forfait Observateur gratuit.{" "}
        <button
          type="button"
          onClick={onOpenBugReport}
          className="underline underline-offset-2 hover:text-amber-900 font-medium"
        >
          Signaler un bug
        </button>
      </p>
    </div>
  );
}
