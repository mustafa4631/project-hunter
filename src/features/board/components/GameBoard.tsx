'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { WildernessZone } from './WildernessZone'
import { PlayerArea } from '@/features/player/components/PlayerArea'
import { Dice } from '@/features/dice/components/Dice'
import useGameStore from '@/store/gameStore'
import { Button } from '@/features/ui/components/Button'
import { cn } from '@/lib/utils'

// ─── Lobby Modal ───────────────────────────────────────────────────────────────
function LobbyModal() {
  const initGame = useGameStore(s => s.initGame)
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState('')

  const isValid = name.trim().length >= 2

  const handleStart = () => {
    if (!isValid) {
      setError('En az 2 karakter girin')
      return
    }
    initGame(name.trim())
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-dark/95"
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-earth-dark border-2 border-forest flex flex-col gap-4 items-center p-10">
        <h2 className="font-serif text-3xl text-parchment">İsminizi Girin</h2>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Oyuncu adı..."
          autoFocus
          className="px-4 py-2 bg-parchment text-earth-dark outline-none font-bold text-center w-full"
          onKeyDown={e => { if (e.key === 'Enter') handleStart() }}
        />
        {error && <p className="text-red-400 text-sm font-sans">{error}</p>}
        <button
          type="button"
          onClick={handleStart}
          className={cn(
            'h-14 rounded-md px-8 text-lg font-medium transition-colors cursor-pointer bg-forest text-parchment hover:bg-forest-light',
            !isValid && 'opacity-50'
          )}
        >
          Oyuna Başla
        </button>
      </div>
    </div>
  )
}

// ─── GameBoard ─────────────────────────────────────────────────────────────────
export function GameBoard() {
  const {
    phase, players, currentPlayerIndex,
    gameMessage, setGameMessage, initGame, log
  } = useGameStore()

  // Animation 8: trap flash via local state
  const [trapFlash, setTrapFlash] = React.useState(false)
  React.useEffect(() => {
    if (gameMessage?.includes('KAPAN')) {
      setTrapFlash(true)
      setTimeout(() => setTrapFlash(false), 600)
    }
  }, [gameMessage])

  React.useEffect(() => {
    if (gameMessage) {
      const timer = setTimeout(() => setGameMessage(''), 2500)
      return () => clearTimeout(timer)
    }
  }, [gameMessage, setGameMessage])

  const p1 = players.find(p => !p.isAI)
  const p2 = players.find(p => p.isAI)
  const isPlayer1Turn = p1 && players[currentPlayerIndex]?.id === p1.id

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-earth-dark select-none text-parchment font-sans">

      {/* ── Lobby overlay ── */}
      {phase === 'lobby' && <LobbyModal />}

      {/* ── Animation 8: Trap flash ── */}
      {trapFlash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.25, 0] }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-40 bg-red-700 pointer-events-none"
        />
      )}

      {/* ── Animation 7: Game Over overlay ── */}
      {phase === 'finished' && p1 && p2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[90] bg-earth-dark/95 flex flex-col items-center justify-center gap-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="flex flex-col items-center gap-8"
          >
            <h1 className="font-serif text-6xl text-gold">{gameMessage}</h1>
            <div className="flex gap-12 font-serif text-2xl">
              <div className="text-center">
                <div>{p1.name}</div>
                <div className="text-4xl text-parchment">{p1.score} Puan</div>
              </div>
              <div className="text-center">
                <div>{p2.name}</div>
                <div className="text-4xl text-parchment">{p2.score} Puan</div>
              </div>
            </div>
            <Button onClick={() => initGame(p1.name)} size="lg">Tekrar Oyna</Button>
          </motion.div>
        </motion.div>
      )}

      {/* ── Toast (non-trap messages) ── */}
      {gameMessage && !gameMessage.includes('KAPAN') && phase !== 'finished' && (
        <motion.div
          key={gameMessage}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-gold text-earth-dark px-8 py-4 font-serif text-3xl border-4 border-earth-dark whitespace-nowrap"
        >
          {gameMessage}
        </motion.div>
      )}

      {/* ── AI Player — 160px ── */}
      <div className={cn(
        'h-[160px] shrink-0 border-b border-forest/40 px-6 transition-colors',
        !isPlayer1Turn ? 'border-l-4 border-l-forest' : ''
      )}>
        {p2 && <PlayerArea player={p2} isOpponent={true} />}
      </div>

      {/* ── Animation 4: Turn indicator — 40px ── */}
      <div className="h-[40px] shrink-0 flex items-center justify-center border-b border-forest/20">
        <motion.div
          key={currentPlayerIndex}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="font-serif text-base font-bold text-gold tracking-widest uppercase"
        >
          {isPlayer1Turn ? 'Senin Sıran' : 'Rakibin Sırası'}
        </motion.div>
      </div>

      {/* ── Center — flex-1, true vertical center ── */}
      <div className="flex-1 flex items-center justify-center gap-16 min-h-0 pr-[190px]">
        <div className="flex flex-col items-center justify-center">
          <WildernessZone />
        </div>
        <div className="flex flex-col items-center justify-center">
          <Dice />
        </div>
      </div>

      {/* ── Human Player — 180px ── */}
      <div className={cn(
        'h-[180px] shrink-0 border-t border-forest/40 px-6 transition-colors',
        isPlayer1Turn ? 'border-l-4 border-l-forest' : ''
      )}>
        {p1 && <PlayerArea player={p1} isOpponent={false} />}
      </div>

      {/* ── Fixed Log panel ── */}
      <div className="fixed right-0 top-0 h-screen w-[190px] border-l border-forest/40 bg-earth-dark/95 overflow-y-auto p-3 z-10">
        <p className="text-gold font-semibold text-xs tracking-widest mb-2 border-b border-forest/30 pb-2">
          OYUN GÜNLÜĞÜ
        </p>
        {/* Animation 6: log entries fade in from right */}
        <div className="flex flex-col gap-2 text-xs font-mono text-parchment-dark">
          {log.slice(0, 8).map((entry, i) => (
            <motion.div
              key={entry + i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-parchment/10 pb-1"
            >
              {entry}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
