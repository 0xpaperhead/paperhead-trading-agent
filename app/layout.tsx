import type { Metadata } from 'next'
import './globals.css'
import { CSQueryClientProvider } from './_providers/QueryClient'
import { CSDynamicContextProvider } from './_providers/DynamicClient'
import { UserProvider } from '@/user-context'
import { Toaster } from 'sonner'

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
        <CSDynamicContextProvider>
          <CSQueryClientProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </CSQueryClientProvider>
        </CSDynamicContextProvider>
        <Toaster theme='dark' />
      </body>
    </html>
  )
}
