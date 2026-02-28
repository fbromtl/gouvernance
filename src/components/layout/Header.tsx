import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  X,
  Linkedin,
  Mail,
  Phone,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Shield,
  Globe,
  Users,
  Newspaper,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
    setSearchOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (path: string) => {
    const basePath = path.split("#")[0];
    if (basePath === "/") return location.pathname === "/";
    return location.pathname.startsWith(basePath);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Search:", searchQuery);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleDropdownEnter = (id: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(id);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const close = () => setOpenDropdown(null);

  /* ---------------------------------------------------------------- */
  /*  NAV LINK + DROPDOWN TRIGGER                                      */
  /* ---------------------------------------------------------------- */

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors relative",
        "text-foreground/70 hover:text-foreground",
        isActive(to) && "text-primary"
      )}
    >
      {children}
      {isActive(to) && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );

  const DropdownTrigger = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative",
        "text-foreground/70 hover:text-foreground",
        (openDropdown === id || isActive("/" + id)) && "text-primary"
      )}
    >
      {children}
      <ChevronDown className={cn(
        "size-3.5 transition-transform duration-200",
        openDropdown === id && "rotate-180"
      )} />
      {isActive("/" + (id === "about" ? "a-propos" : id)) && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );

  /* ---------------------------------------------------------------- */
  /*  MEGA DROPDOWN: LE CERCLE (About + Experts + Événements + Orgs)   */
  /* ---------------------------------------------------------------- */

  const renderCercleMega = () => (
    <div
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 w-[720px]",
        openDropdown === "cercle" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
      )}
    >
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-border/50 overflow-hidden">
        <div className="grid grid-cols-5">
          {/* Col 1 — À propos */}
          <div className="col-span-2 p-5 border-r border-border/40">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 px-2">Le Cercle</p>
            {[
              { to: "/a-propos", label: "Notre mission", desc: "Vision et valeurs fondatrices", icon: Shield },
              { to: "/a-propos#approche", label: "Notre approche", desc: "Cadres de référence et méthodologie", icon: BookOpen },
              { to: "/a-propos#gouvernance", label: "Gouvernance du cercle", desc: "Structure et charte éthique", icon: Globe },
              { to: "/experts", label: "Nos experts", desc: "150+ experts, 15 disciplines", icon: Users },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                className={cn(
                  "flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors group hover:bg-primary/5",
                  isActive(item.to) && "bg-primary/5"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary mt-0.5 group-hover:bg-primary/12 transition-colors">
                  <item.icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                  <div className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Col 2 — Pages */}
          <div className="col-span-1 p-5 border-r border-border/40">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 px-1">Communauté</p>
            {[
              { to: "/actualites", label: "Actualités", icon: Newspaper },
              { to: "/contact", label: "Contact", icon: Mail },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-1 py-2 text-sm transition-colors hover:text-primary",
                  isActive(item.to) ? "text-primary font-medium" : "text-foreground/70"
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Col 3 — CTA card */}
          <div className="col-span-2 bg-gradient-to-br from-[#1e1a30] to-[#2d1f4e] p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Rejoignez-nous</p>
              <p className="text-sm font-bold text-white leading-snug mb-2">
                Intégrez un réseau de 150+ experts en gouvernance de l&apos;IA
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                Accédez à des ressources exclusives, des événements et du mentorat.
              </p>
            </div>
            <Link
              to="/rejoindre"
              onClick={close}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple-light hover:text-white transition-colors"
            >
              Rejoindre le Cercle
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* MAIN NAVIGATION BAR */}
      <div className={cn(
        "bg-white/98 backdrop-blur-md border-b transition-shadow duration-300",
        scrolled ? "shadow-md border-border/50" : "border-border/30 shadow-sm"
      )}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-85 transition-opacity shrink-0">
            <img
              src="/logo.svg"
              alt="Cercle de Gouvernance de l'IA"
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation — Simplified: 4 items */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-0.5">
              <NavLink to="/">Accueil</NavLink>

              {/* Le Cercle mega */}
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter("cercle")}
                onMouseLeave={handleDropdownLeave}
              >
                <DropdownTrigger id="cercle">Le Cercle</DropdownTrigger>
                {renderCercleMega()}
              </div>

              <NavLink to="/ressources">Ressources</NavLink>

              <NavLink to="/tarifs">Adhésion</NavLink>
            </div>

            <Separator orientation="vertical" className="h-6 mx-3" />

            {/* Utility icons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center justify-center size-9 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Rechercher"
              >
                <Search className="size-4" />
              </button>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full text-foreground/60 hover:text-[#0A66C2] hover:bg-blue-50 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
            </div>

            {/* CTA + Auth */}
            <div className="flex items-center gap-2 ml-3">
              {!authLoading && !user && (
                <Link
                  to="/connexion"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                >
                  Se connecter
                </Link>
              )}

              <Button asChild size="sm" className="px-5">
                <Link to="/rejoindre">Inscription gratuite</Link>
              </Button>

              {!authLoading && user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-muted/60 transition-colors"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="size-8 rounded-full object-cover border-2 border-brand-purple/30"
                        referrerPolicy="no-referrer"
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
          </nav>

          {/* Mobile / Tablet */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center size-9 rounded-full text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Rechercher"
            >
              <Search className="size-4" />
            </button>

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
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="size-8 rounded-full object-cover border-2 border-brand-purple/30"
                    referrerPolicy="no-referrer"
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
                  <img src="/logo.svg" alt="Cercle de Gouvernance de l'IA" className="h-8 w-auto" />
                </div>

                {/* Mobile Nav */}
                <nav className="px-4 py-4 space-y-1">
                  <MobileNavLink to="/" active={isActive("/")}>Accueil</MobileNavLink>

                  <MobileDropdown label="Le Cercle" active={isActive("/a-propos") || isActive("/experts")}>
                    <MobileNavLink to="/a-propos" active={isActive("/a-propos")} sub>Notre mission</MobileNavLink>
                    <MobileNavLink to="/a-propos#approche" sub>Notre approche</MobileNavLink>
                    <MobileNavLink to="/a-propos#gouvernance" sub>Gouvernance du cercle</MobileNavLink>
                    <MobileNavLink to="/experts" active={isActive("/experts")} sub>Nos experts</MobileNavLink>
                    <MobileNavLink to="/actualites" active={isActive("/actualites")} sub>Actualités</MobileNavLink>
                  </MobileDropdown>

                  <MobileNavLink to="/ressources" active={isActive("/ressources")}>Ressources</MobileNavLink>

                  <MobileNavLink to="/tarifs" active={isActive("/tarifs")}>Adhésion</MobileNavLink>
                  <MobileNavLink to="/contact" active={isActive("/contact")}>Contact</MobileNavLink>
                </nav>

                {/* Mobile Footer */}
                <div className="px-6 py-4 border-t border-border/50 mt-2 space-y-3">
                  {!authLoading && user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-2">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="size-9 rounded-full object-cover border-2 border-border/50"
                          referrerPolicy="no-referrer"
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

                  <Button asChild className="w-full">
                    <Link to="/rejoindre">Inscription gratuite</Link>
                  </Button>

                  {!authLoading && !user && (
                    <Button asChild variant="outline" className="w-full gap-2">
                      <Link to="/connexion">
                        <LogIn className="size-4" />
                        Se connecter
                      </Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-4 mt-4 justify-center">
                    <a href="mailto:info@gouvernance.ai" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="size-4" />
                    </a>
                    <a href="tel:+15145551234" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Phone className="size-4" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0A66C2] transition-colors">
                      <Linkedin className="size-4" />
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 border-t",
          searchOpen ? "max-h-16 border-border/30" : "max-h-0 border-transparent"
        )}>
          <div className="mx-auto max-w-2xl px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Rechercher sur le site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-full border-border/60 focus-visible:ring-primary/30"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer la recherche"
              >
                <X className="size-4" />
              </button>
            </form>
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
        sub ? "py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-3" : "py-2.5 text-[15px] font-medium hover:bg-muted/50",
        active && !sub && "text-primary bg-primary/5",
      )}
    >
      {children}
    </Link>
  );
}

function MobileDropdown({
  label,
  children,
  active,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-[15px] font-medium hover:bg-muted/50 transition-colors",
          active && "text-primary bg-primary/5"
        )}
      >
        {label}
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        open ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}
