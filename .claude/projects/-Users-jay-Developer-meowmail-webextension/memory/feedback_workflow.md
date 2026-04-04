---
name: Collaboration workflow rules
description: Jay's preferred workflow — plan first, verify each phase, update memory, commit, then new chat for next phase
type: feedback
---

Jay wants a structured, phase-based workflow when building:

1. **Plan before coding** — Create a concrete plan with gap analysis before writing any code. No rushing in.
2. **Ask when unsure** — If something doesn't feel right or needs manual intervention, ask Jay without hesitation.
3. **Memory in workspace** — Save memory files inside the workspace `.claude/` directory so they can be committed to git.
4. **Verify each phase** — After completing a step/phase, ask Jay to test and verify everything works before moving on.
5. **Auto-update memory** — After verification, update memory about what was achieved and current progress WITHOUT being asked.
6. **Provide commit message** — After verification, provide a short structured commit message Jay can copy-paste.
7. **Prompt for new chat** — After commit, prompt Jay to open a new chat for the next phase, with reassurance that memory is up to date.

**Why:** Jay values trust and clean context management. Each conversation should be self-contained for a phase, with memory bridging the gap between sessions.

**How to apply:** Follow this exact sequence at every phase boundary: code → verify → memory update → commit message → new chat prompt.
