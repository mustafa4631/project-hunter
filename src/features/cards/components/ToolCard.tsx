import * as React from 'react'
import { motion } from 'framer-motion'
import { ToolCard as ToolCardType } from '@/types/game'
import { cn } from '@/lib/utils'

interface ToolCardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: ToolCardType
}

/**
 * Visual representation of a Tool Card.
 * Animation 5: hover scale+lift, tap shrink.
 */
export function ToolCard({ card, className, ...props }: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.06, y: -5 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={cn(
        'relative flex flex-col justify-between w-32 h-44 p-2 bg-earth-dark border-2 border-gold select-none',
        className
      )}
      {...props as any}
    >
      {/* Icon */}
      <div className="flex-1 flex items-center justify-center text-5xl">
        {card.icon}
      </div>

      {/* Details */}
      <div className="flex flex-col items-center border-t border-forest-light/30 pt-1 text-center">
        <h3 className="font-serif font-bold text-parchment text-sm leading-tight">
          {card.nameTr}
        </h3>
        <p className="text-[9px] text-parchment-dark mt-1 leading-tight font-sans px-1">
          {card.description}
        </p>
      </div>
    </motion.div>
  )
}
