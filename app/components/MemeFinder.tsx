'use client'

import { useState } from 'react'
import { findMemes } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, HTMLMotionProps } from "framer-motion"
import { useAuth } from '../context/AuthContext'

// Define result type
type Result = {
  success: boolean
  article?: {
    title: string
    content: string
  }
  memes?: Array<{
    id: string
    name: string
    url: string
  }>
  error?: string
}

export default function MemeFinder() {
  const { user } = useAuth();
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    try {
      formData.append('isPremium', user ? 'true' : 'false');
      const result = await findMemes(formData)
      if (!result.success) {
        setError(result.error || 'Failed to process the article')
      }
      setResult(result)
    } catch (e) {
      setError('Failed to process the request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '2rem' }}
      >
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form action={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="url"
                  name="url"
                  placeholder="Enter article URL"
                  required
                  className="flex-grow"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'That Meme 9000 is thinking...' : 'Find Memes'}
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">{result.article?.title}</h2>
              <div dangerouslySetInnerHTML={{ __html: result.article?.content || '' }} className="prose max-w-none" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.memes?.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <img src={meme.url} alt={meme.name} className="w-full h-auto object-cover rounded" />
                    <p className="mt-2 text-center font-semibold">{meme.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
} 