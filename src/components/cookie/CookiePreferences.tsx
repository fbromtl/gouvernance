import { useState } from 'react';
import { Shield, Cookie, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface CookiePreferencesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
  const { consent, saveConsent } = useCookieConsent();
  const [functional, setFunctional] = useState(consent?.functional ?? false);

  const handleSave = () => {
    saveConsent(functional);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-brand-forest" />
            Gestion des cookies
          </DialogTitle>
          <DialogDescription>
            Conformément à la Loi 25 du Québec, vous pouvez gérer vos préférences de cookies.
            Les cookies essentiels ne peuvent pas être désactivés.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Essential */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4 bg-neutral-50">
            <div className="flex gap-3">
              <Cookie className="size-5 text-brand-forest shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cookies essentiels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nécessaires au fonctionnement du site : authentification, paiement sécurisé,
                  préférence de langue.
                </p>
              </div>
            </div>
            <Switch checked disabled aria-label="Cookies essentiels (toujours actifs)" />
          </div>

          <Separator />

          {/* Functional */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex gap-3">
              <MessageSquare className="size-5 text-brand-forest shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cookies fonctionnels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Améliorent votre expérience : sauvegarde du diagnostic en cours,
                  session du chat public.
                </p>
              </div>
            </div>
            <Switch
              checked={functional}
              onCheckedChange={setFunctional}
              aria-label="Cookies fonctionnels"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-brand-forest hover:bg-brand-teal">
            Enregistrer mes choix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
