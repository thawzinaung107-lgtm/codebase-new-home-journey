# Bunny Stream — owner setup, not connected

Status: **UNCONFIGURED / PLAYBACK BLOCKED**. This document does not create a library, purchase service, connect Bunny, or authorize publication. Keep the existing Lovable Cloud/database and keep this project unpublished. Do not send keys in chat or commit credentials.

## 1. Create the library yourself when ready
1. Sign in to your own Bunny account. Review current storage, delivery, minimum monthly usage, replication and optional DRM costs before proceeding. Creating/uploading may incur charges; nothing has been purchased by Lovable.
2. Open Stream and create a video library named **AI Marketing Academy LMS**.
3. Choose **Standard** for broader network coverage/low latency, or **Volume** for lower-cost large video delivery using fewer locations. These are delivery tiers, not the free-versus-premium encoding options. Standard is a reasonable initial choice for Myanmar testing, but neither tier guarantees Myanmar reachability. Compare actual local-network results before choosing for production. [Delivery tiers](https://bunny.net/docs/stream/delivery-tiers), [pricing](https://bunny.net/docs/stream/pricing).
4. Review storage replication locations. If Singapore is offered for this library/account, optionally enable it after reviewing the extra storage cost. It is replication, not a guarantee of Singapore-only delivery or Myanmar availability.

## 2. Protect the library before uploading
1. In the library's Security settings, enable **Embed view token authentication** for the Bunny player. Later the app must authorize the actual student, active enrollment, unexpired access and current registered nonrevoked session before issuing a short-lived signed embed. An unsigned embed must fail. [Embed token authentication](https://bunny.net/docs/stream/token-authentication).
2. Configure allowed domains/referrer restrictions for only the actual app origins. Current Lovable preview host: `id-preview--57ce9992-64d0-4435-8a61-143476b51606.lovable.app`. The localhost test origin is not the hosted preview origin; only add a local test host if deliberately needed and supported. Do not allow all Lovable domains with a broad wildcard.
3. The reserved primary host `codebase-new-home-journey.lovable.app` is **not currently published**. No custom domain is configured. If an owner later separately authorizes publication or a custom domain, update allowed domains to those actual hosts; do not change DNS or visibility now. Follow Bunny's field format (host/domain versus URL) and check the actual request referrer. Referrer restrictions supplement authorization; they are not a substitute for it.
4. Embed tokens protect the iframe, not automatically every alternate media path. Review **CDN token authentication** on the Stream-associated Pull Zone to protect direct media URLs; coordinate this with the future player integration so HLS playlists and segments continue working. Do not simply enable a setting and assume media is secured. Bunny documents separate embed and CDN protection layers. [Stream security](https://bunny.net/docs/stream/security).
5. In Encoding, disable **MP4 fallback** and **Keep original files** before the demo upload where available. Do not expose original/download/direct-play/MP4 URLs in the LMS or add an insecure fallback when signing fails. These settings alone do not protect HLS or eliminate all stable media URLs. Existing uploaded encodings may need separate cleanup; check Bunny's options rather than assuming a switch deletes prior files. [Encoding](https://bunny.net/docs/stream/encoding), [storage structure](https://bunny.net/docs/stream/storage-structure).
6. DRM is optional and may carry extra costs/device constraints; it is not required for this initial setup. Tokens/referrer checks cannot prevent all screen recording or authorized-user copying. Assess DRM only after basic protected playback is proven.

## 3. Upload an owner-owned short demo
1. Upload a short MP4 you own or are licensed to use through Stream → this library → Manage library.
2. Wait for processing to finish. Record its video GUID and library ID (identifiers, not keys).
3. Do not create a fake paid lesson or enrollment to test it. The existing public stock sample remains separate from course playback. No permanent embed should be pasted into the app now.

## 4. Distinguish the keys, then configure securely later
| Setting name | Where the owner obtains it | Handling |
| --- | --- | --- |
| `BUNNY_STREAM_LIBRARY_ID` | Library identifier | Nonsecret configuration; may be stored alongside the secure configuration for convenience. |
| `BUNNY_STREAM_API_KEY` | This Stream library's API page/key | **Secret** for library API management; not the account-wide API key and not an embed signing key. |
| `BUNNY_STREAM_TOKEN_KEY` | Library Security → Token authentication key card | **Secret** for playback signing. Bunny may label this field “API key”; it is different from the library Stream API key. Verify CDN signing configuration against Bunny documentation; do not substitute a generic CDN/account key. |
| `BUNNY_STREAM_PLAYER_HOSTNAME` (optional) | Actual supported Bunny player host or separately configured player host | Nonsecret hostname only; not the app domain. Default documented player host is `player.mediadelivery.net`. |
| `BUNNY_STREAM_VIDEO_GUID` (optional demo mapping) | Uploaded demo video's identifier | Nonsecret identifier; not proof of authorization or playback readiness. |

When ready for a separately requested integration, add the two private keys yourself in **Project Settings → Secrets**, under the exact names above. Never put them in a frontend environment variable, source code, this document, screenshots, chat, or a committed `.env`. Do not generate random substitutes: these values must come from Bunny. No credentials were collected, saved, printed or requested during this task.

Adding settings alone does **not** connect Bunny: the authenticated server signing and lesson mapping still need implementation and verification. Playback remains blocked until that work is explicitly requested and completed. [Server signing and key distinction](https://bunny.net/docs/stream/player/signed-embeds).

## 5. Acceptance before any launch
- Real owner Google admin access, consenting student's admin denial, two allowed browsers/third denied, real device revocation/new-session recovery and real server logout rejection remain HUMAN REQUIRED.
- Verify unsigned/expired/wrong-video embed denial, alternate/direct/original/MP4 and HLS protection, allowlisted preview referrer, no key in browser/network responses, and existing enrollment/session/device enforcement.
- Test short token expiry and denial of new streams after course expiry/device revocation; existing buffered playback may outlast the authorization check, so record the actual behavior.
- Real Myanmar desktop/mobile, local broadband/mobile data, no VPN: start, sustained playback, seek/resume, reconnect and denial paths. A public stock sample is not a protected streaming test.
- Keep money collection closed until separately approved real prices, access terms, receiving details and legitimate payment workflow tests exist. DEMO instructions are never real receiving details.
- Do not publish, deploy, change domain, create Bunny resources or incur charges on the owner's behalf.