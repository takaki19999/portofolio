# Portfolio on Railway

This repository can be deployed from its root: the root `railway.json` builds and starts the `portofolio` subproject. Alternatively set Railway's **Root Directory** to `portofolio`, which uses that folder's `railway.json`. Add a Railway PostgreSQL service, then expose its `DATABASE_URL` to this service.

The public portfolio is `/`; the management dashboard is `/manager`. Activity records are stored in PostgreSQL, and the dashboard polls every 10 seconds. Enable browser notifications from the manager page to receive new-activity alerts. Notifications always require the manager's browser permission.

## Windows launcher

`a.exe` and `b.exe` are compiled binary inputs. They cannot safely be combined without their source code. Use a standard launcher/installer build step (for example NSIS or electron-builder) to package both unchanged files. Set the launcher icon from `a.exe` and make the launcher start the intended child program(s) visibly and with user consent. Do not deploy either Windows executable to Railway; Railway runs the web service on Linux.
