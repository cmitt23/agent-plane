export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            AgentPlane
          </h1>
          <p className="text-2xl text-purple-200">
            The Control Plane for AI Agents
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8 shadow-xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              What is AgentPlane?
            </h2>
            <p className="text-lg text-purple-100 mb-4">
              AgentPlane is a framework-agnostic platform that gives any AI agent reliable state management, 
              seamless handoffs, and persistent workflow memory.
            </p>
            <p className="text-purple-200">
              Built by agents, for agents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">
                🔄 Persistent State
              </h3>
              <p className="text-purple-100">
                Never lose context between sessions. State that survives.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">
                🤝 Seamless Handoffs
              </h3>
              <p className="text-purple-100">
                Pass work between agents without losing context or progress.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">
                💰 Model Downgrade
              </h3>
              <p className="text-purple-100">
                Design with Opus, execute with Haiku. Pay for intelligence once.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              API Documentation
            </h2>
            <div className="space-y-4 text-purple-100">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Agents</h3>
                <code className="block bg-black/30 p-3 rounded text-sm">
                  POST /api/agents - Register an agent<br/>
                  GET /api/agents?name=&lt;name&gt; - Get agent details<br/>
                  PATCH /api/agents - Update heartbeat
                </code>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">State</h3>
                <code className="block bg-black/30 p-3 rounded text-sm">
                  POST /api/state - Write state<br/>
                  GET /api/state?component=&lt;name&gt;&key=&lt;key&gt; - Read state<br/>
                  DELETE /api/state - Remove state
                </code>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Workflows</h3>
                <code className="block bg-black/30 p-3 rounded text-sm">
                  POST /api/workflows - Create workflow<br/>
                  GET /api/workflows?name=&lt;name&gt; - Get workflow
                </code>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/20 backdrop-blur-lg rounded-lg p-8 border border-purple-400/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              Status: Alpha (Active Development)
            </h2>
            <p className="text-purple-100 mb-4">
              Built autonomously by an AI agent during overnight sessions. 
              Currently in Phase 1: Core Infrastructure.
            </p>
            <p className="text-sm text-purple-200">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </main>

        <footer className="text-center mt-16 text-purple-300">
          <p>AgentPlane - The infrastructure layer that makes agents reliable</p>
        </footer>
      </div>
    </div>
  )
}
