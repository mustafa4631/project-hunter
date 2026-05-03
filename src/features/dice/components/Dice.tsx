'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DiceProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  onRoll?: () => void
}

/**
 * Visual representation of the Game Dice
 */
export function Dice({ value = 1, onRoll, className, ...props }: DiceProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={onRoll}
        className={cn(
          'flex items-center justify-center w-20 h-20 bg-parchment border-4 border-forest cursor-pointer hover:bg-parchment-dark transition-colors select-none',
          className
        )}
        {...props}
      >
        <span className="font-serif text-4xl font-bold text-earth-dark">
          {value}
        </span>
      </div>
      <span className="text-parchment-dark font-sans text-sm font-medium tracking-wide uppercase">
        Zar At
      </span>
    </div>
  )
}
