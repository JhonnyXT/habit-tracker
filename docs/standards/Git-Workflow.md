# Git Workflow

> Branching, commit and pull request conventions.

---

# Document Information

| Property | Value |
|----------|-------|
| Document | Git Workflow |
| Version | 1.0 |
| Status | Draft |
| Audience | Engineering, AI Assistants |
| Depends On | standards/Definition-of-Done.md |

---

# Purpose

Keep version history clean and reviewable, and ensure every change can be traced back to the feature or fix it belongs to — supporting `reviews/08-Principal-Engineer-Review.md`'s later ability to reason about the codebase's history.

---

# Branching

- `main` is always releasable — it reflects a state that has passed, or is actively progressing through, the phase gates in `reviews/`.
- Feature work happens on a branch named for the feature or fix (e.g. `feature/habit-reminders`, `fix/streak-off-by-one`), scoped to one feature from `engineering/05-Feature-Development.md`'s feature list wherever possible — avoid branches that bundle multiple unrelated features.

---

# Commits

- Commit messages describe *why*, not just *what* — the diff already shows what changed; the message should explain the reasoning (a bug's root cause, a design trade-off), consistent with the project's broader "why over what" documentation philosophy.
- Prefer small, logically scoped commits over one large commit per feature — each commit should leave the codebase in a working state.
- Never commit commented-out code, debug logging left in by accident, or files containing secrets.

---

# Pull Requests

- A PR corresponds to one feature or one fix — not a grab-bag of unrelated changes.
- Before opening a PR: linting and TypeScript strict mode must report zero errors (`Coding-Standards.md`), and the relevant tests from `Testing-Strategy.md` must pass.
- PR description references the User Stories / Functional Requirements it implements (e.g. "Implements US-14, US-15, FR-6.1–6.4") so reviewers can check against the actual specification, not just read the diff in isolation.
- Architectural deviations discovered or introduced during the PR are called out explicitly and, if accepted, recorded as an ADR (`decisions/`) — not left implicit in the diff.

---

# Review

- A PR is reviewed against `architecture/02-Architecture.md`'s Non-Negotiable Rules, `standards/Coding-Standards.md`, and the specific requirements it claims to implement — not merely "does it look reasonable."
- Reviewers should be able to trust that a merged PR's claimed scope (per its description) is its actual scope.

---

# Merging

- Squash or preserve history per team preference, but the resulting `main` history should read as a coherent sequence of features/fixes, not an undifferentiated stream of "wip" commits.
- No merging with failing checks (lint, type-check, tests) — these are not overridden to "merge now, fix later."

---

# Related Documents

- `standards/Coding-Standards.md`, `standards/Testing-Strategy.md` — the gates a PR must pass.
- `standards/Definition-of-Done.md` — the broader completion bar this workflow supports.
- `decisions/` — where architectural deviations surfaced during review are recorded.

---

**End of Document**
