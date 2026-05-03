/**
 * Core Game Engine - Mechanics
 * Tüm oyun mekaniği fonksiyonları. Pure functions, side-effect yok.
 * Hem solo hem online mod tarafından kullanılır.
 */

import { GameState, Player, PreyCard, ToolCard } from '@/types/game'
import { PREY_CARDS, TOOL_CARDS } from './constants'

export interface DiceResult {
  rawRoll: number
  finalRoll: number
  success: boolean
  logMessage: string
}

/**
 * Zar atma mekaniği
 * @param player - Oyuncu (hasBait durumuna göre +1 ekler)
 * @param prey - Hedef av kartı
 * @returns DiceResult - Zar sonucu ve başarı durumu
 */
export function rollDice(player: Player, prey: PreyCard): DiceResult {
  const rawRoll = Math.floor(Math.random() * 6) + 1
  let finalRoll = rawRoll
  let logMessage = `${player.name} zar attı: ${rawRoll}`

  if (player.hasBait) {
    finalRoll = Math.min(6, rawRoll + 1)
    logMessage = `${player.name} zar attı: ${rawRoll} (+1 Yem ile ${finalRoll})`
  }

  // Legendary kartlar (Eagle, Snow Leopard) sadece tam 6 ile yakalanır
  const isExactSixRequired = prey.id === 'p_eagle' || prey.id === 'p_leopard'
  const success = isExactSixRequired ? finalRoll === 6 : finalRoll >= prey.diceThreshold

  return {
    rawRoll,
    finalRoll,
    success,
    logMessage,
  }
}

/**
 * Av kartını yakalama mekaniği
 * @param player - Oyuncu
 * @param prey - Yakalanan av kartı
 * @returns Güncellenmiş oyuncu objesi
 */
export function claimPrey(player: Player, prey: PreyCard): Player {
  return {
    ...player,
    caughtPrey: [...player.caughtPrey, prey],
    score: player.score + prey.points,
    hasBait: false, // Yem kullanıldıysa sıfırla
  }
}

/**
 * Tuzak kartı uygulama mekaniği
 * @param targetPlayer - Hedef oyuncu
 * @returns Güncellenmiş hedef oyuncu (isSkipped: true)
 */
export function applyTrap(targetPlayer: Player): Player {
  return {
    ...targetPlayer,
    isSkipped: true,
  }
}

/**
 * Yem kartı uygulama mekaniği
 * @param player - Oyuncu
 * @returns Güncellenmiş oyuncu (hasBait: true)
 */
export function applyBait(player: Player): Player {
  return {
    ...player,
    hasBait: true,
  }
}

/**
 * Dürbün kartı uygulama mekaniği
 * @param player - Oyuncu
 * @returns Güncellenmiş oyuncu (elinden dürbünü çıkarır)
 */
export function applyBinoculars(player: Player): Player {
  // Dürbün sadece UI state'ini etkiler, oyuncu state'inde değişiklik yok
  return player
}

/**
 * Elinden kart çıkarma mekaniği
 * @param player - Oyuncu
 * @param cardId - Çıkarılacak kart ID'si
 * @returns Güncellenmiş oyuncu (kart elden çıkarılmış)
 */
export function removeCardFromHand(player: Player, cardId: string): Player {
  return {
    ...player,
    hand: player.hand.filter(card => card.id !== cardId),
  }
}

/**
 * Av sahasını yeniden doldurma mekaniği
 * @param deck - Mevcut deste
 * @param wilderness - Mevcut av sahası
 * @returns { deck: newDeck, wilderness: newWilderness }
 */
export function refillWilderness(
  deck: PreyCard[],
  wilderness: PreyCard[]
): { deck: PreyCard[]; wilderness: PreyCard[] } {
  const newDeck = [...deck]
  const newWilderness = [...wilderness]

  if (newWilderness.length === 0 && newDeck.length > 0) {
    newWilderness.push(newDeck.shift()!)
  }

  return {
    deck: newDeck,
    wilderness: newWilderness,
  }
}

/**
 * Oyun bitiş kontrolü
 * @param state - Oyun state'i
 * @returns boolean - Oyun bitti mi?
 */
export function isGameOver(state: GameState): boolean {
  return state.deck.length === 0 && state.wilderness.length === 0
}

/**
 * Kazananı belirleme
 * @param players - Oyuncular
 * @returns string - Kazananın adı veya "Berabere"
 */
export function determineWinner(players: Player[]): string {
  const p1 = players[0]
  const p2 = players[1]

  if (p1.score > p2.score) return p1.name
  if (p2.score > p1.score) return p2.name
  return 'Berabere! Kimse'
}

/**
 * Oyuncu elini başlangıçta dağıtma
 * @param toolDeck - Alet destesi
 * @param cardCount - Kaç kart dağıtılacak (default: 2)
 * @returns { hand: ToolCard[], remainingDeck: ToolCard[] }
 */
export function drawInitialHand(
  toolDeck: ToolCard[],
  cardCount: number = 2
): { hand: ToolCard[]; remainingDeck: ToolCard[] } {
  const deck = [...toolDeck]
  const hand: ToolCard[] = []

  for (let i = 0; i < Math.min(cardCount, deck.length); i++) {
    hand.push(deck.shift()!)
  }

  return { hand, remainingDeck: deck }
}
