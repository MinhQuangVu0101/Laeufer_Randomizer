# TODO

## Du nimmst dir das beim nächsten Mal vor

- [ ] **App komplett durchprobieren** — alle Flows mit dem aktuellen Code:
  - [ ] Position-Modus: Generieren mit aktuellem Kader (23 Spieler), Regenerate-Button, Bench-Edge-Cases.
  - [ ] Simple-Modus: ein paar Namen rein, Generieren, Crossmode-Hint klicken.
  - [ ] Roster speichern / laden / löschen.
  - [ ] Copy-Button, PNG-Export, PDF-Export.
  - [ ] DE/EN Sprachumschalten.
  - [ ] Dark / Light Mode.
  - [ ] OTP-Login mit korrigiertem Email-Template (`{{ .Token }}`).
  - [ ] SyncWizard: alle drei Optionen testen (Hier→Cloud, Cloud→Hier, Merge).
  - [ ] Cross-Device-Sync im Inkognito-Fenster mit derselben Email.
  - [ ] PWA-Installation auf iOS / Android, dann Drag-and-Drop testen.

- [ ] **Setup / Architektur nochmal überlegen** — bevor mehr Features:
  - [ ] Roster-Sharing (Share-Token + Read-only-Sicht) — Backlog-Idee.
  - [ ] Lohnt sich der Aufwand für Supabase oder doch lieber lokal-only mit Export/Import?
  - [ ] Eigener Domain-Name statt `*.github.io`?
  - [ ] Wer hat Schreibrecht — nur ich, oder die Spieler selbst (mit eingeschränkten Rechten)?
  - [ ] Brauche ich Realtime-Subscriptions oder reicht der Pull beim Login?
  - [ ] Bundle-Größe im Auge behalten (aktuell ~39 KB initial gzipped).

## Bekannte offene Punkte (nicht blockierend)

- iOS Safari Standalone Smoke-Test für `svelte-dnd-action` (OV#5) — braucht echtes Gerät.
- Phase 7b: Realtime-Subscriptions + Quiet-Flag in Settern (nur wenn Realtime aktiv).
