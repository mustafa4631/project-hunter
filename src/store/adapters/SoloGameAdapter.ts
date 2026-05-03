/**
 * Solo Game Adapter
 * AI rakip ile offline oyun modu
 */

import { IGameAdapter, GameAction } from './IGameAdapter'
import { GameState, Player } from '@/types/game'
import { PREY_CARDS, TOOL_CARDS } from '@/lib/game-engine/constants'
import { drawInitialHand, rollDice, claimPrey, applyTrap, applyBait, removeCardFromHand, refillWilderness, isGameOver, determineWinner } from '@/lib/game-engine/mechanics'
import { canPlayCard, isValidTrapTarget, canRollDice } from '@/lib/game-engine/validation'

export class SoloGameAdapter implements IGameAdapter {
  private state: GameState | null = null
  private subscribers: ((state: GameState) => void)[] = []
  private aiTimeout: NodeJS.Timeout | null = null

  async initGame(config: { playerName: string; mode: 'solo' | 'online'; roomId?: string }): Promise<void> {
    // Mevcut AI timeout'larını temizle
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout)
      this.aiTimeout = null
    }

    // Desteleri karıştır
    const shuffledPrey = this.shuffleArray([...PREY_CARDS])
    const shuffledTools = this.shuffleArray([...TOOL_CARDS])

    // Wilderness: Sadece 1 kart
    const wilderness = shuffledPrey.splice(0, 1)

    // Oyuncuları oluştur - Fix: Draw hands sequentially to consume cards from deck
    const p1Draw = drawInitialHand(shuffledTools, 2)
    const player1: Player = {
      id: 'p1',
      name: config.playerName,
      isAI: false,
      score: 0,
      hand: p1Draw.hand,
      caughtPrey: [],
      isSkipped: false,
      hasBait: false,
    }

    const p2Draw = drawInitialHand(p1Draw.remainingDeck, 2)
    const player2: Player = {
      id: 'p2',
      name: 'Rakip',
      isAI: true,
      score: 0,
      hand: p2Draw.hand,
      caughtPrey: [],
      isSkipped: false,
      hasBait: false,
    }

    // Random başlangıç oyuncusu
    const firstPlayerIndex = Math.random() > 0.5 ? 0 : 1

    this.state = {
      phase: 'playing',
      gameMode: 'solo',
      players: [player1, player2],
      currentPlayerIndex: firstPlayerIndex,
      wilderness,
      deck: shuffledPrey,
      toolDeck: p2Draw.remainingDeck,
      round: 1,
      log: ['Oyun başladı!'],
    }

    // State'i yayınla
    this.notifySubscribers()

    // Eğer AI başlıyorsa, AI turunu başlat
    if (this.state.players[firstPlayerIndex].isAI) {
      this._aiTakeTurn()
    }
  }

  async executeAction(action: GameAction): Promise<void> {
    if (!this.state) throw new Error('Oyun başlatılmadı')

    switch (action.type) {
      case 'ROLL_DICE':
        this._handleRollDice()
        break
      case 'PLAY_TRAP':
        this._handlePlayTrap(action.targetPlayerId)
        break
      case 'PLAY_BINOCULARS':
        this._handlePlayBinoculars()
        break
      case 'PLAY_BAIT':
        this._handlePlayBait()
        break
      case 'END_TURN':
        this._handleEndTurn()
        break
    }
  }

  subscribe(callback: (state: GameState) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  cleanup(): void {
    if (this.aiTimeout) {
      clearTimeout(this.aiTimeout)
      this.aiTimeout = null
    }
    this.subscribers = []
    this.state = null
  }

  private notifySubscribers(): void {
    if (!this.state) return
    // Fix: Send a shallow copy to ensure Zustand triggers re-render
    const stateCopy = { ...this.state }
    this.subscribers.forEach(callback => callback(stateCopy))
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  private _handleRollDice(): void {
    if (!this.state) return

    const validation = canRollDice(this.state)
    if (!validation.valid) {
      console.warn(validation.error)
      return
    }

    const currentPlayer = this.state.players[this.state.currentPlayerIndex]
    const prey = this.state.wilderness[0]
    if (!prey) return

    const diceResult = rollDice(currentPlayer, prey)

    // Log'u güncelle
    this.state.log = [diceResult.logMessage, ...this.state.log]

    // Zar sonucunu state'e ekle (UI için)
    ;(this.state as any).diceValue = diceResult.finalRoll
    ;(this.state as any).diceRolled = true
    ;(this.state as any).rollSuccess = diceResult.success

    this.notifySubscribers()

    // 1.5 saniye sonra sonucu işle
    setTimeout(() => {
      if (!this.state) return

      if (diceResult.success) {
        // Avı yakalama
        const updatedPlayer = claimPrey(currentPlayer, prey)
        const newPlayers = [...this.state.players]
        newPlayers[this.state.currentPlayerIndex] = updatedPlayer

        // Yem kullanıldıysa state'i temizle
        if (currentPlayer.hasBait) {
          newPlayers[this.state.currentPlayerIndex] = {
            ...updatedPlayer,
            hasBait: false,
          }
        }

        this.state.players = newPlayers
        this.state.wilderness = []
        this.state.log = [
          `${updatedPlayer.name}, ${prey.nameTr} avladı! (+${prey.points}p)`,
          ...this.state.log,
        ]

        // UI state'ini temizle
        ;(this.state as any).diceRolled = false
        ;(this.state as any).diceValue = null
        ;(this.state as any).rollSuccess = null
        ;(this.state as any).binocularsActive = false
        ;(this.state as any).consecutiveFails = 0

        // Wilderness'ı yeniden doldur
        this._refillWilderness()

        // Turu bitir
        this._handleEndTurn()
      } else {
        // Başarısız
        const newFails = ((this.state as any).consecutiveFails || 0) + 1
        const failMessage = currentPlayer.isAI
          ? 'Rakip tutturamadı, sıra sende.'
          : 'Tutturamadın, sıra rakibe geçti.'

        this.state.log = [failMessage, ...this.state.log]

        if (newFails >= 2) {
          // Kart kaçtı
          const missedPrey = this.state.wilderness[0]
          const newDeck = this.shuffleArray([...this.state.deck, missedPrey])

          ;(this.state as any).consecutiveFails = 0
          this.state.log = ['Av kaçtı! Yeni av sahasına çıktı.', ...this.state.log]
          this.state.deck = newDeck
          this.state.wilderness = []

          this._refillWilderness()
          this._handleEndTurn()
        } else {
          ;(this.state as any).consecutiveFails = newFails
          ;(this.state as any).diceRolled = false
          ;(this.state as any).diceValue = null
          ;(this.state as any).rollSuccess = null
          this._handleEndTurn()
        }
      }

      this.notifySubscribers()
    }, 1500)
  }

  private _handlePlayTrap(targetPlayerId: string): void {
    if (!this.state) return

    const currentPlayer = this.state.players[this.state.currentPlayerIndex]
    const validation = canPlayCard(currentPlayer, 't_trap_1')
    if (!validation.valid) {
      console.warn(validation.error)
      return
    }

    const targetValidation = isValidTrapTarget(this.state, targetPlayerId)
    if (!targetValidation.valid) {
      console.warn(targetValidation.error)
      return
    }

    const trapIndex = currentPlayer.hand.findIndex(c => c.toolType === 'trap')
    if (trapIndex === -1) return

    const targetIndex = this.state.players.findIndex(p => p.id === targetPlayerId)
    const updatedTarget = applyTrap(this.state.players[targetIndex])

    const newPlayers = [...this.state.players]
    newPlayers[targetIndex] = updatedTarget
    newPlayers[this.state.currentPlayerIndex] = removeCardFromHand(currentPlayer, currentPlayer.hand[trapIndex].id)

    this.state.players = newPlayers
    this.state.log = [
      `${currentPlayer.name}, ${updatedTarget.name}'ye kapan kurdu!`,
      ...this.state.log,
    ]

    this.notifySubscribers()
  }

  private _handlePlayBinoculars(): void {
    if (!this.state) return

    const currentPlayer = this.state.players[this.state.currentPlayerIndex]
    const validation = canPlayCard(currentPlayer, 't_binoculars_1')
    if (!validation.valid) {
      console.warn(validation.error)
      return
    }

    const binocIndex = currentPlayer.hand.findIndex(c => c.toolType === 'binoculars')
    if (binocIndex === -1) return

    const newPlayers = [...this.state.players]
    newPlayers[this.state.currentPlayerIndex] = removeCardFromHand(currentPlayer, currentPlayer.hand[binocIndex].id)

    this.state.players = newPlayers
    ;(this.state as any).binocularsActive = true
    this.state.log = ['Dürbün kullanıldı — av sahası inceleniyor', ...this.state.log]

    this.notifySubscribers()
  }

  private _handlePlayBait(): void {
    if (!this.state) return

    const currentPlayer = this.state.players[this.state.currentPlayerIndex]
    const validation = canPlayCard(currentPlayer, 't_bait_1')
    if (!validation.valid) {
      console.warn(validation.error)
      return
    }

    const baitIndex = currentPlayer.hand.findIndex(c => c.toolType === 'bait')
    if (baitIndex === -1) return

    const updatedPlayer = applyBait(currentPlayer)
    const newPlayers = [...this.state.players]
    newPlayers[this.state.currentPlayerIndex] = removeCardFromHand(updatedPlayer, currentPlayer.hand[baitIndex].id)

    this.state.players = newPlayers
    this.state.log = ['Yem hazırlandı — zar +1 alacak', ...this.state.log]

    this.notifySubscribers()
  }

  private _handleEndTurn(): void {
    if (!this.state) return

    // Oyun bitti mi kontrol et
    if (isGameOver(this.state)) {
      const winner = determineWinner(this.state.players)
      this.state.phase = 'finished'
      ;(this.state as any).gameMessage = `${winner} Kazandı!`
      this.notifySubscribers()
      return
    }

    // Sıradaki oyuncuya geç
    let nextPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length
    let nextPlayer = this.state.players[nextPlayerIndex]

    const newPlayers = [...this.state.players]

    // Tuzak kontrolü
    if (nextPlayer.isSkipped) {
      this.state.log = [`${nextPlayer.name} tuzakta, tur atlandı!`, ...this.state.log]
      newPlayers[nextPlayerIndex] = { ...nextPlayer, isSkipped: false }
      nextPlayerIndex = (nextPlayerIndex + 1) % this.state.players.length
      nextPlayer = this.state.players[nextPlayerIndex]
    }

    this.state.players = newPlayers
    this.state.currentPlayerIndex = nextPlayerIndex

    // UI state'ini temizle
    ;(this.state as any).diceValue = null
    ;(this.state as any).diceRolled = false
    ;(this.state as any).rollSuccess = null
    ;(this.state as any).binocularsActive = false
    ;(this.state as any).pendingTrapTarget = false

    this.notifySubscribers()

    // Eğer sıra AI'da ise AI turunu başlat
    if (nextPlayer.isAI) {
      this._aiTakeTurn()
    }
  }

  private _refillWilderness(): void {
    if (!this.state) return

    const result = refillWilderness(this.state.deck, this.state.wilderness)
    this.state.deck = result.deck
    this.state.wilderness = result.wilderness

    // Oyun bitti mi tekrar kontrol et
    if (isGameOver(this.state)) {
      const winner = determineWinner(this.state.players)
      this.state.phase = 'finished'
      ;(this.state as any).gameMessage = `${winner} Kazandı!`
    }

    this.notifySubscribers()
  }

  private _aiTakeTurn(): void {
    this.aiTimeout = setTimeout(() => {
      if (!this.state) return
      if (this.state.phase !== 'playing') return

      const aiPlayer = this.state.players[this.state.currentPlayerIndex]
      if (!aiPlayer.isAI) return

      // Tuzak kullan (eğer varsa ve rakip tuzakta değilse)
      const opponentIndex = this.state.players.findIndex(p => !p.isAI)
      if (opponentIndex !== -1 && !this.state.players[opponentIndex].isSkipped) {
        const trapIndex = aiPlayer.hand.findIndex(c => c.toolType === 'trap')
        if (trapIndex !== -1) {
          this.executeAction({ type: 'PLAY_TRAP', targetPlayerId: this.state.players[opponentIndex].id })
        }
      }

      // Yem kullan (eğer zor kart ve yem varsa)
      const prey = this.state.wilderness[0]
      if (prey && prey.diceThreshold >= 5) {
        const baitIndex = aiPlayer.hand.findIndex(c => c.toolType === 'bait')
        if (baitIndex !== -1) {
          this.executeAction({ type: 'PLAY_BAIT' })
        }
      }

      // Zar at
      setTimeout(() => {
        this.executeAction({ type: 'ROLL_DICE' })
      }, 1000)
    }, 1000)
  }
}
