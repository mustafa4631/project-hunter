/**
 * Adapter Pattern Interface
 * Solo ve Online modlar bu interface'i implement eder
 */

import { GameState } from '@/types/game'

export type GameAction =
  | { type: 'ROLL_DICE' }
  | { type: 'PLAY_TRAP'; targetPlayerId: string }
  | { type: 'PLAY_BINOCULARS' }
  | { type: 'PLAY_BAIT' }
  | { type: 'END_TURN' }

export interface IGameAdapter {
  /**
   * Oyunu başlat
   * @param config - Oyun konfigürasyonu (playerName, mode, roomId vs)
   */
  initGame(config: { playerName: string; mode: 'solo' | 'online'; roomId?: string }): Promise<void>

  /**
   * Oyun aksiyonunu gerçekleştir
   * @param action - Yapılacak aksiyon
   */
  executeAction(action: GameAction): Promise<void>

  /**
   * Oyun state'ine abone ol
   * @param callback - State değiştiğinde çağrılacak fonksiyon
   * @returns Unsubscribe fonksiyonu
   */
  subscribe(callback: (state: GameState) => void): () => void

  /**
   * Oyunu temizle
   */
  cleanup(): void
}
