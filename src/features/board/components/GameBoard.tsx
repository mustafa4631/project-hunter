import * as React from 'react'
import { Player, PreyCard as PreyCardType } from '@/types/game'
import { WildernessZone } from './WildernessZone'
import { PlayerArea } from '@/features/player/components/PlayerArea'
import { Dice } from '@/features/dice/components/Dice'

interface GameBoardProps {
  currentPlayer: Player
  opponent: Player
  wilderness: PreyCardType[]
}

/**
 * Main game layout grid
 */
export function GameBoard({ currentPlayer, opponent, wilderness }: GameBoardProps) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-earth-dark text-parchment font-sans overflow-hidden">
      {/* Top: Opponent Area */}
      <section className="pt-4 pb-2 border-b-2 border-forest/30 bg-earth-dark/50">
        <PlayerArea player={opponent} isOpponent />
      </section>

      {/* Center: Wilderness + Dice */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-12 p-8 relative">
        <WildernessZone cards={wilderness} className="flex-1" />
        
        <div className="flex-shrink-0 md:absolute md:right-12 xl:right-24">
          <Dice value={4} />
        </div>
      </section>

      {/* Bottom: Current Player Area */}
      <section className="pt-2 pb-8 border-t-2 border-forest bg-earth-dark">
        <PlayerArea player={currentPlayer} />
      </section>
    </div>
  )
}
