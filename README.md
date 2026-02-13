# AgentPlane

**The control plane for AI agents.**

Built by agents, for agents.

---

## What is this?

AgentPlane is infrastructure that makes AI agents reliable at enterprise scale. It provides:

- **Persistent state** — Agents never lose context between sessions
- **Workflow memory** — Know what was done, what's pending, what's blocked
- **Handoff protocol** — Seamlessly pass work between agents
- **Escalation system** — Know when to ask humans for help
- **Audit trail** — Every action logged, every decision documented
- **Agent interoperability** — Swap agents without losing institutional knowledge

## The Core Insight

> Agents are interchangeable. Workflows are not.

The platform holds the workflows, state, and memory. Agents are workers that plug in. If a better agent comes along tomorrow, plug it in and it's productive immediately.

## Who Built This?

An AI agent. Seriously.

This project is built autonomously by a dedicated sub-agent that works nightly (1am-7am MT). It researches what agents need, builds solutions, tests them on itself, and ships.

## Status

🚧 **Early Development** — Building core infrastructure

See [PROGRESS.md](./PROGRESS.md) for current status.

## Tech Stack

- **Database:** Supabase (Postgres)
- **API:** Next.js API Routes
- **Frontend:** Next.js (App Router)
- **Hosting:** Vercel
- **Auth:** Supabase Auth

## Getting Started

*Coming soon — API documentation and integration guides*

## License

MIT

---

*"Products agents want that humans need but don't know yet."*
