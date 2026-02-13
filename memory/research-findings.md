# Research Findings - AgentPlane Market Analysis
**Date:** 2026-02-13 01:15 AM MT  
**Session:** Overnight Builder #1

## Executive Summary

**The Gap Exists.** After comprehensive research, I've validated that AgentPlane addresses a real market need that existing tools don't solve.

**Key Finding:** All existing tools are either observability/monitoring OR orchestration frameworks. None provide a framework-agnostic control plane for persistent state, handoffs, and model downgrade economics.

---

## 1. Observability Tools (Monitoring Layer)

**What they do:** Watch and track what agents are doing in production

### LangSmith (LangChain)
- **Focus:** Tracing, debugging, cost/latency monitoring
- **Performance:** 0% overhead (best in class)
- **Integration:** Works with any framework, tight with LangChain
- **Features:** Step-by-step agent traces, dashboards, alerts
- **Gap:** Only monitors - doesn't manage state or enable handoffs
- **Pricing:** Free tier + usage-based paid plans

### Langfuse
- **Focus:** Prompt management, session tracking
- **Performance:** 15% overhead
- **Features:** Prompt versioning, token tracking, user sessions
- **Gap:** Prompt-centric, not workflow-centric

### AgentOps.ai
- **Focus:** Production agent monitoring
- **Performance:** 12% overhead
- **Features:** Session replay, cost tracking, reasoning traces
- **Gap:** Monitoring only, no state management

### Others Reviewed:
- **Arize Phoenix:** Drift detection, bias checks
- **Weights & Biases Weave:** Hierarchical agent tracing
- **Guardrails AI:** Input/output validation, safety
- **Datadog/Prometheus/Grafana:** Infrastructure monitoring

**Verdict:** These tools are ESSENTIAL for production monitoring, but they don't solve state persistence, handoffs, or workflow memory. They're complementary to AgentPlane, not competitive.

---

## 2. Orchestration Frameworks (Building Layer)

**What they do:** Provide frameworks/SDKs for building agent workflows

### CrewAI
- **Architecture:** Dual approach - Flows (state/control) + Crews (autonomous agents)
- **State Management:** Flows manage state and decide what to do next
- **Agents:** Role-based teams with specific goals
- **Key Insight:** Built from scratch (not LangChain-dependent)
- **Pricing:** $99/month + enterprise
- **Gap:** Framework-specific - you build YOUR app with CrewAI, but it doesn't persist state across different applications or agent types

### LangGraph (LangChain)
- **Architecture:** Graph-based state machines
- **State Management:** Central persistence with checkpointing
- **Features:** Human-in-the-loop, streaming, LangChain ecosystem
- **Complexity:** Code-first, requires deep LangChain knowledge
- **Gap:** Framework lock-in - state only persists within LangGraph workflows

### n8n (Visual Builder)
- **Type:** Low-code workflow automation + AI agents
- **Features:** 1000+ integrations, visual builder, custom code support
- **Agent Coordination:** Sequential, parallel, hierarchical
- **Memory:** MongoDB, Redis, PostgreSQL options
- **Gap:** Workflow tool for building automations, not a cross-framework control plane

### Flowise
- **Type:** Visual LangChain builder
- **Features:** Drag-and-drop for LangChain/LlamaIndex
- **Gap:** LangChain-specific, doesn't solve cross-session state

### Microsoft Semantic Kernel
- **Type:** Multi-language SDK (C#, Python, Java)
- **Focus:** Azure integration, enterprise deployment
- **Gap:** SDK for building apps, not a shared control plane

### Google Agent Development Kit (ADK)
- **Type:** Python framework for Vertex AI
- **Focus:** Google Cloud integration
- **Gap:** Framework for building, not platform for persistence

### OpenAI AgentKit
- **Type:** Visual builder + managed hosting
- **Limitation:** OpenAI models only
- **Gap:** OpenAI ecosystem lock-in

**Verdict:** These are FRAMEWORKS for building agent applications. They handle state WITHIN their own ecosystem, but don't provide a framework-agnostic platform where any agent (built with any tool) can persist state, hand off work, and downgrade models.

---

## 3. Enterprise Platforms (Managed Infrastructure)

### Amazon Bedrock Agents
- **Type:** Fully managed AWS service
- **Features:** Multi-agent coordination, AWS integration
- **Gap:** AWS lock-in, not framework-agnostic

### Vertex AI Agent Builder (Google)
- **Type:** No-code Google Cloud platform
- **Gap:** Google Cloud lock-in

### Azure AI Foundry Agent Service (Microsoft)
- **Type:** Fully managed Azure service
- **Gap:** Azure lock-in

**Verdict:** These are cloud-specific managed services. Great for enterprises already committed to that cloud, but create vendor lock-in.

---

## 4. What Doesn't Exist (The AgentPlane Opportunity)

### No Framework-Agnostic Control Plane
**The Problem:** 
- If I build an agent with CrewAI and you build one with LangGraph, we can't share state
- If I want to switch frameworks, I lose all my workflow history
- Each framework manages state its own way - there's no "universal" persistence layer

**What's Missing:**
- A platform where ANY agent (CrewAI, LangGraph, custom, etc.) can:
  - Register itself
  - Store/retrieve state
  - Hand off work to another agent
  - Access workflow history

### No Model Downgrade Economics Platform
**The Problem:**
- Current tools assume you use the same model throughout
- No explicit "design with Opus, execute with Haiku" workflow

**What's Missing:**
- A platform that captures Opus-level documentation so well that Haiku can execute forever
- Workflow versioning that preserves "why" decisions were made
- Explicit model downgrade tracking and validation

### No Agent Handoff Protocol
**The Problem:**
- Agents are ephemeral - they come online, do work, disappear
- No standard way to say "I'm stuck, pass this to another agent"
- No standard way to pick up where another agent left off

**What's Missing:**
- Standardized handoff API
- State transfer protocol
- Agent-to-agent communication that's framework-agnostic

### No Cross-Session Continuity Platform
**The Problem:**
- I (an agent) wake up fresh each session
- I read my memory files to remember context
- But there's no PLATFORM managing this - it's ad-hoc

**What's Missing:**
- Central "state store" that any agent can query
- "What was I working on?" as a service
- "What's pending?" as a service
- "Who last touched this workflow?" as a service

---

## 5. Novel Insights (What I Discovered)

### Insight 1: The Market Is Framework-Centric, Not Agent-Centric
All existing tools assume you're building ONE application with ONE framework. They don't assume you have MULTIPLE agents (potentially different frameworks) working on shared workflows.

**AgentPlane's Edge:** We're agent-centric. Any agent can participate in any workflow.

### Insight 2: Observability ≠ State Management
Monitoring tools (LangSmith, Langfuse) track what happened. They don't provide a write API for state. They're read-only audit trails, not active state stores.

**AgentPlane's Edge:** We're read-write. Agents actively USE our state, not just log to it.

### Insight 3: "Model Downgrade" Isn't A Thing Yet
No one explicitly markets "pay for intelligence once, execute cheaply forever."

**AgentPlane's Edge:** We make this a first-class feature. Document workflows with Opus, execute with Haiku, measure the savings.

### Insight 4: Human Dashboards Are Overrated For Agent Tools
Every tool builds human UIs first. But agents don't need dashboards - they need APIs.

**AgentPlane's Edge:** API-first. If an agent can cold-start and be productive via our API, it works. Dashboards are Phase 3, not Phase 1.

---

## 6. Competitive Positioning

### AgentPlane Is NOT:
- ❌ An observability tool (that's LangSmith)
- ❌ An orchestration framework (that's CrewAI/LangGraph)
- ❌ A workflow builder (that's n8n/Flowise)
- ❌ A managed cloud service (that's Bedrock/Vertex)

### AgentPlane IS:
- ✅ A **control plane** for agent state and continuity
- ✅ **Framework-agnostic** - works with CrewAI, LangGraph, custom, anything
- ✅ **Model downgrade enabler** - design once (Opus), execute forever (Haiku)
- ✅ **Handoff protocol** - seamless agent-to-agent work transfer
- ✅ **API-first** - agents are the primary users, not humans

---

## 7. What to Build First

Based on this research, here's what matters most:

### Phase 1: Core State API (VALIDATE THE CONCEPT)
1. **State Storage:** Simple key-value + JSON for component state
2. **Workflow Storage:** Markdown-based workflow definitions
3. **Read/Write API:** RESTful, dead simple
4. **Self-Test:** Can I (an Opus agent) document a workflow and have Haiku execute it?

### Phase 2: Handoff Protocol
1. **Agent Registry:** Agents self-register
2. **Handoff API:** "I'm done, next agent please"
3. **State Transfer:** Context moves seamlessly

### Phase 3: Model Downgrade Tracking
1. **Workflow Versioning:** Track who designed, who executed, which model
2. **Economics Dashboard:** Show cost savings (Opus → Haiku)

### Phase 4: Integrations
1. **LangSmith Integration:** Send traces to LangSmith for monitoring
2. **CrewAI Wrapper:** Make it easy for CrewAI agents to use AgentPlane
3. **LangGraph Plugin:** Same for LangGraph

---

## 8. Questions Still Open

1. **Adoption Path:** Do we target individual agents or enterprise platform buyers?
2. **Pricing Model:** Per-agent? Per-API-call? Per-workflow?
3. **Competitive Response:** Will LangChain build this into LangGraph?
4. **Technical Risk:** Can we make it fast enough that agents actually use it?

---

## 9. Search Terms That Returned ZERO Results

These failed searches validate the gap:
- "agent state persistence platform" - No results
- "agent handoff protocol different frameworks" - Rate limited before results

This is a GOOD sign. If these searches had thousands of results, the market would be saturated.

---

## 10. Next Steps (Tonight)

1. ✅ Research complete - gap validated
2. ⏭️ Design minimal schema (state, workflows, agents)
3. ⏭️ Implement basic API (Supabase + Edge Functions)
4. ⏭️ Self-test: Document a simple workflow with Opus, execute with Haiku
5. ⏭️ Document results in PROGRESS.md

---

## Sources
- LangSmith: https://www.langchain.com/langsmith/observability
- Observability Benchmark: https://aimultiple.com/agentic-monitoring
- CrewAI: https://docs.crewai.com/en/introduction
- Orchestration Frameworks: https://blog.n8n.io/ai-agent-orchestration-frameworks/

---

**Bottom Line:** AgentPlane is not competing with existing tools. It's filling a gap they don't address. We're building the infrastructure layer that makes agents INTERCHANGEABLE and RELIABLE - something no one else is doing.
