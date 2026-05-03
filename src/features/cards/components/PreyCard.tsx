import * as React from 'react'
import { PreyCard as PreyCardType } from '@/types/game'
import { cn } from '@/lib/utils'

interface PreyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: PreyCardType
}

/**
 * Visual representation of a Prey Card
 */
export function PreyCard({ card, className, ...props }: PreyCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between w-32 h-44 p-2 bg-parchment select-none',
        'border-2 border-forest', // Default border
        {
          'border-gold': card.rarity === 'rare' || card.rarity === 'legendary',
          'outline outline-4 outline-gold/50 outline-offset-2': card.rarity === 'legendary',
        },
        className
      )}
      {...props}
    >
      {/* Points Badge (Top Right) */}
      <div className="absolute top-1 right-1 bg-gold text-earth-dark font-bold px-2 py-0.5 rounded-sm text-sm">
        {card.points}pt
      </div>

      {/* Rarity Label (Top Left) */}
      {card.rarity !== 'common' && (
        <div className="absolute top-1 left-1 text-[10px] uppercase font-bold text-earth-dark/70 tracking-tighter">
          {card.rarity}
        </div>
      )}

      {/* Icon */}
      <div className="flex-1 flex items-center justify-center text-5xl">
        {card.icon}
      </div>

      {/* Details */}
      <div className="flex flex-col items-center border-t border-parchment-dark pt-1">
        <h3 className="font-serif font-bold text-earth-dark text-sm leading-tight text-center">
          {card.nameTr}
        </h3>
        <span className="text-[10px] text-earth-dark/80 mt-0.5">
          Rol: {card.diceThreshold}{card.diceThreshold === 6 && card.rarity === 'legendary' ? ' (Exact)' : '+'}
        </span>
      </div>
    </div>
  )
}
