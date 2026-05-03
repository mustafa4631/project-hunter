'use client'

import * as React from 'react'
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

  if (phase === 'lobby') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-earth-dark text-parchment absolute inset-0 z-50">
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
      </div>
    )
  }

  const p1 = players.find(p => !p.isAI)
  const p2 = players.find(p => p.isAI)

  if (!p1 || !p2) return null

  const isPlayer1Turn = players[currentPlayerIndex]?.id === p1.id

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-earth-dark text-parchment font-sans overflow-hidden">
      
      {/* Game Message Toast */}
      {gameMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gold text-earth-dark px-8 py-4 font-serif text-4xl border-4 border-earth-dark shadow-2xl animate-pulse whitespace-nowrap">
          {gameMessage}
        </div>
      )}

      {/* Game Over Screen */}
      {phase === 'finished' && (
        <div className="absolute inset-0 z-50 bg-earth-dark/95 flex flex-col items-center justify-center gap-8">
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
        </div>
      )}

      {/* Top: Opponent Area */}
      <section className={cn("pt-4 pb-2 border-b-2 bg-earth-dark/50 transition-colors", 
        !isPlayer1Turn ? "border-l-8 border-l-forest border-b-forest/30" : "border-b-forest/30"
      )}>
        <PlayerArea player={p2} isOpponent />
      </section>

      {/* Center: Wilderness + Dice + Log */}
      <section className="flex flex-col md:flex-row items-stretch justify-center relative flex-1">
        
        {/* Main Center Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 font-serif text-4xl font-bold text-gold tracking-widest uppercase bg-earth-dark px-6 py-2 border-y-2 border-gold/30 z-20">
            {isPlayer1Turn ? 'Senin Sıran' : 'Rakibin Sırası'}
          </div>
          <WildernessZone />
          <div className="md:absolute md:right-12 xl:right-24 z-10">
            <Dice />
          </div>
        </div>

        {/* Game Log Panel */}
        <div className="w-[200px] border-l-2 border-forest/30 bg-parchment/10 flex flex-col p-4">
          <h3 className="font-serif text-gold text-sm text-center mb-4 uppercase tracking-widest border-b border-forest/30 pb-2">Oyun Günlüğü</h3>
          <div className="flex flex-col gap-2 overflow-y-auto text-xs font-mono text-parchment-dark">
            {log.slice(0, 8).map((entry, idx) => (
              <div key={idx} className="border-b border-parchment/10 pb-1">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom: Current Player Area */}
      <section className={cn("pt-2 pb-8 border-t-2 bg-earth-dark transition-colors",
        isPlayer1Turn ? "border-l-8 border-l-forest border-t-forest" : "border-t-forest"
      )}>
        <PlayerArea player={p1} />
      </section>
    </div>
  )
}
