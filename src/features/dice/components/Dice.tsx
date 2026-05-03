'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import useGameStore from '@/store/gameStore'

/**
 * Visual representation of the Game Dice
 */
export function Dice({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { rollAndClaim, diceValue, diceRolled, rollSuccess, currentPlayerIndex, players } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]
  const isAITurn = currentPlayer?.isAI
  const isDisabled = isAITurn || diceRolled

  const [isRolling, setIsRolling] = React.useState(false)

  // When diceValue changes to null it means a new turn started — reset rolling state
  React.useEffect(() => {
    if (diceValue === null) setIsRolling(false)
  }, [diceValue])

  const handleClick = () => {
    if (isDisabled || isRolling) return
    setIsRolling(true)
    rollAndClaim()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
        className={cn(
          'flex items-center justify-center w-20 h-20 bg-parchment border-4 transition-colors select-none',
          diceRolled ? 'border-gold' : 'border-forest',
          !isDisabled && !isRolling && 'cursor-pointer hover:bg-parchment-dark',
          isDisabled && 'opacity-50 cursor-not-allowed',
          isRolling && 'animate-bounce',
          className
        )}
        {...props}
      >
        <span className="font-serif text-4xl font-bold text-earth-dark">
          {diceValue !== null ? diceValue : '?'}
        </span>
      </div>

      <div className="flex flex-col items-center min-h-[3rem]">
        {!diceRolled ? (
          <span className="font-sans text-sm font-bold tracking-wide uppercase text-parchment-dark">
            Zar At &amp; Avlan
          </span>
        ) : (
          <div className="text-center font-bold">
            {rollSuccess === true && (
              <span className="text-gold block">✓ Avlandı!</span>
            )}
            {rollSuccess === false && (
              <span className="text-parchment-dark/70 block">✗ Yetersiz — sıra rakibe geçti</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
