'use client'

import * as React from 'react'
import { PreyCard } from '@/features/cards/components/PreyCard'
import useGameStore from '@/store/gameStore'
import { cn } from '@/lib/utils'

/**
 * Center play area showing available prey
 */
export function WildernessZone({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { wilderness, diceRolled, diceValue, claimPrey, currentPlayerIndex, players } = useGameStore()
  
  const currentPlayer = players[currentPlayerIndex]
  const isAITurn = currentPlayer?.isAI

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-6 bg-earth-dark/80 border-y-4 border-forest w-full max-w-4xl mx-auto',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center">
        <h2 className="font-serif text-2xl font-bold text-parchment tracking-widest">
          AV SAHASI
        </h2>
        <span className="text-xs text-parchment-dark tracking-widest uppercase">
          Wilderness
        </span>
      </div>

      <div className="flex flex-row justify-center gap-4 flex-wrap">
        {wilderness.map((card, idx) => {
          let canClaim = false
          if (diceRolled && diceValue !== null) {
            canClaim = card.id === 'p_leopard' ? diceValue === 6 : diceValue >= card.diceThreshold
          }
          
          const isInteractable = diceRolled && !isAITurn
          const isClickable = isInteractable && canClaim

          return (
            <div 
              key={card.id || idx}
              onClick={() => isClickable ? claimPrey(card.id) : undefined}
              className={cn(
                "transition-all",
                isInteractable && !canClaim && "opacity-40",
                isClickable && "cursor-pointer scale-105"
              )}
            >
              <PreyCard 
                card={card} 
                className={cn(isClickable && "border-gold shadow-none outline outline-4 outline-gold/50 outline-offset-2")}
              />
            </div>
          )
        })}
        {/* Fill empty slots with placeholders if needed, assuming exactly 4 for now */}
        {Array.from({ length: Math.max(0, 4 - wilderness.length) }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="w-32 h-44 border-2 border-dashed border-forest/50 bg-earth-dark flex items-center justify-center opacity-50"
          >
            <span className="text-forest text-2xl">?</span>
          </div>
        ))}
      </div>
    </div>
  )
}
