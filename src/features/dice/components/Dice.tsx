'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import useGameStore from '@/store/gameStore'

/**
 * Visual representation of the Game Dice.
 * Animation 1: shake + scale on roll via local state.
 */
export function Dice({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { rollAndClaim, diceValue, diceRolled, rollSuccess, currentPlayerIndex, players } = useGameStore()

  const currentPlayer = players[currentPlayerIndex]
  const isAITurn = currentPlayer?.isAI
  const isDisabled = isAITurn || diceRolled

  const [isRolling, setIsRolling] = React.useState(false)

  React.useEffect(() => {
    if (diceValue === null) setIsRolling(false)
  }, [diceValue])

  const handleClick = () => {
    if (isDisabled || isRolling) return
    setIsRolling(true)
    rollAndClaim()
    setTimeout(() => setIsRolling(false), 400)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} {...props}>
      {/* Animated dice box */}
      <motion.div
        animate={isRolling
          ? { rotate: [-20, 20, -15, 15, -8, 8, 0], scale: [1, 1.15, 1] }
          : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
        className={cn(
          'flex items-center justify-center w-24 h-24 bg-parchment border-4 transition-colors select-none',
          diceRolled ? 'border-gold' : 'border-forest',
          !isDisabled && !isRolling && 'cursor-pointer hover:bg-parchment-dark',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="font-serif text-5xl font-bold text-earth-dark">
          {diceValue !== null ? diceValue : '?'}
        </span>
      </motion.div>

      {/* Label / result */}
      <div className="flex flex-col items-center gap-1 min-h-[3rem] text-center">
        {!diceRolled ? (
          <span className="font-sans text-sm font-bold tracking-wide uppercase text-parchment-dark">
            Zar At &amp; Avlan
          </span>
        ) : (
          <>
            {rollSuccess === true && (
              <span className="text-gold font-bold block">✓ Avlandı!</span>
            )}
            {rollSuccess === false && (
              <span className="text-parchment-dark/70 font-bold text-sm block text-center">
                ✗ Yetersiz<br />Sıra rakibe geçti
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
