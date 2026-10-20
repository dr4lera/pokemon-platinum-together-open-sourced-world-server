# Verification and release gates

Role: `world`. Development preview; not a completed native-game server release.

Verified locally: shared backend tests cover role enforcement, authenticated
connections, identity ownership, storage, relay ticket/proof, binary routing,
joined-world history and privacy, bans, plugin failure isolation and config types.
The Windows launcher builds with no warnings. Linux/systemd/Docker deployment and
native guest gameplay are not yet verified. No finished dedicated world runtime
is shipped. Source is published as a development preview; a finished gameplay release waits for the required native checks.

Standalone Windows smoke test also passed: start wrapper, role metadata, health,
owner-signed shutdown and clean wrapper exit using a temporary deployment.


## Dev11 deployment checks

The wrapper now rejects unknown/duplicate/missing arguments, enforces Node
24.12+, and leaves absent configs untouched. Local Windows tests execute both
read-only validation and a real owner enrollment → backend start → role/health
query → signed shutdown → clean wrapper exit. The matching shared engine passes
28 tests, including the 0.1.7 relay-ready contract. Run `npm test` with the matching
backend beside this repository (or set `PT_BACKEND_DIR`). A Windows/Linux Actions
matrix runs the same deployment tests; consult its result for executed platforms.
These checks do not supply an unattended native game simulator.
