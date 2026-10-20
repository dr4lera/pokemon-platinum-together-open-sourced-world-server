# World hosting changes

## 0.1.0-dev.12 — 2026-10-20

- Bundle the matching revision 6 backend with the standalone world profile.
- Retain signed realm membership, storage and binary-forwarding services.
- Validate the shared backend revision before startup.
- Keep world-role restrictions: city entry and friend-code creation stay disabled.

Both wrapper checks pass, including disposable real startup and signed shutdown.
This role provides protocol/storage services. Unattended game simulation and
cross-server federation are unfinished. User-confirmed native battles/trades
used the combined backend and matching prepared 0.1.7 clients; the independent
source client is still being rebuilt.

Extract both sibling folders, use Node.js 24.12+, and preserve existing data,
owner keys and configuration when upgrading.
