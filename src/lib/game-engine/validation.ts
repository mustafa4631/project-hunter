/**
 * Core Game Engine - Validation
 * Oyun aksiyonlarını doğrulama fonksiyonları
 */

import { GameState, Player, ToolCard } from '@/types/game'

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Kart oynanabilir mi kontrolü
 * @param player - Oyuncu
 * @param cardId - Oynanacak kart ID'si
 * @returns ValidationResult
 */
export function canPlayCard(player: Player, cardId: string): ValidationResult {
  const card = player.hand.find(c => c.id === cardId)
  if (!card) {
    return { valid: false, error: 'Kart elinde yok' }
  }

  return { valid: true }
}

/**
 * Tuzak kartı hedefi geçerli mi
 * @param state - Oyun state'i
 * @param targetPlayerId - Hedef oyuncu ID'si
 * @returns ValidationResult
 */
export function isValidTrapTarget(state: GameState, targetPlayerId: string): ValidationResult {
  const targetPlayer = state.players.find(p => p.id === targetPlayerId)
  if (!targetPlayer) {
    return { valid: false, error: 'Hedef oyuncu bulunamadı' }
  }

  if (targetPlayer.isSkipped) {
    return { valid: false, error: 'Hedef zaten tuzakta' }
  }

  return { valid: true }
}

/**
 * Zar atma durumu geçerli mi
 * @param state - Oyun state'i
 * @returns ValidationResult
 */
export function canRollDice(state: GameState): ValidationResult {
  if (state.phase !== 'playing') {
    return { valid: false, error: 'Oyun oynama aşamasında değil' }
  }

  const currentPlayer = state.players[state.currentPlayerIndex]
  if (currentPlayer.isSkipped) {
    return { valid: false, error: 'Sıranız tuzakta, atlanıyor' }
  }

  return { valid: true }
}
