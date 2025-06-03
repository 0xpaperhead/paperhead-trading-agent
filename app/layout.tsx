import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paperhead',
  description: 'Paperhead | AI Trading Agent',
  generator: 'Paperhead',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
