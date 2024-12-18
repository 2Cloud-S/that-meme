'use client'

import { useEffect, useState } from 'react'
import * as React from 'react'

const emojis = ['😂', '🤣', '😎', '🤔', '🙄', '😱', '🤯', '🥳', '🤪', '😜', '🎭', '🖼️', '🗨️', '💻', '🚀']

export default function EmojiBackground() {
  const [emojiElements, setEmojiElements] = useState<React.JSX.Element[]>([])

  useEffect(() => {
    const newEmojis = []
    for (let i = 0; i < 50; i++) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]
      const style = {
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 2 + 1}rem`,
        opacity: 0.2,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
      }
      newEmojis.push(<span key={i} style={style as React.CSSProperties}>{emoji}</span>)
    }
    setEmojiElements(newEmojis)
  }, [])

  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{emojiElements}</div>
} 