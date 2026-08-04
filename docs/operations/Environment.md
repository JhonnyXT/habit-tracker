# Environment

> Development, preview, and production environment configuration.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Environment |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | operations/Deployment.md |

---

# Purpose

Define what differs between the environments a build can run in, given this application's unusually simple environment story: no backend, no API base URLs to swap, no remote environment-specific secrets to manage (per `decisions/ADR-002.md` and `decisions/ADR-004.md`).

---

# Why This Is Simpler Than a Typical App

Most "Environment" documents primarily manage per-environment API endpoints, keys, and feature flags for a networked backend. This application has none of that: it has no server (ADR-002), no remote analytics/crash reporting (ADR-004), and no remote feature flag system. Environment differences here are almost entirely about **build configuration and debug tooling**, not remote service endpoints.

---

# Environments / Build Variants

Matching `operations/Deployment.md`'s build variants. Selected with `APP_VARIANT`; identity resolved by the table at the top of `app.config.ts` (`decisions/ADR-007.md`).

## `dev` — `com.habittracker.app`

- Debug tooling enabled: verbose logging (`standards/Logging.md`'s `debug` level), Metro and Fast Refresh, React DevTools.
- TypeScript strict mode and linting still fully enforced (`standards/Coding-Standards.md`) — "development" relaxes debug tooling, never code quality bars.
- Its SQLite database is the maintainer's working copy, safe to reset and reseed freely, including the realistic multi-year seeded datasets used in `reviews/06-Optimization.md`.
- Settings shows a "Tipo de build" row reading "Desarrollo".

## `test` — `com.habittracker.app.test`

- Release build (minified, Proguard, JS bundle embedded, no Metro) distributed by `adb install` or by handing over the APK, rather than through the public store. Debug-signed, since Play never sees it.
- Debug-only tooling from `dev` is stripped, so `test` accurately reflects what QA (`reviews/07-QA.md`) and Principal Engineer Review (`reviews/08-Principal-Engineer-Review.md`) will actually ship.
- Its own `applicationId` means its own app sandbox, so it starts with an empty database and QA never touches real habit history. This is the point of the variant.
- Settings still shows the "Tipo de build" row, reading "Pruebas".

## `prod` — `com.habittracker`

- The exact configuration submitted to Google Play — no debug tooling, `debug`-level logs stripped (`standards/Logging.md`), notification entitlements at their production values.
- The "Tipo de build" row is hidden.

---

# Configuration Management

- Build-time configuration (app identifiers, URL schemes, icons, permissions) lives in `app.config.ts`, keyed by variant and checked into version control — not manually edited per machine. `eas.json` maps the same three names onto EAS Build profiles.
- An unrecognised `APP_VARIANT` throws at config resolution rather than defaulting, so a typo fails the build instead of producing a mislabelled binary.
- There are no runtime environment variables pointing at different servers, since there is no server to point at (ADR-002) — this significantly reduces the surface area a typical `Environment.md` would need to cover (no secrets rotation, no per-environment API keys).
- The variant is readable at runtime from `src/core/config/` (`appVariant`, `isDev`, `isTest`, `isProd`), which is the only supported way for application code to branch on it.

---

# Local Developer Setup

- A new contributor (or AI assistant) should be able to run the `dev` variant using only the checked-in configuration: `npm install`, then `npm run build:dev`, then `npm start`. No undocumented manual steps or environment variables beyond `ANDROID_HOME` and `JAVA_HOME`, which `scripts/build-android.sh` defaults sensibly.
- `eas login` is needed only for `prod`.

---

# Related Documents

- `operations/Deployment.md` — the build profiles this document elaborates on.
- `decisions/ADR-002.md`, `decisions/ADR-004.md` — why this document has no server/API-endpoint or remote-telemetry configuration to manage.
- `standards/Logging.md` — debug tooling differences between environments.
- `decisions/ADR-007.md` — the decision that produced these three variants and their identifiers.

---

**End of Document**
