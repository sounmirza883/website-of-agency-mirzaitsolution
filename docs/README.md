# Documentation

Reference documentation for the Mirza IT Solution agency platform.

The root [`README.md`](../README.md) is the step-by-step guide for getting the system running. These files go deeper on individual subjects.

## Index

### Product
| File | What it covers |
|---|---|
| [PRD.md](PRD.md) | What the product is, who it serves, what it must do |
| [USER_STORIES.md](USER_STORIES.md) | Per-role stories, written as outcomes |
| [ROADMAP.md](ROADMAP.md) | What is planned and in what order |
| [PHASE.md](PHASE.md) | What is being built right now |
| [TASKS.md](TASKS.md) | The concrete work queue |

### Engineering
| File | What it covers |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | The six surfaces, the serverless constraint, how realtime works |
| [DATABASE.md](DATABASE.md) | Every table, and the date-storage problem that shapes the schema |
| [API.md](API.md) | Every endpoint, by role |
| [AUTH.md](AUTH.md) | JWT, roles, token storage, tenant scoping |
| [COMPONENTS.md](COMPONENTS.md) | Shared UI, and why it is duplicated per app |
| [DESIGN.md](DESIGN.md) | Visual language, and the inverted palette trap |
| [SECURITY.md](SECURITY.md) | Invariants that must not be broken |
| [PERFORMANCE.md](PERFORMANCE.md) | Pagination, silent truncation, query cost |

### Operations
| File | What it covers |
|---|---|
| [SETUP.md](SETUP.md) | Local development, step by step |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel, EAS, environment variables |
| [TESTING.md](TESTING.md) | How work is verified here |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Symptom → cause → fix |
| [FAQ.md](FAQ.md) | Recurring questions |

### Working with AI agents
| File | What it covers |
|---|---|
| [AI_CONTEXT.md](AI_CONTEXT.md) | The one-page brief to give an agent before it touches anything |
| [AGENTS.md](AGENTS.md) | Rules an agent must follow in this repo |
| [PROMPTS.md](PROMPTS.md) | Prompts that have worked well here |
| [MEMORY.md](MEMORY.md) | Facts learned the hard way, that are not visible in the code |

### Project record
| File | What it covers |
|---|---|
| [DECISIONS.md](DECISIONS.md) | Why things are the way they are |
| [CHANGELOG.md](CHANGELOG.md) | What changed and when |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Conventions to follow |
| [LICENSE.md](LICENSE.md) | Licensing |

## Reading order for someone new

1. [AI_CONTEXT.md](AI_CONTEXT.md) — the fastest complete picture
2. [ARCHITECTURE.md](ARCHITECTURE.md) — why it is shaped this way
3. [SETUP.md](SETUP.md) — get it running
4. [MEMORY.md](MEMORY.md) — the traps, before you hit them

## Keeping these honest

A wrong document is worse than a missing one. If you change behaviour, update the file that describes it in the same commit. Every claim here should be checkable against the code — where a doc states a fact, it names the file and line so it can be verified rather than trusted.
