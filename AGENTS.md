<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Roles live in `public.user_roles` and are granted only by the `handle_new_user` auth trigger (student by default; admin via server-only `admin_emails` or a claimed `legacy_users` row) — never from client data. Why: prevents privilege escalation.
- Users imported from the previous Replit app go into server-only `public.legacy_users` and are linked to a Cloud account on first verified Google sign-in by email. Why: keeps original IDs/roles without trusting the client.
- LMS operations use authenticated TanStack server functions and transactional database functions for approval, redemption, device registration, and progress; RLS scopes reads and admin writes. Why: concurrency and permission rules must survive direct API calls.
- A registered device is a browser token bound to an authenticated session ID; revoked sessions cannot silently re-register. Why: enforce the device limit without claiming reliable physical-device fingerprinting.
- Public media and prices may be unavailable until approved; course playback stays unavailable until a private signed-streaming provider is configured. Why: never expose permanent lesson URLs or invent production offers.
- Temporary stock footage is a separate public sample player, never a paid lesson or a substitute for signed course streaming. Why: enable sample playback without weakening enrollment and device controls.
- Hash-stored codes are delivered once to the admin for manual forwarding; replacing an unused code invalidates its previous value. Why: recover failed delivery without storing readable codes.
- Redemption attempt limits are persisted and enforced inside the locked database transaction; failures return null instead of raising after counting. Why: direct calls and rolled-back failures must not bypass the limiter.

- Payment availability is computed by a shared readiness rule and independently enforced in the order transaction; approving a price is explicit and changing it clears approval. Why: temporary offers or incomplete receiving details must never open payment collection.
- Browser profile updates are limited to display_name and revoked device checks cover every token in the same authenticated session. Why: identity spoofing and token rotation must not bypass trusted account/session boundaries.
- Mutating integration checks require explicit opt-in; default verification uses the current injected session for read-only checks only. Why: preserve real users and financial/access records during audits.
- Key the root AuthProvider/outlet subtree by its immediate child route, not pathname; this atomically replaces departed public/protected trees during hydration while preserving protected sibling state and the managed auth gate.
