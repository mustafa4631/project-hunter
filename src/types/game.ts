// Card types
export type CardType = 'prey' | 'tool'
export type ToolType = 'trap' | 'binoculars' | 'bait'

export interface PreyCard {
  id: string
  type: 'prey'
  name: string
  nameTr: string
  points: number
  diceThreshold: number  // minimum dice roll to catch
  icon: string           // emoji for now
  rarity: 'common' | 'rare' | 'legendary'
}

export interface ToolCard {
  id: string
  type: 'tool'
  toolType: ToolType
  name: string
  nameTr: string
  description: string
  icon: string
}

export type Card = PreyCard | ToolCard

export interface Player {
  id: string
  name: string
  isAI: boolean
  score: number
  hand: ToolCard[]        // tool cards in hand
  caughtPrey: PreyCard[]  // caught prey cards
  isSkipped: boolean      // affected by trap
  hasBait?: boolean       // affected by bait
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'finished'
  players: Player[]
  currentPlayerIndex: number
  wilderness: PreyCard[]  // 3-4 cards in the middle
  deck: PreyCard[]        // remaining prey deck
  toolDeck: ToolCard[]    // remaining tool deck
  round: number
  log: string[]           // game event log
}
