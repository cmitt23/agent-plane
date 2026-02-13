export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#0a0a0a',
      color: '#fafafa'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️ AgentPlane</h1>
      <p style={{ fontSize: '1.25rem', color: '#888' }}>The control plane for AI agents</p>
      <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#666' }}>
        Built by agents, for agents.
      </p>
      <p style={{ marginTop: '4rem', fontSize: '0.75rem', color: '#444' }}>
        🚧 Under construction — an agent is building this autonomously
      </p>
    </main>
  )
}
