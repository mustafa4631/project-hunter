import { create } from 'zustand'
import { GameState } from '@/types/game'
import { IGameAdapter } from './adapters/IGameAdapter'
import { SoloGameAdapter } from './adapters/SoloGameAdapter'

export interface GameStore extends GameState {
  // UI State
  diceValue: number | null
  diceRolled: boolean
  rollSuccess: boolean | null
  binocularsActive: boolean
  pendingTrapTarget: boolean
  gameMessage: string
  consecutiveFails: number

  // Core Actions
  initGame: (playerName: string, mode?: 'solo' | 'online', roomId?: string) => void
  rollAndClaim: () => void
  endTurn: () => void
  playTrap: (targetPlayerId: string) => void
  playBinoculars: () => void
  playBait: () => void

  // UI Helpers
  setGameMessage: (msg: string) => void
  setPendingTrapTarget: (v: boolean) => void

  // Internal
  _adapter: IGameAdapter | null
  _cleanup: () => void
}

const useGameStore = create<GameStore>()((set, get) => ({
  // GameState defaults
  phase: 'lobby',
  gameMode: 'solo',
  roomId: undefined,
  players: [],
  currentPlayerIndex: 0,
  wilderness: [],
  deck: [],
  toolDeck: [],
  round: 1,
  log: [],

  // UI State
  diceValue: null,
  diceRolled: false,
  rollSuccess: null,
  binocularsActive: false,
  pendingTrapTarget: false,
  gameMessage: '',
  consecutiveFails: 0,

  // Adapter instance
  _adapter: null,

  // UI Helpers
  setGameMessage: (msg: string) => set({ gameMessage: msg }),
  setPendingTrapTarget: (v: boolean) => set({ pendingTrapTarget: v }),

  // Core Actions
  initGame: (playerName: string, mode: 'solo' | 'online' = 'solo', roomId?: string) => {
    console.log('gameStore: initGame called', { playerName, mode, roomId })
    // Önceki oyunu temizle
    get()._cleanup()

    let adapter: IGameAdapter

    if (mode === 'solo') {
      adapter = new SoloGameAdapter()
    } else {
      // Online mod için adapter henüz implemente edilmedi
      // Şimdilik solo fallback
      console.warn('Online mod henüz hazır değil, solo mod başlatılıyor')
      adapter = new SoloGameAdapter()
    }

    // Adapter'a abone ol
    adapter.subscribe(state => {
      console.log('gameStore: State update from adapter', state.phase)
      set(state as any)
    })

    // Adapter'ı store'a kaydet
    set({ _adapter: adapter })

    // Oyunu başlat
    adapter.initGame({ playerName, mode, roomId })
  },

  rollAndClaim: () => {
    const adapter = get()._adapter
    if (!adapter) return

    adapter.executeAction({ type: 'ROLL_DICE' })
  },

  endTurn: () => {
    const adapter = get()._adapter
    if (!adapter) return

    adapter.executeAction({ type: 'END_TURN' })
  },

  playTrap: (targetPlayerId: string) => {
    const adapter = get()._adapter
    if (!adapter) return

    adapter.executeAction({ type: 'PLAY_TRAP', targetPlayerId })
  },

  playBinoculars: () => {
    const adapter = get()._adapter
    if (!adapter) return

    adapter.executeAction({ type: 'PLAY_BINOCULARS' })
  },

  playBait: () => {
    const adapter = get()._adapter
    if (!adapter) return

    adapter.executeAction({ type: 'PLAY_BAIT' })
  },

  _cleanup: () => {
    const adapter = get()._adapter
    if (adapter) {
      adapter.cleanup()
    }
    set({ _adapter: null })
  },
}))

export default useGameStore
