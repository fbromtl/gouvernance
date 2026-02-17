import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cgu_accepted: boolean;
  created_at: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  acceptCgu: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  CONTEXT                                                            */
/* ------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  PROVIDER                                                           */
/* ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch / upsert profile ----------------------------- */

  const fetchOrCreateProfile = async (authUser: User) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      setProfile(data as Profile);
      return;
    }

    const newProfile = {
      id: authUser.id,
      full_name:
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        null,
      avatar_url:
        authUser.user_metadata?.avatar_url ??
        authUser.user_metadata?.picture ??
        null,
      cgu_accepted: false,
    };

    const { data: created } = await supabase
      .from("profiles")
      .upsert([newProfile])
      .select()
      .single();

    setProfile((created as Profile) ?? (newProfile as Profile));
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data as Profile);
  };

  /* ---------- auth state listener -------------------------------- */

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchOrCreateProfile(authUser).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchOrCreateProfile(authUser).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- actions -------------------------------------------- */

  const signInWithGoogle = async (): Promise<AuthResult> => {
    if (!supabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { success: false, error: error.message };
      if (data?.url) window.location.href = data.url;
      return { success: true };
    } catch {
      return { success: false, error: "Erreur inattendue lors de la connexion Google." };
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    if (!supabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message === "Invalid login credentials") {
        return { success: false, error: "Courriel ou mot de passe incorrect." };
      }
      if (error.message === "Email not confirmed") {
        return { success: false, error: "Veuillez confirmer votre courriel avant de vous connecter. Vérifiez votre boîte de réception." };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> => {
    if (!supabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      if (error.message.includes("already registered")) {
        return { success: false, error: "Ce courriel est déjà utilisé. Essayez de vous connecter." };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!supabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    if (!supabaseConfigured) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateProfile = async (
    data: { full_name?: string; avatar_url?: string }
  ): Promise<AuthResult> => {
    if (!user || !supabaseConfigured) {
      return { success: false, error: "Non authentifié." };
    }
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);
    if (error) return { success: false, error: error.message };
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    return { success: true };
  };

  const signOut = async () => {
    if (!supabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const acceptCgu = async () => {
    if (!user || !supabaseConfigured) return;
    await supabase
      .from("profiles")
      .update({ cgu_accepted: true })
      .eq("id", user.id);
    setProfile((prev) => (prev ? { ...prev, cgu_accepted: true } : null));
  };

  /* ---------- render --------------------------------------------- */

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        updateProfile,
        signOut,
        acceptCgu,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  HOOK                                                               */
/* ------------------------------------------------------------------ */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
