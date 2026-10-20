# Pokemon Platinum Together Open Sourced - World Server

Standalone hosting configuration for co-op realm membership, signed connections, save storage and binary forwarding.
It runs without the Windows launcher. Use a normal Windows/Linux machine, VPS,
dedicated server or container host supporting long-lived TCP/WebSocket processes
and persistent writable storage. Static-site/shared PHP-only hosting will not run it.

**Development status:** This is a world backend deployment, not a finished dedicated game simulator. Native guest entry/synchronization, uninterrupted world simulation and custom story/map execution remain unfinished.
The Node backend tests establish protocol behavior and persistence; they do not
establish complete native gameplay. Read [verification](docs/verification.md).

## Download

**[Download the world backend hosting bundle — dev11 preview](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-world-server/releases/download/v0.1.0-dev.11/PokemonPlatinumTogetherOpenSourced-WorldServer-dev11.zip)**

The ZIP includes this deployment and its matching shared backend in sibling
folders. Extract the whole bundle, install Node.js 24.12 or newer, then follow
[First run](#first-run). Keep both folders together and enroll the owner locally
before exposing the listener.

[Release notes and SHA-256 checksum](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-world-server/releases/tag/v0.1.0-dev.11).
[All five projects and downloads](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-launcher#downloads).
The public dev11 build is the **Latest release** and remains a **development preview**.
It supplies protocol/storage services; unattended native game simulation and
custom map/story execution remain unfinished. For player-hosted relay co-op,
use the [combined backend guide](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-launcher/blob/main/PrivateServer/docs/server-hosting.md).

## Projects

- [Shared server engine](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-server)
- [Launcher, mail tool and main documentation](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-launcher)
- [Map Studio](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-editors)
- [Inverna deployment](https://github.com/dr4lera/pokemon-platinum-together-open-sourced-inverna-server) - sibling hosting project.

These hosting repositories are development source previews. Use the matching
shared-engine revision; older commits may lack configuration and role separation.
The native gameplay limitations above still apply.

## Layout and requirements

Install Node 24.12+ including `node:sqlite`, and Git when obtaining source. Keep
the shared backend and this repository as siblings:

```text
hosting/
  pokemon-platinum-together-open-sourced-server/         # shared backend code
  pokemon-platinum-together-open-sourced-world-server/  # this deployment
    server.example.json
    server.json                # your config, ignored by Git
    Data/                      # private identity, SQLite, plugins and saves
```

No ROM/game files are supplied or required for the Node protocol/storage service.
Native game clients and any eventual world runtime require their own compatible
game assets. Upload only source/config templates to a hosting provider; transfer
your actual private data through the provider's protected storage mechanism.

## First run

1. Obtain both projects and place them as shown above.
2. Copy `server.example.json` to `server.json`. Keep `role` set to `world`.
3. Set `network.publicUrl` to your reachable HTTP(S) origin. For a local-only test
   leave it null and use `127.0.0.1:8789`. Never advertise `0.0.0.0` to players.
4. Run `node start.mjs --check`. Paths resolve relative to the config file.
5. Enroll the first owner **locally before exposing the listener**:

```sh
node ../pokemon-platinum-together-open-sourced-server/main.mjs enroll --data ./Data --name HostName --url http://127.0.0.1:8789 --out ./Data/launcher-player.json
node start.mjs
```

Enrollment is once only; it refuses to overwrite an existing profile. Preserve
that owner profile. It signs local administration requests. To keep public
clients from reaching startup during enrollment, enroll before starting the backend.
Use Node 24.12+; older runtimes fail with a version message. Startup rejects
unknown, duplicate and missing-path options before touching configuration.
`--check` reads an existing config without creating files/data or a listener;
copy the example explicitly first. `--help` is read-only.

Start accepts `--backend /path/to/pokemon-platinum-together-open-sourced-server` and `--config /path/server.json`.
`PT_BACKEND_DIR` is another way to locate the shared engine.

Check `http://127.0.0.1:8789/health` and `/private/server-info`. These are public
metadata endpoints; they contain no signing seed. The role should be `world`.
The health response intentionally reports unfinished native verification.

## Host on Linux or a VPS

1. Put the projects under `/srv`, install a supported Node runtime and create a
   non-root `platinum` service user. Give that user ownership of this deployment's
   `Data` folder; preserve restrictive permissions on account keys.
2. Edit paths/user names in `plat-world.service` for your installation.
3. Install the unit in `/etc/systemd/system`, run `systemctl daemon-reload`, then
   `systemctl enable --now plat-world`. Inspect `journalctl -u plat-world`.
4. Use HTTPS/WSS through a reverse proxy or your own tunnel. Preserve WebSocket
   upgrades for `/lobby`, `/realm` and `/relay`. Point `network.publicUrl` at that origin.
5. Keep the listener behind your chosen firewall/proxy. A public VPS can expose
   an appropriate port directly; a home host may use an outbound relay.

The owner CLI runs on the host with its local owner profile. Do not share that
profile with players or expose a generic remote command interface.

## Docker

Create `server.json` and `Data` first. `Data` must be writable by container UID
1000 (`node`). On Linux, assign ownership to that UID. Then:

```sh
docker compose build
docker compose up -d
docker compose logs -f
docker compose stop
```

The build context is the shared backend sibling, so unrelated workstation files
are not sent as build context. The config is mounted read-only and `Data` persists
on the host. The sample port publishes on host loopback; put a TLS proxy/tunnel
there, or deliberately change the published host address for your hosting setup.
Keep the internal port and config port consistent. Docker/service recipes have
been prepared but have not yet been executed on a Linux host in this workspace.

## Windows host

Run `node start.mjs` in a terminal, or configure Task Scheduler to start
`node.exe` with the full `start.mjs` path at boot and this directory as the working
folder. Keep it running after sign-out if required. Stop with Ctrl+C and wait for
the process to finish before backups. The launcher is not the server supervisor.

## Internet relay / reverse proxy

For a temporary address, run your installed `cloudflared tunnel --url
http://127.0.0.1:8789` on the host. Put the resulting HTTPS origin in
`network.publicUrl`, then restart the backend. The address changes on tunnel
recreation. A stable named tunnel requires your own account/domain setup.
For local Cloudflare client-IP bans, enable `network.trustedLoopbackProxy` only
when the tunnel connects through loopback. Ordinary non-loopback forwarded IP
headers are ignored. Existing provider TLS proxies may need provider-specific
configuration; this implementation does not trust arbitrary proxy headers.

## Administration, plugins and backups

See [configuration](docs/server-config.md) and [owner administration/plugin API](docs/moderation-and-plugins.md).
Use the shared backend's `main.mjs moderate` CLI with your local owner profile.
User/IP bans persist in SQLite. Plugin code lives in `Data/Plugins/<id>` and
runs with the host account's OS permissions. No admin controls are added to the launcher.

Stop clients, stop the backend, then back up the **entire Data folder together**.
It contains the server signing identity, database, keys/receipts and plugin state.
Do not copy a live database file without its WAL. Restore one consistent snapshot,
preserve identity and validate config before restarting. Do not run two processes
against the same data directory.

## Players and joined worlds

Players select the server address in the existing launcher Name tab and can
return through its saved server list. Each server has its own unique usernames
and account identity. Joined-world history is recorded only after authenticated
realm/relay entry and survives restarts. Invitations alone do not add history.
The existing World hosting tab displays the selected server's connection history.
Cross-server account federation and native world handoff remain pending.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Unknown config setting | Use the documented schema; typos fail rather than silently changing behavior. |
| Address already in use | Stop the other process or change the config port and public origin. |
| Remote player cannot connect | Public origin, DNS/TLS, firewall, WebSocket upgrades, host awake and tunnel running. |
| Name taken | Restore that identity backup or choose a different unique name on this server. |
| Server identity changed | Restore the correct data snapshot; do not replace a trust pin blindly. |
| Banned by mistake | Local owner `unban-user` / `unban-ip`; signed local recovery remains available. |
| Plugin failed | Check its manifest/entry and worker state, then reload trusted code. |
| Game cannot enter a world | Native synchronization is unfinished; storage tests are not gameplay verification. |

GPL-3.0-or-later for this project. Preserve the shared backend's notices and the
original game creators' credits. No proprietary game assets are distributed here.
