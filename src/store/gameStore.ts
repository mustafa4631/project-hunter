import { create } from 'zustand'
import { GameState, PreyCard, ToolCard, Player } from '@/types/game'
import { PREY_CARDS, TOOL_CARDS } from '@/features/cards/data/cards'

export interface GameStore extends GameState {
  initGame: (playerName: string) => void
  rollDice: () => void
  claimPrey: (preyId: string) => void
  endTurn: () => void
  playTrap: (targetPlayerId: string) => void
  playBinoculars: () => void
  playBait: () => void
  _aiTakeTurn: () => void
  _refillWilderness: () => void
  _checkGameOver: () => boolean

  diceValue: number | null
  diceRolled: boolean
  binocularsActive: boolean
  pendingTrapTarget: boolean
  gameMessage: string
  
  // Expose these for UI convenience
  setGameMessage: (msg: string) => void
  setPendingTrapTarget: (v: boolean) => void
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

const useGameStore = create<GameStore>()((set, get) => ({
  phase: 'lobby',
  players: [],
  currentPlayerIndex: 0,
  wilderness: [],
  deck: [],
  toolDeck: [],
  round: 1,
  log: [],

  diceValue: null,
  diceRolled: false,
  binocularsActive: false,
  pendingTrapTarget: false,
  gameMessage: '',

  setGameMessage: (msg: string) => set({ gameMessage: msg }),
  setPendingTrapTarget: (v: boolean) => set({ pendingTrapTarget: v }),

  initGame: (playerName: string) => {
    const shuffledPrey = shuffleArray([...PREY_CARDS])
    const shuffledTools = shuffleArray([...TOOL_CARDS])

    const wilderness = shuffledPrey.splice(0, 4)

    const player1: Player = {
      id: 'p1',
      name: playerName,
      isAI: false,
      score: 0,
      hand: shuffledTools.splice(0, 2),
      caughtPrey: [],
      isSkipped: false,
      hasBait: false,
    }

    const player2: Player = {
      id: 'p2',
      name: 'Rakip',
      isAI: true,
      score: 0,
      hand: shuffledTools.splice(0, 2),
      caughtPrey: [],
      isSkipped: false,
      hasBait: false,
    }

    const firstPlayerIndex = Math.random() > 0.5 ? 0 : 1

    set({
      phase: 'playing',
      players: [player1, player2],
      currentPlayerIndex: firstPlayerIndex,
      wilderness,
      deck: shuffledPrey,
      toolDeck: shuffledTools,
      round: 1,
      log: ['Oyun başladı!'],
      diceValue: null,
      diceRolled: false,
      binocularsActive: false,
      pendingTrapTarget: false,
      gameMessage: '',
    })

    if (get().players[firstPlayerIndex].isAI) {
      get()._aiTakeTurn()
    }
  },

  rollDice: () => {
    const state = get()
    if (state.diceRolled) return

    const currentPlayer = state.players[state.currentPlayerIndex]
    let rawRoll = Math.floor(Math.random() * 6) + 1
    
    let roll = rawRoll
    let logMsg = `${currentPlayer.name} zar attı: ${roll}`
    
    if (currentPlayer.hasBait) {
      roll = Math.min(6, roll + 1)
      logMsg = `${currentPlayer.name} zar attı: ${rawRoll} (+1 Yem ile ${roll})`
      
      const updatedPlayers = [...state.players]
      updatedPlayers[state.currentPlayerIndex] = { ...currentPlayer, hasBait: false }
      set({ players: updatedPlayers })
    }

    set({
      diceValue: roll,
      diceRolled: true,
      log: [logMsg, ...state.log]
    })
  },

  claimPrey: (preyId: string) => {
    const state = get()
    if (!state.diceRolled || state.diceValue === null) return

    const preyIndex = state.wilderness.findIndex(p => p.id === preyId)
    if (preyIndex === -1) return
    const prey = state.wilderness[preyIndex]

    const isLegendarySnowLeopard = prey.id === 'p_leopard'
    const canClaim = isLegendarySnowLeopard
      ? state.diceValue === 6
      : state.diceValue >= prey.diceThreshold

    const currentPlayer = state.players[state.currentPlayerIndex]

    if (canClaim) {
      const newWilderness = [...state.wilderness]
      newWilderness.splice(preyIndex, 1)

      const newPlayers = [...state.players]
      const player = { ...currentPlayer }
      player.caughtPrey = [...player.caughtPrey, prey]
      player.score += prey.points
      newPlayers[state.currentPlayerIndex] = player

      set({
        wilderness: newWilderness,
        players: newPlayers,
        log: [`${player.name}, ${prey.nameTr} avladı! (+${prey.points}p)`, ...state.log],
        diceRolled: false,
        diceValue: null,
        binocularsActive: false
      })

      get()._refillWilderness()
      get().endTurn()
    } else {
      set({
        log: ['Yetersiz zar!', ...state.log]
      })
    }
  },

  endTurn: () => {
    const state = get()
    const isGameOver = get()._checkGameOver()
    if (isGameOver) return

    let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length
    let nextPlayer = state.players[nextPlayerIndex]

    const newPlayers = [...state.players]

    if (nextPlayer.isSkipped) {
      set({ log: [`${nextPlayer.name} tuzakta, tur atlandı!`, ...state.log] })
      newPlayers[nextPlayerIndex] = { ...nextPlayer, isSkipped: false }
      nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length
      nextPlayer = state.players[nextPlayerIndex]
    }

    set({
      players: newPlayers,
      currentPlayerIndex: nextPlayerIndex,
      diceValue: null,
      diceRolled: false,
      binocularsActive: false,
      pendingTrapTarget: false
    })

    if (nextPlayer.isAI) {
      get()._aiTakeTurn()
    }
  },

  playTrap: (targetPlayerId: string) => {
    const state = get()
    const currentPlayer = state.players[state.currentPlayerIndex]
    
    const trapIndex = currentPlayer.hand.findIndex(c => c.toolType === 'trap')
    if (trapIndex === -1) return

    const newPlayers = [...state.players]
    const targetIndex = newPlayers.findIndex(p => p.id === targetPlayerId)
    
    if (targetIndex !== -1) {
      newPlayers[targetIndex] = { ...newPlayers[targetIndex], isSkipped: true }
      
      const newHand = [...currentPlayer.hand]
      newHand.splice(trapIndex, 1)
      newPlayers[state.currentPlayerIndex] = { ...currentPlayer, hand: newHand }

      set({
        players: newPlayers,
        log: [`${currentPlayer.name}, ${newPlayers[targetIndex].name}'ye kapan kurdu!`, ...state.log],
        gameMessage: 'KAPAN!',
        pendingTrapTarget: false
      })
    }
  },

  playBinoculars: () => {
    const state = get()
    const currentPlayer = state.players[state.currentPlayerIndex]
    
    const binocIndex = currentPlayer.hand.findIndex(c => c.toolType === 'binoculars')
    if (binocIndex === -1) return

    const newPlayers = [...state.players]
    const newHand = [...currentPlayer.hand]
    newHand.splice(binocIndex, 1)
    newPlayers[state.currentPlayerIndex] = { ...currentPlayer, hand: newHand }

    set({
      players: newPlayers,
      binocularsActive: true,
      log: ['Dürbün kullanıldı — av sahası inceleniyor', ...state.log]
    })
  },

  playBait: () => {
    const state = get()
    const currentPlayer = state.players[state.currentPlayerIndex]
    
    const baitIndex = currentPlayer.hand.findIndex(c => c.toolType === 'bait')
    if (baitIndex === -1) return

    const newPlayers = [...state.players]
    const newHand = [...currentPlayer.hand]
    newHand.splice(baitIndex, 1)
    newPlayers[state.currentPlayerIndex] = { ...currentPlayer, hand: newHand, hasBait: true }

    set({
      players: newPlayers,
      log: ['Yem hazırlandı — zar +1 alacak', ...state.log]
    })
  },

  _aiTakeTurn: () => {
    setTimeout(() => {
      const state = get()
      if (state.phase !== 'playing') return
      
      const aiPlayer = state.players[state.currentPlayerIndex]
      
      // Use trap if available and opponent is not skipped
      const opponentIndex = state.players.findIndex(p => !p.isAI)
      if (opponentIndex !== -1 && !state.players[opponentIndex].isSkipped) {
         const trapIndex = aiPlayer.hand.findIndex(c => c.toolType === 'trap')
         if (trapIndex !== -1) {
           get().playTrap(state.players[opponentIndex].id)
         }
      }

      // Check if any prey is definitely claimable right now without rolling (not possible, must roll)
      
      // Decide to use bait? If max diceThreshold is 5 or 6, might use bait
      if (state.wilderness.some(p => p.diceThreshold >= 5)) {
        const baitIndex = aiPlayer.hand.findIndex(c => c.toolType === 'bait')
        if (baitIndex !== -1) {
          get().playBait()
        }
      }

      setTimeout(() => {
        get().rollDice()
        
        setTimeout(() => {
           const afterRollState = get()
           const roll = afterRollState.diceValue
           if (roll !== null) {
              const claimable = afterRollState.wilderness.filter(p => {
                if (p.id === 'p_leopard') return roll === 6
                return roll >= p.diceThreshold
              })

              if (claimable.length > 0) {
                 // Pick highest points
                 const bestPrey = claimable.reduce((prev, curr) => (prev.points > curr.points) ? prev : curr)
                 get().claimPrey(bestPrey.id)
              } else {
                 afterRollState.endTurn()
              }
           } else {
             get().endTurn()
           }
        }, 1000)
      }, 1000)
    }, 1000)
  },

  _refillWilderness: () => {
    const state = get()
    let newWilderness = [...state.wilderness]
    let newDeck = [...state.deck]

    while (newWilderness.length < 4 && newDeck.length > 0) {
      newWilderness.push(newDeck.shift()!)
    }

    set({
      wilderness: newWilderness,
      deck: newDeck
    })
  },

  _checkGameOver: () => {
    const state = get()
    if (state.deck.length === 0 && state.wilderness.length === 0) {
      const p1 = state.players[0]
      const p2 = state.players[1]
      let winnerName = ''
      if (p1.score > p2.score) winnerName = p1.name
      else if (p2.score > p1.score) winnerName = p2.name
      else winnerName = 'Berabere! Kimse'

      set({
        phase: 'finished',
        gameMessage: `${winnerName} Kazandı!`
      })
      return true
    }
    return false
  }
}))

export default useGameStore
