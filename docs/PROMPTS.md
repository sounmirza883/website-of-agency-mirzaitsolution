# Prompts

Prompts that have worked well on this codebase, and the patterns behind them.

## What makes a good prompt here

**Name the surface.** "Add a field to the admin invoice modal" beats "add a field" — there are five apps and three of them have an invoice screen.

**Say whether it is a decision or an instruction.** "Should we use X or Y?" gets a recommendation. "Use X" gets X built.

**Ask for phases on anything large.** "Work in phases" has consistently produced better results here than one large change, because each phase is buildable, verifiable and committed on its own.

**Ask what it did not verify.** The most useful line in any report.

## Starting work

```
Read docs/AI_CONTEXT.md and docs/MEMORY.md first.
Then <task>. Work in phases, commit each phase separately,
and tell me if a migration is needed.
```

## Investigating before changing

```
Before changing anything: is <behaviour> actually true?
Show me the code that does it, with file and line.
```

Used to confirm the admin task gap was real rather than assumed — it was, and it reshaped the whole plan.

## Auditing a pattern across apps

```
Audit every <thing> across frontend/{admin,employee,client},
frontend/website and app/. For each one give me the file, the line,
and whether it <property>. Do not fix anything yet.
```

This produced the form-labelling inventory: 94 controls, 13 labelled, 15 with no descriptive text at all. The "do not fix yet" matters — you want the map before the work.

## Diagnosing something broken

```
<symptom>. Do not guess — measure it, then tell me the cause
before you change anything.
```

Two bugs here yielded only to measurement: the unread badges (Postgres clock ~2s ahead of Node) and a route 404ing while present in source (the running process had loaded a stale build).

## Reviewing risk before shipping

```
What could this break that I have not thought about?
Be specific about the failure, not the category.
```

## Adding a feature safely

```
Add <feature>. Before you start, tell me:
what already exists that I should reuse, what schema changes are
needed, and which of the five apps this has to touch.
```

The "which apps" question catches the duplication tax early — a shared component change is three edits, not one.

## Checking a claim

```
You said <claim>. Show me the file and line.
```

Cheap, and it catches confident-sounding errors.

## What not to ask for

**"Fix everything"** — produces unfocused churn. Name the target.

**"Make it better"** — no definition of better. Say what should be true afterwards.

**"Is this good?"** about code you have not read — you will get agreement more often than judgement. Ask "what is wrong with this?" instead.

**"Just quickly..."** — this codebase has five apps, no tests, and a manual migration step. Nothing is quick, and pretending otherwise produces unverified work.

## After the work

```
What did you verify, and what did you not?
```

Ask every time. The honest answer is usually more valuable than the change.
