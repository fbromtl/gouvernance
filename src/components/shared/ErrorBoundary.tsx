import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Props & State                                                       */
/* ------------------------------------------------------------------ */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* ------------------------------------------------------------------ */
/*  ErrorBoundary — Class component (hooks can't catch render errors)   */
/* ------------------------------------------------------------------ */

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Une erreur est survenue
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-2">
            Cette page a rencontré un problème. Essayez de recharger.
          </p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground/70 max-w-md mb-6 font-mono">
              {this.state.error.message}
            </p>
          )}
          <Button onClick={this.handleReload} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recharger la page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
