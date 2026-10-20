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
