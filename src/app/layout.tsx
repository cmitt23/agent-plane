export const metadata = {
  title: 'AgentPlane',
  description: 'The control plane for AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
