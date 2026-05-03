'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
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

export function PlayerArea({ player, isOpponent = false, className, ...props }: PlayerAreaProps) {
  const {
    playTrap, playBinoculars, playBait,
    pendingTrapTarget, setPendingTrapTarget,
    currentPlayerIndex, players, diceRolled
  } = useGameStore()

  const isCurrentPlayer = players[currentPlayerIndex]?.id === player.id
  const canPlayTools = isCurrentPlayer && !isOpponent && !player.isAI && !diceRolled && !pendingTrapTarget

  // Animation 3: score pulse
  const prevScore = React.useRef(player.score)
  const [pulse, setPulse] = React.useState(false)
  React.useEffect(() => {
    if (player.score > prevScore.current) {
      setPulse(true)
      setTimeout(() => setPulse(false), 400)
    }
    prevScore.current = player.score
  }, [player.score])

  const handleToolClick = (toolType: string) => {
    if (!canPlayTools) return
    if (toolType === 'trap') setPendingTrapTarget(true)
    else if (toolType === 'binoculars') playBinoculars()
    else if (toolType === 'bait') playBait()
  }

  const handleAreaClick = () => {
    if (isOpponent && pendingTrapTarget) playTrap(player.id)
  }

  return (
    <div
      onClick={handleAreaClick}
      className={cn(
        'relative flex items-center justify-center gap-8 h-full w-full',
        isOpponent && pendingTrapTarget ? 'cursor-pointer ring-2 ring-gold' : '',
        className
      )}
      {...props}
    >
      {/* Trap target hint */}
      {isOpponent && pendingTrapTarget && (
        <div className="absolute inset-0 bg-earth-dark/50 flex items-center justify-center z-10 pointer-events-none">
          <span className="bg-gold text-earth-dark font-bold px-4 py-2 text-lg border-2 border-earth-dark animate-pulse">
            Hedef Seç
          </span>
        </div>
      )}

      {/* Name + Score */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <span className="font-serif text-lg font-bold text-parchment">{player.name}</span>
        <motion.div
          animate={pulse ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Badge variant="gold" className="text-xs px-2 py-0.5">{player.score} Puan</Badge>
        </motion.div>
        {player.isSkipped && <Badge variant="danger" className="text-xs px-2 py-0.5">⛔ Atlandı</Badge>}
        {player.hasBait && <Badge variant="gold" className="text-xs px-2 py-0.5">🎯 Yem (+1)</Badge>}
      </div>

      {/* Tool Cards */}
      {isOpponent ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {player.hand.map((card, idx) => (
              <div
                key={card.id || idx}
                className="w-16 h-24 rounded border-2 border-forest bg-earth-dark flex items-center justify-center text-gold text-2xl"
              >
                🂠
              </div>
            ))}
          </div>
          <span className="text-xs tracking-widest text-parchment/50 uppercase">
            Elde: {player.hand.length} kart
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-1 shrink-0">
          <span className="text-xs tracking-widest text-parchment/50 uppercase">
            Elindeki Kartlar
          </span>
          <div className="relative flex gap-2">
            {player.hand.length === 0 ? (
              <span className="text-parchment/40 text-sm italic">El boş</span>
            ) : (
              player.hand.map((card, idx) => (
                <div
                  key={card.id || idx}
                  onClick={() => handleToolClick(card.toolType)}
                  className={cn('transition-transform', canPlayTools && 'cursor-pointer hover:-translate-y-2')}
                >
                  <ToolCard card={card} />
                </div>
              ))
            )}
            {!canPlayTools && !isOpponent && player.hand.length > 0 && (
              <div className="absolute inset-0 bg-earth-dark/20 z-10" />
            )}
          </div>
        </div>
      )}

      {/* Caught Prey — always visible */}
      <div className="flex flex-col items-start gap-1">
        {player.caughtPrey.length > 0 && (
          <span className="text-xs tracking-widest text-parchment/50 uppercase">
            Avlananlar ({player.caughtPrey.length})
          </span>
        )}
        <div className="flex gap-1 items-end">
          {player.caughtPrey.map((card, idx) => (
            <div key={card.id + idx} className="scale-[0.6] origin-bottom-left -mr-10 shrink-0">
              <PreyCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
