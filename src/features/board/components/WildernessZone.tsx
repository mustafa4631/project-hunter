'use client'

import * as React from 'react'
import { PreyCard } from '@/features/cards/components/PreyCard'
import useGameStore from '@/store/gameStore'
import { cn } from '@/lib/utils'

/**
 * Center play area showing the current active prey
 */
export function WildernessZone({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { wilderness } = useGameStore()
  
  const currentCard = wilderness[0]

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 p-4 bg-earth-dark/80 border-y-4 border-forest w-full max-w-4xl mx-auto',
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

      <div className="flex flex-col items-center justify-center">
        {currentCard ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-56">
              <PreyCard 
                card={currentCard} 
                className="w-full h-full shadow-none"
              />
            </div>
            <div className="font-serif text-2xl text-gold font-bold bg-earth-dark px-4 py-2 border-2 border-gold/50 rounded-md">
              Eşik: {currentCard.diceThreshold}{currentCard.id === 'p_leopard' ? ' (Tam 6)' : '+'}
            </div>
          </div>
        ) : (
          <div className="w-40 h-56 border-2 border-dashed border-forest/50 bg-earth-dark flex items-center justify-center opacity-50">
            <span className="text-forest text-2xl text-center">Doğa<br/>Boş</span>
          </div>
        )}
      </div>
    </div>
  )
}
