'use client'

import * as React from 'react'
import { Player } from '@/types/game'
import { ToolCard } from '@/features/cards/components/ToolCard'
import { PreyCard } from '@/features/cards/components/PreyCard'
import { Badge } from '@/features/ui/components/Badge'
import { cn } from '@/lib/utils'
import useGameStore from '@/store/gameStore'

interface PlayerAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  player: Player
  isOpponent?: boolean
}

/**
 * Visual representation of a player's hand, score, and caught prey
 */
export function PlayerArea({ player, isOpponent = false, className, ...props }: PlayerAreaProps) {
  const { 
    playTrap, playBinoculars, playBait, 
    pendingTrapTarget, setPendingTrapTarget,
    currentPlayerIndex, players, diceRolled
  } = useGameStore()

  const isCurrentPlayer = players[currentPlayerIndex]?.id === player.id
  const canPlayTools = isCurrentPlayer && !isOpponent && !player.isAI && !diceRolled && !pendingTrapTarget

  const handleToolClick = (toolType: string) => {
    if (!canPlayTools) return
    
    if (toolType === 'trap') {
      setPendingTrapTarget(true)
    } else if (toolType === 'binoculars') {
      playBinoculars()
    } else if (toolType === 'bait') {
      playBait()
    }
  }

  const handleAreaClick = () => {
    if (isOpponent && pendingTrapTarget) {
      playTrap(player.id)
    }
  }

  return (
    <div
      onClick={handleAreaClick}
      className={cn(
        'flex flex-col w-full max-w-5xl mx-auto p-4 gap-4 transition-all',
        isOpponent ? 'opacity-80' : '',
        isOpponent && pendingTrapTarget ? 'cursor-pointer ring-4 ring-gold bg-earth-dark/80' : '',
        className
      )}
      {...props}
    >
      {isOpponent && pendingTrapTarget && (
        <div className="absolute top-0 left-0 w-full h-full bg-earth-dark/50 flex items-center justify-center z-10 pointer-events-none">
          <span className="bg-gold text-earth-dark font-bold px-4 py-2 text-xl border-2 border-earth-dark animate-pulse">
            Hedef Seç
          </span>
        </div>
      )}

      {/* Player Header */}
      <div className={cn("flex items-center gap-4", isOpponent ? "justify-center" : "justify-start")}>
        <h2 className="font-serif text-2xl font-bold text-parchment">
          {player.name}
        </h2>
        <Badge variant="gold" className="text-sm px-3 py-1">
          {player.score} Puan
        </Badge>
        {player.isSkipped && (
          <Badge variant="danger" className="text-sm px-3 py-1 ml-auto">
            ⛔ Tur Atlandı
          </Badge>
        )}
        {player.hasBait && (
          <Badge variant="gold" className="text-sm px-3 py-1">
            🎯 Yem Aktif (+1)
          </Badge>
        )}
      </div>

      <div className={cn("flex flex-wrap gap-8", isOpponent ? "justify-center" : "justify-start")}>
        {/* Tool Cards (Hand) */}
        {player.hand.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-parchment-dark uppercase tracking-wider">
              {isOpponent ? 'Eldeki Kartlar' : 'Elindeki Kartlar'}
            </span>
            <div className="flex gap-2 relative">
              {player.hand.map((card, idx) => (
                <div 
                  key={card.id || idx}
                  onClick={() => handleToolClick(card.toolType)}
                  className={cn(
                    "transition-transform",
                    canPlayTools && "cursor-pointer hover:-translate-y-2"
                  )}
                >
                  <ToolCard card={card} />
                </div>
              ))}
              {!canPlayTools && !isOpponent && player.hand.length > 0 && (
                 <div className="absolute inset-0 bg-earth-dark/20 z-10" />
              )}
            </div>
          </div>
        )}

        {/* Caught Prey */}
        {player.caughtPrey.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-parchment-dark uppercase tracking-wider">
              Avlananlar
            </span>
            <div className="flex gap-2">
              {player.caughtPrey.map((card, idx) => (
                <div key={card.id + idx} className="scale-75 origin-top-left -mr-8">
                  <PreyCard card={card} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
