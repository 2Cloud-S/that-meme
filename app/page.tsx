'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MemeFinder from './components/MemeFinder'
import EmojiBackground from './components/EmojiBackground'
import toast from 'react-hot-toast'

function SuccessToast() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Successfully upgraded to premium!', {
        duration: 5000,
        position: 'top-center',
      })
    }
  }, [searchParams])

  return null
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-8 overflow-hidden relative">
      <Suspense fallback={null}>
        <SuccessToast />
      </Suspense>
      <EmojiBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-6xl font-bold text-center mb-8 text-white drop-shadow-lg animate-bounce">
          That Meme 9000 🎭
        </h1>
        <MemeFinder />
      </div>
    </main>
  )
}

