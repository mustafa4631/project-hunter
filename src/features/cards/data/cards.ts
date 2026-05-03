import { PreyCard, ToolCard } from '@/types/game'

export const PREY_CARDS: PreyCard[] = [
  { id: 'p_rabbit', type: 'prey', name: 'Rabbit', nameTr: 'Tavşan', points: 1, diceThreshold: 2, icon: '🐇', rarity: 'common' },
  { id: 'p_fox', type: 'prey', name: 'Fox', nameTr: 'Tilki', points: 2, diceThreshold: 3, icon: '🦊', rarity: 'common' },
  { id: 'p_deer', type: 'prey', name: 'Deer', nameTr: 'Geyik', points: 3, diceThreshold: 4, icon: '🦌', rarity: 'common' },
  { id: 'p_boar', type: 'prey', name: 'Wild Boar', nameTr: 'Yaban Domuzu', points: 4, diceThreshold: 4, icon: '🐗', rarity: 'rare' },
  { id: 'p_bear', type: 'prey', name: 'Mountain Bear', nameTr: 'Dağ Ayısı', points: 5, diceThreshold: 5, icon: '🐻', rarity: 'rare' },
  { id: 'p_wolf', type: 'prey', name: 'Wolf', nameTr: 'Kurt', points: 6, diceThreshold: 5, icon: '🐺', rarity: 'rare' },
  { id: 'p_eagle', type: 'prey', name: 'Eagle', nameTr: 'Kartal', points: 7, diceThreshold: 6, icon: '🦅', rarity: 'legendary' },
  { id: 'p_leopard', type: 'prey', name: 'Snow Leopard', nameTr: 'Kar Leoparı', points: 8, diceThreshold: 6, icon: '🐆', rarity: 'legendary' },
]

export const TOOL_CARDS: ToolCard[] = [
  { id: 't_trap_1', type: 'tool', toolType: 'trap', name: 'Trap', nameTr: 'Tuzak', description: "Skip target player's next turn", icon: '🪤' },
  { id: 't_trap_2', type: 'tool', toolType: 'trap', name: 'Trap', nameTr: 'Tuzak', description: "Skip target player's next turn", icon: '🪤' },
  { id: 't_trap_3', type: 'tool', toolType: 'trap', name: 'Trap', nameTr: 'Tuzak', description: "Skip target player's next turn", icon: '🪤' },
  { id: 't_binoculars_1', type: 'tool', toolType: 'binoculars', name: 'Binoculars', nameTr: 'Dürbün', description: 'Preview wilderness, may pass', icon: '🔭' },
  { id: 't_binoculars_2', type: 'tool', toolType: 'binoculars', name: 'Binoculars', nameTr: 'Dürbün', description: 'Preview wilderness, may pass', icon: '🔭' },
  { id: 't_binoculars_3', type: 'tool', toolType: 'binoculars', name: 'Binoculars', nameTr: 'Dürbün', description: 'Preview wilderness, may pass', icon: '🔭' },
  { id: 't_bait_1', type: 'tool', toolType: 'bait', name: 'Bait', nameTr: 'Yem', description: 'Add +1 to your dice roll this turn', icon: '🎯' },
  { id: 't_bait_2', type: 'tool', toolType: 'bait', name: 'Bait', nameTr: 'Yem', description: 'Add +1 to your dice roll this turn', icon: '🎯' },
  { id: 't_bait_3', type: 'tool', toolType: 'bait', name: 'Bait', nameTr: 'Yem', description: 'Add +1 to your dice roll this turn', icon: '🎯' },
]
