# Security

> Local data protection and minimal-attack-surface conventions for a fully offline, account-less application.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Security |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering |
| Depends On | 00-Project-Charter.md, requirements/Non-Functional-Requirements.md |

---

# Purpose

Define security practices appropriate to this application's actual threat model: no server, no accounts, no network calls beyond OS services — the risk surface is fundamentally different from a typical connected app, and this document reflects that rather than importing generic web-app security checklists wholesale.

---

# Threat Model

Because the app has no backend, no authentication, and no network dependency (NFR-2.2), the primary risks are:

- Unauthorized access to the device itself exposing the user's local data.
- A malicious or malformed import file (FR-9.2) being used to corrupt the local database or crash the app.
- Over-broad OS permissions being requested unnecessarily, expanding attack surface for no product benefit.

There is no server-side attack surface, no authentication system, and no third-party data-sharing surface in V1 — sections of typical security checklists addressing those don't apply and should not be force-fit.

---

# Local Data Protection

- The SQLite database is stored in the app's standard sandboxed storage location, relying on the OS's own app-sandboxing and, where available, at-rest encryption (e.g. iOS Data Protection) — no custom encryption layer is introduced in V1 without a specific justification and ADR, since the data (habit names, completion dates) is low-sensitivity personal data, not credentials or financial data.
- No sensitive data is ever written to `Logging.md`-covered logs.

---

# Import File Handling

- Import (FR-9.2) treats every incoming file as untrusted input: full structural validation occurs before any database write, and a malformed file fails safely with no partial state (NFR-3.2) — this is the application's one real "parsing untrusted input" surface, and it is treated accordingly.
- Import must not be able to execute arbitrary code or queries from file content — the file format is data only (e.g. structured JSON), never something interpreted as executable logic (e.g. never raw SQL from the file).

---

# Permissions

- Request only the OS permissions strictly required for an enabled feature, at the point it's enabled — notification permission only when a reminder is turned on (FR-6.2), nothing requested speculatively at launch.
- No permission is requested "for future use" — if a future feature needs a new permission, it's requested when that feature ships, not preemptively.

---

# Dependencies

- Third-party packages are kept to what's justified per the Charter ("every dependency must have a clear justification") — fewer dependencies means a smaller supply-chain attack surface.
- Dependencies are kept reasonably current; security-relevant updates are not deferred indefinitely.

---

# What Is Explicitly Out of Scope for V1

- Authentication/authorization — there is no account system (Charter Non-Goals).
- Network transport security (TLS, API auth) — there is no network API in V1 (NFR-2.2).
- Server-side data protection — there is no server.

If any future roadmap item (`requirements/Roadmap.md`) introduces networked sync or accounts, this document must be revisited and expanded via a dedicated ADR before implementation begins.

---

# Related Documents

- `00-Project-Charter.md`, `requirements/Non-Functional-Requirements.md` (NFR-4) — the privacy commitments this document supports.
- `engineering/Database.md` — where local data actually lives.
- `Error-Handling.md` — how malformed import files fail safely.
- `decisions/` — where any future expansion of this threat model must be recorded.

---

**End of Document**
