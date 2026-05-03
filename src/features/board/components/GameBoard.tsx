'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WildernessZone } from './WildernessZone'
import { PlayerArea } from '@/features/player/components/PlayerArea'
import { Dice } from '@/features/dice/components/Dice'
import useGameStore from '@/store/gameStore'
import { Button } from '@/features/ui/components/Button'
import { cn } from '@/lib/utils'

/**
 * Main game layout grid
 */
export function GameBoard() {
  const { 
    phase, players, currentPlayerIndex, wilderness, 
    gameMessage, setGameMessage, initGame, log 
  } = useGameStore()
  
  const [playerNameInput, setPlayerNameInput] = React.useState('Oyuncu 1')

  React.useEffect(() => {
    if (gameMessage) {
      const timer = setTimeout(() => {
        setGameMessage('')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameMessage, setGameMessage])

  const p1 = players.find(p => !p.isAI)
  const p2 = players.find(p => p.isAI)

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'lobby' ? (
        <motion.div 
          key="lobby"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-screen flex-col items-center justify-center p-8 bg-earth-dark text-parchment absolute inset-0 z-50"
        >
          <div className="bg-earth-dark/90 p-8 border-2 border-forest flex flex-col gap-4 items-center">
            <h2 className="font-serif text-3xl">İsminizi Girin</h2>
            <input 
              type="text" 
              value={playerNameInput}
              onChange={e => setPlayerNameInput(e.target.value)}
              className="px-4 py-2 bg-parchment text-earth-dark outline-none font-bold text-center"
            />
            <Button onClick={() => initGame(playerNameInput)}>Oyuna Başla</Button>
          </div>
        </motion.div>
      ) : (!p1 || !p2) ? null : (
        <motion.div 
          key="game"
          initial={{ opacity: 0 }}
          animate={
            gameMessage?.includes('KAPAN') 
              ? { x: [-8, 8, -6, 6, -3, 3, 0], opacity: 1 } 
              : { x: 0, opacity: 1 }
          }
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col h-screen bg-earth-dark text-parchment font-sans overflow-hidden relative"
        >
          {/* Trap Red Flash */}
          <AnimatePresence>
            {gameMessage?.includes('KAPAN') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-danger z-50 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Trap Emoji */}
          <AnimatePresence>
            {gameMessage?.includes('KAPAN') && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.5, 1], rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <span className="text-[15rem]">🪤</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Message Toast */}
          <AnimatePresence>
            {gameMessage && !gameMessage.includes('KAPAN') && phase !== 'finished' && (
              <motion.div 
                initial={{ opacity: 0, y: -50, x: "-50%" }}
                animate={{ opacity: 1, y: "-50%", x: "-50%" }}
                exit={{ opacity: 0, y: -50, x: "-50%" }}
                className="absolute top-1/2 left-1/2 transform z-50 bg-gold text-earth-dark px-8 py-4 font-serif text-4xl border-4 border-earth-dark shadow-2xl whitespace-nowrap"
              >
                {gameMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Screen */}
          <AnimatePresence>
            {phase === 'finished' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-50 bg-earth-dark/95 flex flex-col items-center justify-center gap-8"
              >
                <motion.h1 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="font-serif text-6xl text-gold"
                >
                  {gameMessage}
                </motion.h1>
                <motion.div 
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  initial="hidden"
                  animate="show"
                  className="flex gap-12 font-serif text-2xl"
                >
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
                    <div>{p1.name}</div>
                    <div className="text-4xl text-parchment">{p1.score} Puan</div>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="text-center">
                    <div>{p2.name}</div>
                    <div className="text-4xl text-parchment">{p2.score} Puan</div>
                  </motion.div>
                </motion.div>
                <Button onClick={() => initGame(p1.name)} size="lg">Tekrar Oyna</Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top: Opponent Area */}
          <section className={cn("flex-shrink-0 pt-2 pb-2 border-b-2 bg-earth-dark/50 transition-colors z-20", 
            !(players[currentPlayerIndex]?.id === p1.id) ? "border-l-8 border-l-forest border-b-forest/30" : "border-b-forest/30"
          )}>
            <PlayerArea player={p2} isOpponent />
          </section>

          {/* Center: Wilderness + Dice + Log */}
          <section className="flex flex-col md:flex-row items-stretch justify-center relative flex-1 min-h-0 overflow-visible z-10">
            
            {/* Main Center Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4 relative min-h-0 overflow-visible">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPlayerIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-serif text-2xl md:text-4xl font-bold text-gold tracking-widest uppercase bg-earth-dark px-6 py-2 border-y-2 border-gold/30 z-20 flex-shrink-0"
                >
                  {players[currentPlayerIndex]?.id === p1.id ? 'Senin Sıran' : 'Rakibin Sırası'}
                </motion.div>
              </AnimatePresence>
              <div className="flex-1 flex items-center justify-center min-h-0 w-full transform scale-[0.8] md:scale-100 origin-center -my-12 md:my-0">
                <WildernessZone />
              </div>
              <div className="md:absolute md:right-12 xl:right-24 z-10 flex-shrink-0 transform scale-[0.8] md:scale-100 origin-right">
                <Dice />
              </div>
            </div>

            {/* Game Log Panel */}
            <div className="w-[200px] flex-shrink-0 border-l-2 border-forest/30 bg-parchment/10 flex flex-col p-4 h-full overflow-y-auto">
              <h3 className="font-serif text-gold text-sm text-center mb-4 uppercase tracking-widest border-b border-forest/30 pb-2">Oyun Günlüğü</h3>
              <div className="flex flex-col gap-2 overflow-y-auto text-xs font-mono text-parchment-dark">
                <AnimatePresence initial={false}>
                  {log.slice(0, 8).map((entry, idx) => (
                    <motion.div 
                      key={entry + idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-parchment/10 pb-1"
                    >
                      {entry}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Bottom: Current Player Area */}
          <section className={cn("flex-shrink-0 pt-2 pb-2 border-t-2 bg-earth-dark transition-colors z-20",
            players[currentPlayerIndex]?.id === p1.id ? "border-l-8 border-l-forest border-t-forest" : "border-t-forest"
          )}>
            <PlayerArea player={p1} />
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
