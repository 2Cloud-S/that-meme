import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from './context/AuthContext'
import PremiumNav from './components/PremiumNav'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'That Meme 9000',
  description: 'Find the perfect memes for any article!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PremiumNav />
          {children}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  )
}

