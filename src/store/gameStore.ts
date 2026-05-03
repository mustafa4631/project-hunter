import { create } from 'zustand'
import { GameState } from '@/types/game'

interface GameStore extends GameState {
  // Actions will be added in Phase 2
}

const useGameStore = create<GameStore>()((set) => ({
  phase: 'lobby',
  players: [],
  currentPlayerIndex: 0,
  wilderness: [],
  deck: [],
  toolDeck: [],
  round: 1,
  log: [],
}))

export default useGameStore
