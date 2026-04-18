import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity page-fade"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center pointer-events-none">
        
        {/* Modal Container */}
        <div 
          className={cn(
            "pointer-events-auto page-fade bg-background-secondary border border-border-strong w-full md:max-w-[480px] max-h-[90vh] flex flex-col rounded-t-2xl md:rounded-2xl pb-safe",
            className
          )}
        >
          {/* Mobile Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-background-tertiary rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            {title && (
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
            )}
            <button 
              onClick={onClose}
              className="p-1 text-text-tertiary hover:text-text-primary transition-colors rounded-full hover:bg-background-tertiary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
