import * as React from 'react'
import { Player } from '@/types/game'
import { ToolCard } from '@/features/cards/components/ToolCard'
import { PreyCard } from '@/features/cards/components/PreyCard'
import { Badge } from '@/features/ui/components/Badge'
import { cn } from '@/lib/utils'

interface PlayerAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  player: Player
  isOpponent?: boolean
}

/**
 * Visual representation of a player's hand, score, and caught prey
 */
export function PlayerArea({ player, isOpponent = false, className, ...props }: PlayerAreaProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full max-w-5xl mx-auto p-4 gap-4',
        isOpponent ? 'opacity-80' : '',
        className
      )}
      {...props}
    >
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
            Tuzakta (Atlanacak)
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
            <div className="flex gap-2">
              {player.hand.map((card, idx) => (
                <ToolCard key={card.id || idx} card={card} />
              ))}
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
                <div key={card.id || idx} className="scale-75 origin-top-left -mr-8">
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
