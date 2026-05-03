import { GameBoard } from '@/features/board/components/GameBoard'
import { PREY_CARDS, TOOL_CARDS } from '@/features/cards/data/cards'
import { Player } from '@/types/game'

export default function GamePage() {
  // Mock data for visual scaffolding
  const mockWilderness = PREY_CARDS.slice(0, 4) // Rabbit, Fox, Deer, Boar
  
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Mustafa',
    isAI: false,
    score: 0,
    hand: [TOOL_CARDS[0], TOOL_CARDS[3]], // Trap, Binoculars
    caughtPrey: [],
    isSkipped: false,
  }

  const mockOpponent: Player = {
    id: 'p2',
    name: 'Rakip (AI)',
    isAI: true,
    score: 5,
    hand: [TOOL_CARDS[6], TOOL_CARDS[1]], // Bait, Trap
    caughtPrey: [PREY_CARDS[4]], // Mountain Bear
    isSkipped: false,
  }

  return (
    <main className="min-h-screen">
      <GameBoard 
        currentPlayer={mockPlayer} 
        opponent={mockOpponent} 
        wilderness={mockWilderness} 
      />
    </main>
  )
}
