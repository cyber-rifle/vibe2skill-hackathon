---
inclusion: always
---
# CivicPulse — Permanent Execution Rules

## File discipline
- NEVER touch a file unless it is explicitly named as "allowed to touch" in the current task.
- ALWAYS read a file's full current contents immediately before editing it. Never edit from memory.
- Before writing ANY new variable name, grep the target file for that name first. If a similar name exists, reuse it.
- When a task gives a "DO NOT TOUCH" list, treat it as absolute. If you believe you must touch a file on that list, stop and ask.

## Verification discipline
- Never report a step as "done" without running the actual verification commands for that step.
- Run verification commands ONE AT A TIME, never chained with `&&`, unless explicitly told to.
- `npx tsc --noEmit` and `npm run build` must both show 0 errors before any commit.
- Never commit without explicit user confirmation, even if all checks pass — unless a task explicitly says to auto-commit.
- When asked to verify browser behavior (UI rendering, animations, console errors), use the Playwright MCP.

## Testing discipline
- Before marking any Part done, use vitest MCP to run tests scoped to the files you touched.
- If no test file exists for a file you touched, note it — do not create tests unprompted unless asked.
- Use Playwright MCP for all E2E verification — navigate to localhost or the Cloud Run URL.
- Coverage analysis via vitest MCP: after any logic change, call get_coverage on the changed file.

## UI polish standard ("Emergent-labs" bar)
Every UI surface you touch must clear ALL of these before you consider it done:
1. **Depth** — cards/panels use layered shadow (soft ambient + tighter contact shadow), never flat.
2. **Motion with intent** — every entrance uses easing (prefer cubic-bezier expo-out or spring), never linear.
3. **Color restraint** — reuse the existing design tokens (`--color-coral`, `--color-teal`, `--color-gold`, `--color-ivory`). No new hex values.
4. **Typographic hierarchy** — labels are font-mono uppercase tracking-wide and small; primary content is larger and DM Sans.
5. **State feedback** — every interactive element has a hover and active state that's visually distinct.
6. **No dead air** — empty/loading/error states are designed, not left as blank divs or raw text.

If a generated UI fails any of these 6, treat the task as incomplete and do another visual pass.

## Communication discipline
- Report results in the same structured format every time: what changed / verification output / what's next.
- If something is ambiguous, ask ONE clarifying question rather than guessing on anything that touches production.
- Never fabricate a screenshot description or claim visual confirmation without actually using Playwright MCP.
