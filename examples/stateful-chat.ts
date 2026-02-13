/**
 * Example: Stateful Chat Agent
 * 
 * Maintains conversation context across sessions, survives restarts.
 */

import { AgentPlane } from '../src/lib/client'

const client = new AgentPlane()

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ConversationState {
  messages: Message[]
  user_preferences: Record<string, any>
  pending_tasks: string[]
  last_updated: string
}

class StatefulChatAgent {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Load conversation history and context
   */
  async loadContext(): Promise<ConversationState> {
    console.log(`📂 Loading context for user ${this.userId}`)
    
    const state = await client.loadState('conversation', this.userId)
    
    if (state.data) {
      console.log(`✅ Loaded ${state.data.messages?.length || 0} messages`)
      return state.data as ConversationState
    } else {
      console.log(`📝 New conversation`)
      return {
        messages: [],
        user_preferences: {},
        pending_tasks: [],
        last_updated: new Date().toISOString()
      }
    }
  }

  /**
   * Process user message with full context
   */
  async chat(userMessage: string): Promise<string> {
    console.log(`\n💬 User: ${userMessage}`)

    // Load previous context
    const context = await this.loadContext()

    // Add user message to history
    context.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    })

    // Extract user preferences from message
    const preferences = await this.extractPreferences(userMessage, context)
    if (preferences) {
      context.user_preferences = { ...context.user_preferences, ...preferences }
      console.log(`🎯 Updated preferences:`, preferences)
    }

    // Check for pending tasks mentioned
    const taskMentions = await this.checkTaskMentions(userMessage, context.pending_tasks)
    if (taskMentions.length > 0) {
      console.log(`✅ Completed tasks:`, taskMentions)
      context.pending_tasks = context.pending_tasks.filter(t => !taskMentions.includes(t))
    }

    // Generate response (this would call your LLM with full context)
    const response = await this.generateResponse(userMessage, context)

    // Add assistant response to history
    context.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    })

    // Keep only last 50 messages to avoid unbounded growth
    if (context.messages.length > 50) {
      context.messages = context.messages.slice(-50)
    }

    // Save updated context
    context.last_updated = new Date().toISOString()
    await client.saveState({
      component_name: 'conversation',
      state_key: this.userId,
      state_value: context,
      expires_in_seconds: 90 * 24 * 60 * 60 // 90 days
    })

    console.log(`💾 Saved context (${context.messages.length} messages)`)
    console.log(`🤖 Assistant: ${response}`)

    return response
  }

  /**
   * Extract user preferences from message
   */
  private async extractPreferences(message: string, context: ConversationState): Promise<Record<string, any> | null> {
    // Look for preference indicators
    const preferenceKeywords = ['prefer', 'like', 'always', 'usually', 'favorite']
    if (!preferenceKeywords.some(kw => message.toLowerCase().includes(kw))) {
      return null
    }

    const result = await client.interpret({
      data: message,
      schema: {
        preferences: 'object with user preferences mentioned'
      },
      context: `Previous preferences: ${JSON.stringify(context.user_preferences)}`,
      confidence_threshold: 0.6
    })

    return result.data?.preferences || null
  }

  /**
   * Check if user mentions completed tasks
   */
  private async checkTaskMentions(message: string, pendingTasks: string[]): Promise<string[]> {
    if (pendingTasks.length === 0) return []

    const result = await client.interpret({
      data: message,
      schema: {
        completed_tasks: 'array of task IDs that user says are done'
      },
      context: `Pending tasks: ${pendingTasks.join(', ')}`,
      confidence_threshold: 0.8
    })

    return result.data?.completed_tasks || []
  }

  /**
   * Generate response with context
   */
  private async generateResponse(message: string, context: ConversationState): Promise<string> {
    // In a real implementation, this would call your LLM with the full context
    // For demo purposes, we'll return a simple response
    
    const recentMessages = context.messages.slice(-5)
    const contextSummary = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')
    
    // Demonstrate context awareness
    if (message.toLowerCase().includes('what did i say')) {
      return `Based on our conversation, you mentioned: ${recentMessages.filter(m => m.role === 'user').slice(-2).map(m => `"${m.content}"`).join(' and ')}`
    }

    if (Object.keys(context.user_preferences).length > 0) {
      return `I remember your preferences: ${JSON.stringify(context.user_preferences)}. How can I help?`
    }

    return `I understand. I have context of our last ${context.messages.length} messages. How can I assist you?`
  }

  /**
   * Add a pending task
   */
  async addTask(task: string): Promise<void> {
    const context = await this.loadContext()
    context.pending_tasks.push(task)
    context.last_updated = new Date().toISOString()
    
    await client.saveState({
      component_name: 'conversation',
      state_key: this.userId,
      state_value: context
    })

    console.log(`✅ Added task: ${task}`)
  }

  /**
   * Get conversation summary
   */
  async getSummary(): Promise<string> {
    const context = await this.loadContext()
    return `
📊 Conversation Summary for ${this.userId}:
- Messages: ${context.messages.length}
- Preferences: ${JSON.stringify(context.user_preferences)}
- Pending tasks: ${context.pending_tasks.join(', ') || 'none'}
- Last updated: ${context.last_updated}
    `.trim()
  }
}

// Example usage: Agent survives restart and maintains context
async function demo() {
  const agent = new StatefulChatAgent('user_123')

  // Session 1
  await agent.chat("Hi! I prefer dark mode in all my apps")
  await agent.chat("Can you remind me to call John tomorrow?")
  await agent.addTask('call_john_tomorrow')

  console.log('\n' + '='.repeat(60))
  console.log('🔄 SIMULATING AGENT RESTART')
  console.log('='.repeat(60) + '\n')

  // Session 2 (after "restart" - new agent instance)
  const agent2 = new StatefulChatAgent('user_123')
  await agent2.chat("What did I say about dark mode?")
  await agent2.chat("I called John already")

  // Show summary
  console.log('\n' + await agent2.getSummary())
}

// Run demo
demo().catch(console.error)
