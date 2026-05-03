'use client'

import * as React from 'react'
import { PreyCard } from '@/features/cards/components/PreyCard'
import useGameStore from '@/store/gameStore'
import { cn } from '@/lib/utils'

/**
 * Center play area showing the current active prey card.
 * Title removed to save vertical space.
 */
export function WildernessZone({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { wilderness, rollSuccess } = useGameStore()

  const currentCard = wilderness[0]
  const isFailed = rollSuccess === false

  return (
    <div
      className={cn('flex flex-col items-center gap-3', className)}
      {...props}
    >
      {currentCard ? (
        <>
          <div
            className={cn(
              'w-36 h-52 border-4 rounded-xl transition-colors duration-300',
              isFailed ? 'border-red-500' : 'border-transparent'
            )}
          >
            <PreyCard card={currentCard} className="w-full h-full shadow-none" />
          </div>
          <div className="font-serif text-lg text-gold font-bold bg-earth-dark px-4 py-1.5 border-2 border-gold/50 rounded-md">
            Eşik: {currentCard.diceThreshold}{currentCard.id === 'p_leopard' ? ' (Tam 6)' : '+'}
          </div>
        </>
      ) : (
        <div className="w-36 h-52 border-2 border-dashed border-forest/50 bg-earth-dark flex items-center justify-center opacity-50 rounded-xl">
          <span className="text-forest text-xl text-center">Doğa<br />Boş</span>
        </div>
      )}
    </div>
  )
}
