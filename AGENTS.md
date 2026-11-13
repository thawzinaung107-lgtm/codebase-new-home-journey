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
- Hash-stored codes are delivered once to the admin for manual forwarding; replacing an unused code invalidates its previous value. Why: recover failed delivery without storing readable codes.
