import { create } from 'zustand'
import { GameState, Player } from '@/types/game'
import { PREY_CARDS, TOOL_CARDS } from '@/features/cards/data/cards'

export interface GameStore extends GameState {
  initGame: (playerName: string) => void
  rollAndClaim: () => void
  endTurn: () => void
  playTrap: (targetPlayerId: string) => void
  playBinoculars: () => void
  playBait: () => void
  _aiTakeTurn: () => void
  _refillWilderness: () => void
  _checkGameOver: () => boolean

  consecutiveFails: number

  diceValue: number | null
  diceRolled: boolean
  rollSuccess: boolean | null
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

  consecutiveFails: 0,

  diceValue: null,
  diceRolled: false,
  rollSuccess: null,
  binocularsActive: false,
  pendingTrapTarget: false,
  gameMessage: '',

  setGameMessage: (msg: string) => set({ gameMessage: msg }),
  setPendingTrapTarget: (v: boolean) => set({ pendingTrapTarget: v }),

  initGame: (playerName: string) => {
    const shuffledPrey = shuffleArray([...PREY_CARDS])
    const shuffledTools = shuffleArray([...TOOL_CARDS])

    const wilderness = shuffledPrey.splice(0, 1) // Exactly 1 card

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
      consecutiveFails: 0,
      diceValue: null,
      diceRolled: false,
      rollSuccess: null,
      binocularsActive: false,
      pendingTrapTarget: false,
      gameMessage: '',
    })

    if (get().players[firstPlayerIndex].isAI) {
      get()._aiTakeTurn()
    }
  },

  rollAndClaim: () => {
    const state = get()
    if (state.diceRolled) return

    const currentPlayer = state.players[state.currentPlayerIndex]
    const prey = state.wilderness[0]
    if (!prey) return

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

    const isLegendarySnowLeopard = prey.id === 'p_leopard'
    const success = isLegendarySnowLeopard ? roll === 6 : roll >= prey.diceThreshold

    set({
      diceValue: roll,
      diceRolled: true,
      rollSuccess: success,
      log: [logMsg, ...state.log]
    })

    setTimeout(() => {
       const currentState = get()
       if (success) {
          const newPlayers = [...currentState.players]
          const player = { ...currentState.players[currentState.currentPlayerIndex] }
          player.caughtPrey = [...player.caughtPrey, prey]
          player.score += prey.points
          newPlayers[currentState.currentPlayerIndex] = player

          set({
             wilderness: [],
             players: newPlayers,
             log: [`${player.name}, ${prey.nameTr} avladı! (+${prey.points}p)`, ...currentState.log],
             diceRolled: false,
             diceValue: null,
             rollSuccess: null,
             binocularsActive: false,
             consecutiveFails: 0
          })
          get()._refillWilderness()
          get().endTurn()
       } else {
          const newFails = currentState.consecutiveFails + 1
          const failMessage = currentPlayer.isAI 
            ? 'Rakip tutturamadı, sıra sende.' 
            : 'Tutturamadın, sıra rakibe geçti.'
          
          let failLog = [failMessage, ...currentState.log]

          if (newFails >= 2) {
             const missedPrey = currentState.wilderness[0]
             const newDeck = shuffleArray([...currentState.deck, missedPrey])
             
             set({
                consecutiveFails: 0,
                log: ["Av kaçtı! Yeni av sahasına çıktı.", ...failLog],
                diceRolled: false,
                diceValue: null,
                rollSuccess: null,
                deck: newDeck,
                wilderness: []
             })
             get()._refillWilderness()
             get().endTurn()
          } else {
             set({
                consecutiveFails: newFails,
                log: failLog,
                diceRolled: false,
                diceValue: null,
                rollSuccess: null
             })
             get().endTurn()
          }
       }
    }, 1500)
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
      rollSuccess: null,
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

      const prey = state.wilderness[0]
      if (prey) {
        if (prey.diceThreshold >= 5) {
          const baitIndex = aiPlayer.hand.findIndex(c => c.toolType === 'bait')
          if (baitIndex !== -1) {
            get().playBait()
          }
        }
      }

      setTimeout(() => {
        get().rollAndClaim()
      }, 1000)
    }, 1000)
  },

  _refillWilderness: () => {
    const state = get()
    let newWilderness = [...state.wilderness]
    let newDeck = [...state.deck]

    if (newWilderness.length === 0 && newDeck.length > 0) {
      newWilderness.push(newDeck.shift()!)
    }

    set({
      wilderness: newWilderness,
      deck: newDeck
    })
    
    // Check if game is over after refill attempt
    get()._checkGameOver()
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
