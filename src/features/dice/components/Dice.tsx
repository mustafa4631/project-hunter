'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import useGameStore from '@/store/gameStore'

/**
 * Visual representation of the Game Dice
 */
export function Dice({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { rollDice, diceValue, diceRolled, currentPlayerIndex, players, endTurn } = useGameStore()
  
  const currentPlayer = players[currentPlayerIndex]
  const isAITurn = currentPlayer?.isAI

  const isDisabled = isAITurn || diceRolled

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => !isDisabled && rollDice()}
        className={cn(
          'flex items-center justify-center w-20 h-20 bg-parchment border-4 transition-colors select-none',
          diceRolled ? 'border-gold' : 'border-forest',
          !isDisabled && !diceRolled && 'cursor-pointer hover:bg-parchment-dark',
          isDisabled && !diceRolled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        <span className="font-serif text-4xl font-bold text-earth-dark">
          {diceValue !== null ? diceValue : '?'}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className={cn("font-sans text-sm font-medium tracking-wide uppercase", diceRolled ? "text-gold" : "text-parchment-dark")}>
          {diceRolled ? 'Av Seç!' : 'Zar At'}
        </span>
        {diceRolled && !isAITurn && (
          <button 
            onClick={endTurn}
            className="mt-2 text-xs text-parchment-dark underline hover:text-parchment"
          >
            Turu Bitir
          </button>
        )}
      </div>
    </div>
  )
}
