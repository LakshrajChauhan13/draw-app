import React, { ReactNode } from 'react'
import { ShapeType } from './Canvas';
import { cn } from '@/utils/cn';

const buttonStyles: string = "text-xs bg-neutral-500/50 text-neutral-400 px-2 py-1.5 rounded cursor-pointer  border-1 border-neutral-500/50  active:bg-neutral-500 active hover:text-neutral-200 hover:border-white active:scale-95 transition-all duration-75 ";
const buttonActiveState = 'border-white text-neutral-200 bg-neutral-500';

const ToolButton = ({children, handleToolChange, currentTool, tool}: {
    children: ReactNode,
    handleToolChange: (tool: ShapeType) => void,
    currentTool: ShapeType,
    tool: ShapeType
}) => {
  return (
    <button onClick={() => handleToolChange(tool)} className={cn(` ${buttonStyles} ${currentTool === tool && buttonActiveState } `)}>
        {children}
    </button>
  )
}

export default ToolButton;