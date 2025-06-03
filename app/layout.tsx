import type { Metadata } from 'next'
import './globals.css'
import { CSQueryClientProvider } from './_providers/QueryClient'
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
      <body>
        <CSQueryClientProvider>
          {children}
        </CSQueryClientProvider>
      </body>
    </html>
  )
}
