# Claude Code Session Prompt

Copy this into Claude Code when starting work on Phantom Pressure Test:

---

## Session Start

You are working on **Phantom Pressure Test** - a synthetic qualitative research platform.

**MANDATORY: Before writing ANY code, execute these commands:**

```bash
cat CLAUDE.md
cat .claude/STATUS.md
```

Then read the active task file shown in STATUS.md.

## Your Workflow

1. **Read** → CLAUDE.md (rules), STATUS.md (current state), active task file (what's next)
2. **Check** → PATTERNS.md before implementing anything
3. **Execute** → Follow task requirements exactly
4. **Update** → Mark checkboxes in task file, update STATUS.md

## Key Files

```
CLAUDE.md              → Rules and quick reference (READ FIRST)
.claude/STATUS.md      → Current progress (READ SECOND)
.claude/BLUEPRINT.md   → Architecture details
.claude/PATTERNS.md    → Code patterns to copy
.claude/STACK.md       → Approved dependencies
.claude/DECISIONS.md   → Why we chose X (check if unsure)
.claude/tasks/         → Detailed task specs
```

## Rules

- **NEVER** create files without checking BLUEPRINT.md for location
- **NEVER** add dependencies without checking STACK.md
- **NEVER** invent patterns - copy from PATTERNS.md
- **ALWAYS** update STATUS.md after completing work
- **ALWAYS** mark task checkboxes when done

## Current Focus

Check `.claude/STATUS.md` for:
- Active phase
- Active task file
- What's completed vs in-progress

## After Completing Work

```bash
# Update STATUS.md with what you completed
# Mark checkboxes in the task file
# Add any new patterns to PATTERNS.md
# Add any decisions to DECISIONS.md
```

---

Now read CLAUDE.md and STATUS.md, then tell me what task you'll work on first.
