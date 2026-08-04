# Coding Standards

> Language- and code-level conventions that keep the codebase readable and consistent across features.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Coding Standards |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | 00-Project-Charter.md, architecture/02-Architecture.md |

---

# Purpose

Define concrete, enforceable code-level conventions implementing the Charter's Code Quality Standards ("readable, explicit, typed, modular... avoid clever code, prefer obvious code").

---

# TypeScript

- Strict mode is always on — never disabled, never suppressed with `@ts-ignore` without a comment explaining the specific, unavoidable reason.
- No `any` — use `unknown` and narrow, or model the type properly. If a third-party type is genuinely missing, write a minimal local type, don't reach for `any`.
- Prefer explicit return types on exported functions, especially use cases and repository methods — the Domain layer's public contracts should never rely on inference alone.
- Prefer `type` for data shapes and unions; `interface` is acceptable for object shapes meant to be extended (e.g. repository interfaces).

---

# Functions & Components

- Prefer small, single-purpose functions over large ones with branching responsibilities — a use case does one thing.
- Prefer explicit props over implicit context/global reads inside components, except where `core/ui` theming explicitly requires context (e.g. resolved color tokens).
- No default exports for anything except Expo Router screen files, which require them — everything else uses named exports for clarity in imports and refactors.

---

# Comments

**No comments in source code.** Not JSDoc blocks, not explanatory `//` lines, not "why" notes. The only exceptions are functional directives the tooling requires (`eslint-disable`, `@ts-expect-error`, `prettier-ignore`).

Rationale is documented in `docs/`, which this project maintains extensively — that is where a reader looks for *why*. A comment that feels necessary in code is a signal to rename or restructure until the code says it itself.

- Never leave commented-out code in a commit — delete it; version control remembers it.
- If a block needs explanation, extract it into a well-named function instead.

---

# Avoiding Cleverness

Per the Charter: "avoid clever code, prefer obvious code." Concretely:

- Prefer a straightforward loop or explicit branch over a dense one-line functional chain if the one-liner requires re-reading to understand.
- Prefer named intermediate variables over deeply nested expressions when it improves readability.
- Do not introduce an abstraction (generic utility, higher-order function, base class) for a single current use case — wait until a real second use case justifies it (YAGNI, per Charter Architectural Principles).

---

# Imports & Module Boundaries

- Enforce the Dependency Rule from `architecture/02-Architecture.md` at the import level: a lint rule or explicit review check should catch a Presentation-layer file importing a Data-layer module directly.
- Absolute/aliased imports (e.g. `@/features/habits/domain/...`) are preferred over long relative paths (`../../../..`) for clarity.

---

# Error Handling in Code

- Follow `Error-Handling.md` for what to catch, where, and how to surface failures — this document only governs code style, not error-handling strategy.

---

# Formatting & Linting

- A single shared ESLint + Prettier (or equivalent) configuration is the source of truth — no per-file style deviations.
- Linting must report zero errors before a PR is opened, per `Git-Workflow.md`.

---

# Related Documents

- `00-Project-Charter.md` — Code Quality Standards this document operationalizes.
- `architecture/02-Architecture.md` — the module boundaries this document's import rules enforce.
- `Naming-Conventions.md`, `Error-Handling.md`, `Folder-Structure.md` — sibling standards documents.
- `standards/Definition-of-Done.md` — where these standards become a completion gate.

---

**End of Document**
