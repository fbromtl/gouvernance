import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Mail,
  Phone,
  Linkedin,
  ChevronDown,
  ChevronRight,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const avatarUrl =
    profile?.avatar_url ??
    user?.user_metadata?.avatar_url ??
    user?.user_metadata?.picture ??
    null;

  const displayName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    "";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Track broken avatar images so we fall back to initials
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => setAvatarError(false), [avatarUrl]);
  const showAvatar = avatarUrl && !avatarError;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    const basePath = path.split("#")[0];
    if (basePath === "/") return location.pathname === "/";
    return location.pathname.startsWith(basePath);
  };

  /* ---------------------------------------------------------------- */
  /*  NAV LINK (desktop)                                               */
  /* ---------------------------------------------------------------- */

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={cn(
        "relative px-4 py-2 text-[13px] font-semibold tracking-wide transition-colors duration-200",
        "text-neutral-500 hover:text-neutral-950",
        isActive(to) && "text-neutral-950"
      )}
    >
      {children}
      {/* Animated underline */}
      <span
        className={cn(
          "absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-primary transition-transform duration-300 origin-left",
          isActive(to) ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* PROMOTIONAL BANNER */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          bannerVisible ? "max-h-12" : "max-h-0"
        )}
      >
        <div className="bg-gradient-to-r from-purple-50 via-violet-50/80 to-purple-50 border-b border-purple-100/60">
          <div className="mx-auto max-w-7xl flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2.5 relative">
            <p className="text-[13px] text-purple-900/80 font-medium">
              <span className="hidden sm:inline">
                Testez gratuitement notre outil de gouvernance IA
              </span>
              <span className="sm:hidden">
                Essayez l&apos;outil gratuitement
              </span>
            </p>
            <Link
              to="/rejoindre"
              className="ml-3 inline-flex items-center gap-1 text-[13px] font-semibold text-purple-700 hover:text-purple-900 transition-colors"
            >
              Essayer
              <ChevronRight className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setBannerVisible(false)}
              className="absolute right-4 sm:right-6 lg:right-8 p-1 rounded-md text-purple-400 hover:text-purple-700 hover:bg-purple-100/60 transition-colors"
              aria-label="Fermer la bannière"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div
        className={cn(
          "bg-white/98 backdrop-blur-md border-b transition-all duration-300",
          scrolled ? "shadow-md border-border/50" : "border-border/30 shadow-sm"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">

          {/* LOGO — left */}
          <Link
            to="/"
            className="flex items-center hover:opacity-85 transition-opacity shrink-0"
          >
            <img
              src="/logo.svg"
              alt="Cercle de Gouvernance de l'IA"
              className="h-8 sm:h-9 w-auto"
            />
          </Link>

          {/* NAV — center (desktop only) */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/a-propos">Le Cercle</NavLink>
            <NavLink to="/ressources">Ressources</NavLink>
            <NavLink to="/actualites">Actualités</NavLink>
            <NavLink to="/tarifs">Adhésion</NavLink>
          </nav>

          {/* AUTH — right (desktop only) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {!authLoading && !user && (
              <Link
                to="/connexion"
                className="text-[13px] font-medium text-neutral-500 hover:text-neutral-950 transition-colors px-3 py-1.5"
              >
                Se connecter
              </Link>
            )}

            {!authLoading && !user && (
              <Button asChild size="sm" className="px-5 text-[13px] font-semibold">
                <Link to="/rejoindre">Inscription gratuite</Link>
              </Button>
            )}

            {!authLoading && user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-muted/60 transition-colors"
                >
                  {showAvatar ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="size-8 rounded-full object-cover border-2 border-brand-purple/30"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
                      {initials}
                    </div>
                  )}
                  <ChevronDown
                    className={cn(
                      "size-3 text-muted-foreground transition-transform duration-200",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* User dropdown */}
                <div
                  className={cn(
                    "absolute top-full right-0 mt-2 w-56 rounded-xl bg-white shadow-xl shadow-black/10 border border-border/50 overflow-hidden transition-all duration-200",
                    userMenuOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  )}
                >
                  <div className="px-4 py-3 border-b border-border/40">
                    <p className="text-sm font-medium text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/portail");
                      }}
                      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <LayoutDashboard className="size-4" />
                      Mon portail
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      }}
                      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-red-600/80 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE / TABLET — right */}
          <div className="flex lg:hidden items-center gap-1.5">
            {!authLoading && !user && (
              <Link
                to="/connexion"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                <span className="hidden sm:inline">Se connecter</span>
                <LogIn className="size-3.5 sm:hidden" />
              </Link>
            )}

            {!authLoading && user && (
              <button
                type="button"
                onClick={() => navigate("/portail")}
                className="flex items-center justify-center"
              >
                {showAvatar ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-8 rounded-full object-cover border-2 border-brand-purple/30"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
                    {initials}
                  </div>
                )}
              </button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center size-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto p-0">
                {/* Mobile Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border/50">
                  <img
                    src="/logo.svg"
                    alt="Cercle de Gouvernance de l'IA"
                    className="h-8 w-auto"
                  />
                </div>

                {/* Mobile Promo Banner */}
                {bannerVisible && (
                  <div className="mx-4 mt-4 rounded-xl bg-purple-50/80 border border-purple-100/60 p-3">
                    <p className="text-[13px] text-purple-900/80 font-medium mb-2">
                      Testez gratuitement notre outil de gouvernance IA
                    </p>
                    <Link
                      to="/rejoindre"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-purple-700 hover:text-purple-900 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Essayer
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                )}

                {/* Mobile Nav */}
                <nav className="px-4 py-4 space-y-1">
                  <MobileNavLink to="/" active={isActive("/")}>Accueil</MobileNavLink>
                  <MobileNavLink to="/a-propos" active={isActive("/a-propos")}>Le Cercle</MobileNavLink>
                  <MobileNavLink to="/ressources" active={isActive("/ressources")}>Ressources</MobileNavLink>
                  <MobileNavLink to="/actualites" active={isActive("/actualites")}>Actualités</MobileNavLink>
                  <MobileNavLink to="/tarifs" active={isActive("/tarifs")}>Adhésion</MobileNavLink>
                  <MobileNavLink to="/contact" active={isActive("/contact")}>Contact</MobileNavLink>
                </nav>

                {/* Mobile Footer */}
                <div className="px-6 py-4 border-t border-border/50 mt-2 space-y-3">
                  {!authLoading && user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-2">
                      {showAvatar ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="size-9 rounded-full object-cover border-2 border-border/50"
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-brand-purple/10 text-brand-purple text-sm font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {!authLoading && user && (
                    <>
                      <Button asChild variant="outline" className="w-full gap-2">
                        <Link to="/portail">
                          <LayoutDashboard className="size-4" />
                          Mon portail
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-red-600 hover:text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          setMobileOpen(false);
                          await signOut();
                        }}
                      >
                        <LogOut className="size-4" />
                        Se déconnecter
                      </Button>
                    </>
                  )}

                  {!authLoading && !user && (
                    <Button asChild className="w-full">
                      <Link to="/rejoindre">Inscription gratuite</Link>
                    </Button>
                  )}

                  {!authLoading && !user && (
                    <Button asChild variant="outline" className="w-full gap-2">
                      <Link to="/connexion">
                        <LogIn className="size-4" />
                        Se connecter
                      </Link>
                    </Button>
                  )}

                  <div className="flex items-center gap-4 mt-4 justify-center">
                    <a
                      href="mailto:info@gouvernance.ai"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="size-4" />
                    </a>
                    <a
                      href="tel:+15145551234"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="size-4" />
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-[#0A66C2] transition-colors"
                    >
                      <Linkedin className="size-4" />
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  MOBILE SUB-COMPONENTS                                              */
/* ------------------------------------------------------------------ */

function MobileNavLink({
  to,
  children,
  active,
  sub,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
  sub?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "block rounded-lg px-3 transition-colors",
        sub
          ? "py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-3"
          : "py-2.5 text-[15px] font-medium hover:bg-muted/50",
        active && !sub && "text-primary bg-primary/5",
      )}
    >
      {children}
    </Link>
  );
}
