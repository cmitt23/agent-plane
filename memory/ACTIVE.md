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

## What's Next (Once Setup Complete)

1. Create Supabase schema (tables from architecture spec)
2. Build basic Next.js app structure
3. Implement first API routes (state management)
4. Test: Can I read/write my own state?
5. Document API in `docs/API.md`

## Credentials Status

**Received:**
- ✅ Supabase Database Password (stored in `.env.local`)

**Still needed:**
- ⏳ Supabase Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
- ⏳ Supabase Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)  
- ⏳ Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
- ⏳ Vercel project connected

**Security reminder:** All credentials go in `.env.local` only. Never commit to git. Never log in memory files.

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
