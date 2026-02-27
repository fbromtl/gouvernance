import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Globe, FileDown, LogIn } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicDocuments } from "@/hooks/usePublicDocuments";
import { useAuth } from "@/lib/auth";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { JURISDICTIONS } from "@/types/public-documents";
import type { Jurisdiction, PublicDocument } from "@/types/public-documents";

export function DocumentLibrary({ mode = "public" }: { mode?: "public" | "portail" }) {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("quebec");
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { data: categories, isLoading } = usePublicDocuments(jurisdiction);
  const navigate = useNavigate();

  const handleConsult = useCallback((doc: PublicDocument) => {
    if (mode === "portail") {
      window.open(doc.file_url, "_blank");
      return;
    }
    // public mode: always show login prompt
    setPendingUrl(doc.file_url);
    setLoginOpen(true);
  }, [mode]);

  const handleLoginSuccess = useCallback(() => {
    if (mode === "public") {
      navigate("/bibliotheque");
      return;
    }
    if (pendingUrl) {
      window.open(pendingUrl, "_blank");
      setPendingUrl(null);
    }
  }, [mode, pendingUrl, navigate]);

  return (
    <>
      <section id="guides" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium border-purple-200 text-purple-700 bg-purple-50">
              Bibliothèque documentaire
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Cadres et références par juridiction
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lois, guides, déclarations et cadres de gouvernance de l'IA —
              organisés par pays et province. Accès aux documents réservé aux membres.
            </p>
          </motion.div>

          {/* Jurisdiction tabs */}
          <Tabs value={jurisdiction} onValueChange={(v) => setJurisdiction(v as Jurisdiction)} className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto rounded-full bg-neutral-100 border border-neutral-200 p-1.5">
              {JURISDICTIONS.map((j) => (
                <TabsTrigger
                  key={j.value}
                  value={j.value}
                  className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {j.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-8">
              {JURISDICTIONS.map((j) => (
                <TabsContent key={j.value} value={j.value}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Accordion type="multiple" className="space-y-3">
                      {categories.map((cat) => (
                        <AccordionItem
                          key={cat.slug}
                          value={cat.slug}
                          className="border border-neutral-200 rounded-2xl px-5 overflow-hidden"
                        >
                          <AccordionTrigger className="hover:no-underline py-5">
                            <div className="flex items-center gap-3 text-left">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 shrink-0">
                                <FileText className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{cat.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                              </div>
                              <Badge variant="secondary" className="ml-auto mr-2 shrink-0">
                                {cat.documents.length} doc{cat.documents.length > 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-5">
                            <div className="space-y-3">
                              {cat.documents.map((doc) => (
                                <DocumentCard key={doc.id} doc={doc} onConsult={() => handleConsult(doc)} mode={mode} />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Card className="rounded-2xl border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Documents à venir</p>
                        <p className="text-sm mt-1">La bibliothèque pour cette juridiction est en cours de préparation.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </section>

      {mode === "public" && (
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

function DocumentCard({ doc, onConsult, mode = "public" }: { doc: PublicDocument; onConsult: () => void; mode?: "public" | "portail" }) {
  return (
    <Card className="rounded-xl border-neutral-200 hover:border-purple-200 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                {doc.file_type.toUpperCase()}
              </Badge>
              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
            </div>
            {(doc.summary_purpose || doc.summary_content || doc.summary_governance) && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {doc.summary_purpose && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_purpose}</span>
                  </li>
                )}
                {doc.summary_content && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_content}</span>
                  </li>
                )}
                {doc.summary_governance && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_governance}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            onClick={onConsult}
          >
            {mode === "portail" ? (
              <FileDown className="h-3.5 w-3.5" />
            ) : (
              <LogIn className="h-3.5 w-3.5" />
            )}
            {mode === "portail" ? "Consulter" : "Se connecter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
