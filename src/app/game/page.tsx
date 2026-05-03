'use client'

import { GameBoard } from '@/features/board/components/GameBoard'
import useGameStore from '@/store/gameStore'

export default function GamePage() {
  const phase = useGameStore(state => state.phase)

  return (
    <main className="min-h-screen">
      <GameBoard />
    </main>
  )
}
