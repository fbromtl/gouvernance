import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold tracking-tight text-brand-forest">
        404
      </h1>
      <p className="mt-4 text-lg text-neutral-600">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Button asChild className="mt-8 gap-2" size="lg">
        <Link to="/">
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  );
}
