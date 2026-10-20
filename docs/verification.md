# Verification — dev12

Role: `world`. Uses the matching dev12 shared backend (revision 6).

All 40 shared-backend tests pass. They cover native relay routing, city frames,
trainer appearance/name preservation, host-in-city allocation refusal, optional
friend codes, owned native PTTR transport, signed accounts, storage and config.
Windows wrapper tests cover strict arguments, read-only checks, real startup,
role/health metadata, owner-signed shutdown and clean exit. Windows/Linux CI is
configured; consult Actions for the platforms actually executed.

The user confirmed native gameplay, friend battles and trading on matching
prepared 0.1.7 clients with the **combined** backend. This does not establish
cross-server federation or unrestricted player-world visits on this separate
role. Unattended native simulation, public matchmaking, custom map/story
execution and interrupted battle/trade recovery remain unfinished or unverified.
No game binary, ROM, saves, keys or native simulator is supplied.
