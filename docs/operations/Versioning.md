# Versioning

> Version numbering scheme for releases, builds, and the database/export format.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Versioning |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | operations/Release-Process.md, operations/Deployment.md |

---

# Purpose

Define a single, unambiguous versioning scheme so any given build, migration, or export file can be identified precisely — important given this app persists user data locally for years (`requirements/Vision.md`'s "Long-Term Bet") and must handle upgrades across many versions correctly.

---

# App Version (Semantic Versioning)

The user-facing app version follows `MAJOR.MINOR.PATCH`:

- **MAJOR** — a release that changes core scope significantly (e.g. a Horizon 2/3 addition from `requirements/Roadmap.md` that meaningfully changes what the app is) or requires a breaking data migration path.
- **MINOR** — a normal feature release within existing scope (e.g. a V1.1 item from `requirements/Roadmap.md`).
- **PATCH** — bug fixes and hotfixes (`operations/Release-Process.md`'s Hotfix Process) with no new functionality.

V1's initial release is `1.0.0`.

---

# Build Number

- A separate, always-incrementing build number (per platform convention — iOS build number, Android version code) accompanies every submitted build, including Preview builds, so any specific binary can be identified precisely regardless of its semantic version — required by both app stores independently of the semantic version scheme above.

---

# Database Schema Version

- Tracked independently via the migration numbering in `engineering/Database.md` — not tied 1:1 to the app's semantic version, since multiple app releases may ship with no schema change, and (rarely) a single release could include more than one migration step.
- The currently-applied schema version is stored in the database itself so the migration runner (`04-Core-Infrastructure.md`) always knows precisely what state a given install is in before running further migrations.

---

# Export File Format Version

- Tracked via the `formatVersion` field defined in `api/Data-Models.md`'s Export File Format — incremented only on breaking changes to the exported file's shape, independent of both the app's semantic version and the database schema version, since the export format must remain readable across a wider span of app versions than the internal database schema needs to.

---

# Tagging

- Every released version is tagged in version control at the exact commit built and submitted (`operations/Deployment.md`), so a hotfix (`operations/Release-Process.md`) can branch from a precise, known-good starting point rather than guessing at `main`'s state at release time.

---

# Related Documents

- `operations/Release-Process.md` — where version bumps are applied in the release flow.
- `operations/Deployment.md` — build numbers as used in the build/submit process.
- `engineering/Database.md` — schema migration versioning.
- `api/Data-Models.md` — export file format versioning.

---

**End of Document**
