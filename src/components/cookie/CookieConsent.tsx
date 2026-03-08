import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookiePreferences } from './CookiePreferences';

export function CookieConsent() {
  const { showBanner, acceptAll, refuseAll } = useCookieConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl"
          >
            <div className="rounded-2xl bg-[#0e0f19] p-4 sm:p-5 shadow-2xl border border-white/10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                {/* Text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-forest/20">
                    <Cookie className="size-4 text-brand-sage" />
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Ce site utilise des cookies essentiels et fonctionnels pour améliorer votre
                    expérience.{' '}
                    <Link
                      to="/confidentialite"
                      className="text-brand-sage hover:text-white underline underline-offset-2 transition-colors"
                    >
                      Politique de confidentialité
                    </Link>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => setPrefsOpen(true)}
                    className="text-xs text-white/50 hover:text-white/80 transition-colors whitespace-nowrap"
                  >
                    Personnaliser
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refuseAll}
                    className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent rounded-full text-xs"
                  >
                    Refuser
                  </Button>
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="bg-brand-forest hover:bg-brand-teal text-white rounded-full text-xs"
                  >
                    Accepter
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferences open={prefsOpen} onOpenChange={setPrefsOpen} />
    </>
  );
}
