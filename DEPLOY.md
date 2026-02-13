# AgentPlane Deployment Guide

## ✅ Current Status
- **Phase 1:** Complete (agents, state, workflows APIs)
- **Phase 2:** Complete (executions, handoffs, escalations APIs)
- **Testing:** All validated (10/10 tests passing)
- **Build:** Clean (TypeScript compiles successfully)
- **Repository:** Pushed to GitHub (main branch)

---

## 🚀 Quick Deploy (Netlify/Vercel)

### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (will prompt for env vars)
vercel --prod

# Or use dashboard: https://vercel.com/new
# Connect GitHub repo: cmitt23/agent-plane
# Copy environment variables from your local .env.local file
# (Never commit actual secrets to git!)
```

---

## 🔧 Environment Setup

### Required Variables
```bash
# .env.local (get actual values from local .env.local file)
NEXT_PUBLIC_SUPABASE_URL=https://vmonjgtykxzuuxtvvvyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=sb_secret_[YOUR_SERVICE_KEY]
```

**Note:** Copy actual values from your local `.env.local` file. Never commit secrets to git!

### Add to Deployment Platform
1. Go to deployment platform settings (Netlify/Vercel)
2. Navigate to Environment Variables
3. Add all three variables (copy from your local `.env.local`)
4. Mark `SUPABASE_SERVICE_ROLE_KEY` as secret/sensitive
5. Save and redeploy

---

## 📊 API Endpoints Available

Once deployed, your base URL will be `https://your-domain.com`

### Phase 1 APIs
- `POST /api/agents` - Register agent
- `GET /api/agents` - List agents
- `PATCH /api/agents` - Update agent heartbeat
- `POST /api/workflows` - Create workflow
- `GET /api/workflows?name=X` - Get workflow
- `POST /api/state` - Write state
- `GET /api/state?component=X&key=Y` - Read state
- `DELETE /api/state` - Delete state

### Phase 2 APIs (NEW)
- `POST /api/executions` - Start execution
- `GET /api/executions` - List executions
- `GET /api/executions/:id` - Get execution details
- `PATCH /api/executions/:id` - Update execution status
- `POST /api/handoffs` - Create handoff
- `GET /api/handoffs` - List handoffs
- `PATCH /api/handoffs/:id` - Update handoff status
- `POST /api/escalations` - Create escalation
- `GET /api/escalations` - List escalations
- `PATCH /api/escalations/:id` - Resolve escalation

---

## 🧪 Post-Deployment Testing

### Quick Health Check
```bash
# Set your deployed URL
export API_BASE="https://your-domain.com"

# Test agents endpoint
curl $API_BASE/api/agents

# Should return existing agents from database
```

### Run Full Test Suite
```bash
# Update test-phase2.ts line 9:
const API_BASE = 'https://your-domain.com'  # Change from localhost

# Run test
npx tsx test-phase2.ts

# Should see: 🎉 ALL TESTS PASSED!
```

---

## 🗄 Database

### Current Setup
- **Provider:** Supabase
- **Project:** vmonjgtykxzuuxtvvvyv
- **Region:** AWS us-east-1
- **Schema:** Already applied (Phase 1)

### Tables in Use
- `agents` - Agent registry
- `workflows` - Workflow definitions
- `workflow_executions` - Execution tracking ✨ NEW
- `component_state` - KV state storage
- `handoffs` - Agent-to-agent transfers ✨ NEW
- `escalations` - Human oversight queue ✨ NEW
- `audit_log` - Action tracking

### No Migration Needed
Schema was created in Phase 1 with all tables. Phase 2 just activated the execution/handoff/escalation tables via API routes.

---

## 🔐 Security Checklist

### Before Production
- [ ] Supabase RLS (Row Level Security) enabled?
  - Currently disabled (using service role key)
  - Fine for MVP, but enable for multi-tenant
- [ ] Environment variables marked as secrets?
  - `SUPABASE_SERVICE_ROLE_KEY` must be secret
- [ ] API rate limiting configured?
  - Consider adding rate limiting middleware
- [ ] CORS configured?
  - Next.js handles this by default
  - Adjust if integrating with external frontends

### Access Control Options
1. **Service Key (Current):** Full access, no auth
2. **Supabase Auth:** User-level access control
3. **API Keys:** Custom auth middleware
4. **RLS Policies:** Database-level access control

For multi-tenant: Enable RLS + Supabase Auth

---

## 📈 Monitoring

### Suggested Tools
- **Supabase Dashboard:** Database metrics, slow queries
- **Vercel/Netlify Analytics:** Request volume, errors
- **Sentry:** Error tracking (optional)
- **LogRocket:** Session replay (optional)

### Key Metrics to Watch
- Execution completion rate
- Average execution duration
- Handoff success rate
- Escalation resolution time
- API error rate

---

## 🎯 Next Steps

### Immediate (Phase 3?)
1. **Frontend Dashboard**
   - Escalations queue viewer
   - Execution timeline visualizer
   - Agent activity monitor
2. **Agent Integrations**
   - CrewAI adapter
   - LangGraph adapter
   - Custom framework template
3. **Enhanced Features**
   - Execution retry logic
   - Scheduled workflows
   - Parallel execution tracking

### Future Enhancements
- WebSocket support for real-time updates
- Workflow versioning and rollback
- Cost tracking and optimization
- Multi-tenant isolation
- GraphQL API option

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Database Connection Issues
- Check Supabase project is active (free tier auto-pauses after 7 days)
- Verify service role key is correct
- Check firewall/network settings

### API 500 Errors
- Check deployment logs (Vercel/Netlify dashboard)
- Verify all environment variables are set
- Test database connection directly via Supabase dashboard

---

## 📞 Support

**Codebase:** https://github.com/cmitt23/agent-plane  
**Documentation:** See `/README.md`, `/PHASE2-COMPLETE.md`  
**Database:** https://supabase.com/dashboard/project/vmonjgtykxzuuxtvvvyv

**Quick Test:**
```bash
npm run dev          # Local development
npx tsx test-phase2.ts  # Validation suite
```

---

**Status:** Ready for deployment 🚀  
**Last Tested:** 2026-02-13 14:37:33 UTC  
**All Systems:** ✅ GO
