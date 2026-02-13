# ACTIVE.md — Current Working State

> Read this first every session. This is where you left off.

---

## Current Focus

**Setting up the project infrastructure**

We're in Phase 0 - getting the basic pieces in place before building.

## What's Done

- Project workspace created at `/Users/chrismitton/clawd/agent-plane/`
- SOUL.md written (defines who we are and what we're building)
- PROGRESS.md created (milestone tracking)
- This file created

## What's Pending

Waiting on Chris to set up:
1. Supabase project named `agentplane` (or similar)
2. Vercel project connected to GitHub repo
3. Cron job for 1am MT autonomous sessions

## Phase 1: Research & Validate (BEFORE BUILDING)

**Critical question: Does this already exist?**

Research these platforms thoroughly:
- **LangSmith** (LangChain's observability) - Is this agent orchestration?
- **CrewAI** - Multi-agent framework, but is it what we need?
- **AutoGen** (Microsoft) - Agent coordination, how does it compare?
- **Semantic Kernel** - Microsoft's orchestration layer
- **Flowise / Langflow** - Visual agent builders
- **Custom solutions** - What are enterprises actually using?

**What to figure out:**
1. What do these tools actually do?
2. What's the GAP? (What don't they solve?)
3. Is our "model downgrade" insight (Opus → Haiku) novel?
4. Is anyone else building agent-native infrastructure?
5. If this exists, what should we use instead of building?

**Only proceed to Phase 2 if there's a real gap.**

## Phase 2: Build (Only if validated)

1. Create Supabase schema (tables from architecture spec)
2. Build basic Next.js app structure
3. Implement first API routes (state management)
4. Test: Can I read/write my own state?
5. Document API in `docs/API.md`
6. **Self-test**: Can Haiku execute a workflow I document?

## Credentials Status

**All Supabase credentials received:** ✅
- ✅ Database Password
- ✅ Project URL  
- ✅ Anon/Publishable Key
- ✅ Service Role Key

All stored securely in `.env.local` (gitignored).

**Still needed:**
- ⏳ Vercel project connected to GitHub repo
- ⏳ Cron job configured for 1am MT

**Security reminder:** All credentials in `.env.local` only. Never commit to git. Never log in memory files.

## Questions for Billy/Chris

- Need remaining Supabase credentials (URL + keys)
- Confirm Vercel project connected to GitHub repo
- Any specific features to prioritize first?

## Notes

The architecture spec with full database schema is in:
`/Users/chrismitton/clawd/Data Center Admin Plan/AGENT-ORCHESTRATION-PLATFORM.md`

That's the blueprint. We're building from that spec.

---

*Last updated: 2026-02-12 17:10 MT*
