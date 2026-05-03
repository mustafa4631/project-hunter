'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PreyCard } from '@/features/cards/components/PreyCard'
import useGameStore from '@/store/gameStore'
import { cn } from '@/lib/utils'

/**
 * Center play area showing the current active prey
 */
export function WildernessZone({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { wilderness, rollSuccess, currentPlayerIndex, players, log } = useGameStore()
  
  const currentCard = wilderness[0]
  const currentPlayer = players[currentPlayerIndex]
  const isHuman = !currentPlayer?.isAI
  const direction = isHuman ? 300 : -300

  const prevAction = React.useRef<'claim' | 'escape' | 'none'>('none')
  
  if (log[0]?.includes('avladı')) prevAction.current = 'claim'
  else if (log[0]?.includes('Av kaçtı')) prevAction.current = 'escape'

  const isFailed = rollSuccess === false

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

      <div className="flex flex-col items-center justify-center h-[300px]">
        <AnimatePresence mode="popLayout">
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={
                prevAction.current === 'escape'
                  ? { y: -200, opacity: 0 }
                  : { x: 200, opacity: 0 }
              }
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={
                prevAction.current === 'claim'
                  ? { y: direction, scale: 0, opacity: 0, transition: { duration: 0.5, type: 'spring' } }
                  : { rotate: 360, scale: 0, opacity: 0, transition: { duration: 0.5 } }
              }
              transition={
                prevAction.current === 'escape'
                  ? { duration: 0.4, type: 'spring', bounce: 0.4 }
                  : { duration: 0.4, delay: 0.3 }
              }
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={isFailed ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className="w-40 h-56 relative"
              >
                <motion.div
                  animate={isFailed ? { borderColor: ['#ef4444', 'rgba(0,0,0,0)'] } : { borderColor: 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-[-4px] border-4 rounded-xl z-10 pointer-events-none"
                />
                <motion.div layoutId={currentCard.id} className="w-full h-full">
                  <PreyCard 
                    card={currentCard} 
                    className="w-full h-full shadow-none"
                  />
                </motion.div>
              </motion.div>
              <div className="font-serif text-2xl text-gold font-bold bg-earth-dark px-4 py-2 border-2 border-gold/50 rounded-md">
                Eşik: {currentCard.diceThreshold}{currentCard.id === 'p_leopard' ? ' (Tam 6)' : '+'}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-40 h-56 border-2 border-dashed border-forest/50 bg-earth-dark flex items-center justify-center opacity-50"
            >
              <span className="text-forest text-2xl text-center">Doğa<br/>Boş</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
