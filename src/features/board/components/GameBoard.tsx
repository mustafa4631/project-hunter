'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WildernessZone } from './WildernessZone'
import { PlayerArea } from '@/features/player/components/PlayerArea'
import { Dice } from '@/features/dice/components/Dice'
import useGameStore from '@/store/gameStore'
import { Button } from '@/features/ui/components/Button'
import { cn } from '@/lib/utils'

// ─── Lobby Modal ──────────────────────────────────────────────────────────────
function LobbyModal() {
  const { initGame } = useGameStore()
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState('')

  const handleStart = () => {
    if (name.trim().length < 2) {
      setError('En az 2 karakter girin')
      return
    }
    initGame(name.trim())
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-earth-dark/95">
      <div className="bg-earth-dark border-2 border-forest flex flex-col gap-4 items-center p-10">
        <h2 className="font-serif text-3xl text-parchment">İsminizi Girin</h2>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Oyuncu adı..."
          className="px-4 py-2 bg-parchment text-earth-dark outline-none font-bold text-center w-full"
          onKeyDown={e => e.key === 'Enter' && handleStart()}
        />
        {error && (
          <p className="text-red-400 text-sm font-sans">{error}</p>
        )}
        <Button
          onClick={handleStart}
          disabled={name.trim().length < 2}
          size="lg"
        >
          Oyuna Başla
        </Button>
      </div>
    </div>
  )
}

// ─── GameBoard ────────────────────────────────────────────────────────────────
export function GameBoard() {
  const {
    phase, players, currentPlayerIndex,
    gameMessage, setGameMessage, initGame, log
  } = useGameStore()

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
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-earth-dark text-parchment font-sans">

      {/* ── Lobby overlay ── */}
      {phase === 'lobby' && <LobbyModal />}

      {/* ── Game Over overlay ── */}
      <AnimatePresence>
        {phase === 'finished' && p1 && p2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[90] bg-earth-dark/95 flex flex-col items-center justify-center gap-8"
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
        )}
      </AnimatePresence>

      {/* ── Trap flash overlay ── */}
      <AnimatePresence>
        {gameMessage?.includes('KAPAN') && (
          <motion.div
            key="trap-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 z-[80] bg-red-600 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── Toast message ── */}
      <AnimatePresence>
        {gameMessage && !gameMessage.includes('KAPAN') && phase !== 'finished' && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-gold text-earth-dark px-8 py-4 font-serif text-3xl border-4 border-earth-dark shadow-2xl whitespace-nowrap"
          >
            {gameMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP: AI player ── */}
      <div className={cn(
        "h-[200px] shrink-0 overflow-hidden border-b border-forest px-6 py-3 transition-colors",
        !isPlayer1Turn ? "border-l-8 border-l-forest" : ""
      )}>
        {p2 && <PlayerArea player={p2} isOpponent />}
      </div>

      {/* ── CENTER: Wilderness + Dice ── */}
      <div className="flex-1 flex items-center justify-center gap-12 overflow-hidden px-4">
        {/* Turn indicator */}
        <div className="absolute top-[200px] left-1/2 -translate-x-1/2 mt-2 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayerIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="font-serif text-xl font-bold text-gold tracking-widest uppercase bg-earth-dark px-4 py-1 border border-gold/30"
            >
              {isPlayer1Turn ? 'Senin Sıran' : 'Rakibin Sırası'}
            </motion.div>
          </AnimatePresence>
        </div>

        <WildernessZone />
        <Dice />
      </div>

      {/* ── BOTTOM: Human player ── */}
      <div className={cn(
        "h-[220px] shrink-0 overflow-hidden border-t border-forest px-6 py-3 transition-colors",
        isPlayer1Turn ? "border-l-8 border-l-forest" : ""
      )}>
        {p1 && <PlayerArea player={p1} />}
      </div>

      {/* ── RIGHT: Game log (fixed) ── */}
      <div className="fixed right-0 top-0 h-screen w-[200px] border-l border-forest bg-earth-dark overflow-y-auto p-3 z-20">
        <h3 className="font-serif text-gold text-sm text-center mb-3 uppercase tracking-widest border-b border-forest/30 pb-2">
          Oyun Günlüğü
        </h3>
        <div className="flex flex-col gap-2 text-xs font-mono text-parchment-dark">
          {log.slice(0, 10).map((entry, idx) => (
            <div key={idx} className="border-b border-parchment/10 pb-1">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
