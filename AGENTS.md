# Agent Guide

## Project Context

`nikonikoni blog` is a personal Astro static site and digital garden.
Use `package.json` for runtime versions and scripts, `README.md` for setup,
`docs/ARCHITECTURE.md` for structure, and `docs/DEPLOYMENT.md` for deployment.
Site settings live in `src/config.ts`; content requirements live in `src/content.config.ts`.

## Scope And Autonomy

Start with `git status --short` and identify the affected files. Carry out clear requests,
including routine supporting edits and verification. For complex work, explain a short plan;
a plan does not itself require another approval. When the user requests a plan or diagnosis
only, stop before implementation and wait for their go-ahead.

Use local conventions for routine choices. Ask when a missing decision materially changes
the outcome, the scope expands beyond the request, or an action requires authority not
already given. Existing authorization remains valid for the same scope; do not ask again
for each step. Explain consequential dependency, configuration, or workflow changes before
making them, and obtain a decision if they introduce a new cost, service, or external effect.

Preserve user changes. Only edit, stage, or clean files within the authorized task, including
user-authored files when the user asks to publish them. Do not overwrite unrelated work.
Resolve routine integration issues within scope; ask if a conflict requires choosing between
the user's intent and another change. Do not force-push or discard unique work without authorization.

## Git And Publishing

This is a single-maintainer repository. Use direct `master` publishing by default. Follow
the user's and this project's branch policy even if a generic commit skill prefers branches.
Create a feature branch or PR only when requested or when repository protection requires it.

- A commit request authorizes a local commit. An upload or push request includes the commits
  needed to publish the specified work to GitHub. Do not infer a push from a commit-only request.
- Interpret "sync" in context: Git synchronization is separate from external content sync.
- Inspect the current branch, changes, and staged diff. Stage the authorized paths explicitly;
  use `git add .` only when all pending changes are in scope. Prefer one commit per independent
  change and match the repository's commit-message style.
- Before pushing, fetch the target branch and compare histories. On `master`, integrate remote
  changes as needed, rebasing only unpublished local commits. If on another branch, ensure the
  intended changes actually reach `master`; do not blindly run `git push origin master` from a
  feature branch. Preserve unrelated work and inspect the resulting diff before publishing.
- Apply the verification below to the final changes. Reuse valid results for unchanged inputs;
  recheck affected behavior if integration changes the code or dependencies.
- Confirm the remote contains the intended commit and report the branch and commit. A push
  to `master` triggers the configured automation; see `docs/DEPLOYMENT.md`. Check the production
  site when the task requests deployment verification, not for every repository upload.

## Content And Secrets

Treat `src/content/**`, `src/data/**`, and personal assets in `public/images/**` as user-owned.
An explicit content-editing request authorizes the necessary edits; preserve intentional wording
and metadata outside that request. Follow the content schema when adding or updating posts.

Keep `.env` and `post-passwords.local.json` local. Do not expose or commit secret values.
Read secret-bearing files only when needed for an authorized configuration diagnosis, reporting
key names or behavior rather than values. If a committed secret is found, report its path and risk;
credential rotation or history rewriting requires authorization.

External content sync is disabled by default. Enable `ENABLE_CONTENT_SYNC=true` only for an
authorized external-content task: it can replace local content directories. Ordinary verification
must leave sync disabled; if the environment already enables it, override it for that command.
See `docs/CONTENT_SYNC.md`. `predev` and `prebuild` tolerate sync failure with `|| true`, so a
successful dev server or build does not prove an explicitly requested sync succeeded.

The repository ignores specific Obsidian runtime-state files. Do not ignore `.obsidian/` wholesale.

## Editing And Verification

Prefer the simplest change that achieves the requested result. Follow existing structure and style;
avoid speculative abstractions, fallback behavior, and unrelated refactoring. Remove code made
unused by your change. Update existing documentation when the change affects its instructions.

`pnpm format` and `pnpm lint` write across `src/`; they are not read-only checks. Scope formatting
to touched files. Choose checks that can detect a plausible regression:

- Non-site documentation and rules: review the diff, affected links, and consistency. No site build.
- Blog content or structured page data: run `pnpm build` once; inspect the affected page if special
  markup or layout warrants it.
- Source changes: run relevant non-writing checks supported for the touched file types and
  `pnpm build`. Add or update an existing regression test when it usefully catches the defect;
  a small reversible change does not automatically require a new test or framework.
- Layout and interaction changes: inspect the affected page and behavior, including desktop and
  mobile when responsive behavior is involved. Save screenshots when useful or requested.

Full Astro, TypeScript, and Biome checks have recorded baseline failures. Use them when relevant
to the change, not as mandatory debt-clearing steps. Capture a before/after baseline only when
needed to distinguish a regression. Fix failures introduced by the task; report inherited failures
separately. A failed check is not a pass, and an existing build failure must be reported if it
prevents the required build verification. Reuse results until relevant inputs or assumptions change.

Finish with a diff review, `git diff --check`, and `git status --short`. Report what changed,
meaningful verification results, and remaining limitations. For cleanup, check exact targets and
unique work first; execute clearly authorized cleanup without requesting the same approval again.
