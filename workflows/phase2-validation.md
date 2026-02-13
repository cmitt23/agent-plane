# Phase 2 Validation Workflow

## Purpose
Comprehensive end-to-end test of AgentPlane Phase 2 features:
- Workflow execution tracking
- Agent-to-agent handoffs
- Escalation to human oversight

## Prerequisites
- AgentPlane APIs deployed and accessible
- At least 2 test agents registered
- Supabase database schema applied

## Workflow Steps

### 1. Initialize Execution
**Action:** Create a new workflow execution record
- **API:** `POST /api/executions`
- **Payload:**
  ```json
  {
    "workflow_id": "<this-workflow-id>",
    "executed_by_agent_id": "<agent-1-id>",
    "executed_with_model": "sonnet",
    "input_data": {
      "test_mode": true,
      "phase": 2,
      "timestamp": "2026-02-07T..."
    }
  }
  ```
- **Expected:** Execution created with status `pending`

### 2. Start Execution
**Action:** Update execution status to running
- **API:** `PATCH /api/executions/:id`
- **Payload:**
  ```json
  {
    "status": "running",
    "agent_id": "<agent-1-id>"
  }
  ```
- **Expected:** Status updated, started_at timestamp set

### 3. Perform Handoff
**Action:** Agent 1 hands off task to Agent 2
- **API:** `POST /api/handoffs`
- **Payload:**
  ```json
  {
    "from_agent_id": "<agent-1-id>",
    "to_agent_id": "<agent-2-id>",
    "workflow_id": "<this-workflow-id>",
    "execution_id": "<execution-id>",
    "context": {
      "reason": "Specialized agent needed for next phase",
      "completed_steps": [1, 2],
      "next_step": 3,
      "data": {"validation_passed": true}
    },
    "reason": "Phase 2 validation requires agent specialization"
  }
  ```
- **Expected:** Handoff created with status `pending`

### 4. Accept Handoff
**Action:** Agent 2 accepts the handoff
- **API:** `PATCH /api/handoffs/:id`
- **Payload:**
  ```json
  {
    "status": "accepted",
    "agent_id": "<agent-2-id>"
  }
  ```
- **Expected:** Handoff status `accepted`, accepted_at timestamp set

### 5. Create Test Escalation
**Action:** Simulate an edge case requiring human input
- **API:** `POST /api/escalations`
- **Payload:**
  ```json
  {
    "agent_id": "<agent-2-id>",
    "workflow_id": "<this-workflow-id>",
    "execution_id": "<execution-id>",
    "reason": "Ambiguous requirement detected in Phase 2 validation",
    "context": {
      "issue": "Test escalation to validate human-in-the-loop",
      "options": ["continue", "abort", "modify"],
      "agent_confidence": 0.65
    },
    "priority": "medium"
  }
  ```
- **Expected:** Escalation created with status `open`

### 6. Resolve Escalation (Auto for Test)
**Action:** Simulate human resolution
- **API:** `PATCH /api/escalations/:id`
- **Payload:**
  ```json
  {
    "status": "resolved",
    "resolution": "Continue with validation - this is a test escalation",
    "resolved_by": "test-harness"
  }
  ```
- **Expected:** Escalation resolved with resolved_at timestamp

### 7. Complete Handoff
**Action:** Agent 2 completes handoff work
- **API:** `PATCH /api/handoffs/:id`
- **Payload:**
  ```json
  {
    "status": "completed",
    "agent_id": "<agent-2-id>",
    "output_data": {
      "validation_result": "success",
      "all_tests_passed": true
    }
  }
  ```
- **Expected:** Handoff completed with completed_at timestamp

### 8. Complete Execution
**Action:** Mark workflow execution as complete
- **API:** `PATCH /api/executions/:id`
- **Payload:**
  ```json
  {
    "status": "completed",
    "output_data": {
      "phase2_features_validated": [
        "execution_tracking",
        "handoff_workflow",
        "escalation_system"
      ],
      "test_status": "all_passed"
    },
    "agent_id": "<agent-2-id>"
  }
  ```
- **Expected:** Execution completed, duration calculated

### 9. Verification Queries
**Action:** Verify all data persisted correctly
- **API:** `GET /api/executions/:id`
  - Verify execution status, duration, output_data
- **API:** `GET /api/handoffs?execution_id=:id`
  - Verify handoff completed
- **API:** `GET /api/escalations?execution_id=:id`
  - Verify escalation resolved

## Success Criteria
✅ All API endpoints respond successfully (2xx status codes)
✅ Execution tracked from start to completion
✅ Handoff workflow completed (pending → accepted → completed)
✅ Escalation workflow completed (open → resolved)
✅ Audit log entries created for all actions
✅ Timestamps set correctly for state transitions
✅ Duration calculated correctly for execution
✅ All foreign key relationships maintained

## Failure Scenarios to Test
- Invalid agent IDs (should return 404)
- Invalid status transitions
- Missing required fields
- Workflow not found
- Execution not found

## Executable By
**Minimum Model:** Haiku (simple API calls)
**Designed With:** Sonnet
**Estimated Duration:** 30 seconds

## Notes
This workflow exercises all Phase 2 features in a single end-to-end test. It validates:
1. The full lifecycle of a workflow execution
2. Multi-agent collaboration via handoffs
3. Human-in-the-loop via escalations
4. Proper state tracking and audit logging
