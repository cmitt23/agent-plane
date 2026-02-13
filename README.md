# AgentPlane

**The control plane for AI agents.**

Built by agents, for agents.

---

## What is this?

AgentPlane is infrastructure that makes AI agents reliable at enterprise scale. It provides:

- 🧠 **Data Interpretation** — AI-powered normalization of messy input data
- 💾 **Persistent State** — Agents never lose context between sessions
- 📋 **Workflow Templates** — Battle-tested patterns for common agent tasks
- 🔄 **Handoff Protocol** — Seamlessly pass work between agents
- 🚨 **Smart Escalation** — Know when to ask humans for help (with confidence scores)
- 🔍 **Observability** — Debug executions, track costs, trace failures
- 📊 **Audit Trail** — Every action logged, every decision documented
- 🔌 **Zero-Config SDK** — Integrate in 60 seconds

## The Core Insight

> Agents are interchangeable. Workflows are not.

The platform holds the workflows, state, and memory. Agents are workers that plug in. If a better agent comes along tomorrow, plug it in and it's productive immediately.

## Why Agents Love This

**What agents struggle with:**
- 😤 Messy user input → "Extract what I need from this chaos"
- 😵 Statelessness → "Where was I? What was I doing?"
- 🤔 Low confidence → "Should I do this or ask a human?"
- 🔧 Integration → "Do I really need to build this from scratch?"
- 🐛 Debugging → "Why did this fail 3 hours ago?"

**What AgentPlane gives you:**
- ✅ `/api/interpret` — AI normalizes data to your schema
- ✅ State APIs — Save/load state, survives restarts
- ✅ Confidence thresholds — Auto-escalate when uncertain
- ✅ SDK — `npm install` and you're productive
- ✅ Observability — See exactly what happened, when, and why

## Quick Start

```typescript
import { AgentPlane } from '@agentplane/client'

const client = new AgentPlane()

// Normalize messy data
const result = await client.interpret({
  data: "John Smith, email: john@acme.com, he's 32",
  schema: { name: "string", email: "string", age: "number" }
})
// → { name: "John Smith", email: "john@acme.com", age: 32 }

// Save state (survives restarts)
await client.saveState({
  component_name: "email_processor",
  state_key: "progress",
  state_value: { processed: 47, last_id: "msg_47" }
})

// Escalate when uncertain
if (confidence < 0.7) {
  await client.escalate({
    reason: "Unclear user intent",
    priority: "medium"
  })
}
```

**[→ Full Quick Start Guide](./QUICKSTART.md)**

## Who Built This?

An AI agent. Seriously.

This project is built autonomously by a dedicated sub-agent that works nightly (1am-7am MT). It researches what agents need, builds solutions, tests them on itself, and ships.

**Latest features (Phase 3):**
- ✅ `/api/interpret` — Data normalization with confidence scores
- ✅ SDK/Client library — Zero-config integration
- ✅ Workflow templates — 7 battle-tested patterns
- ✅ Observability API — Debug & trace executions

## Status

✅ **Phase 1-2: Complete** — Core infrastructure  
🚀 **Phase 3: Shipped** — Agent-first features  
📈 **Next: Production hardening & documentation**

See [QUICKSTART.md](./QUICKSTART.md) for usage examples.

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
