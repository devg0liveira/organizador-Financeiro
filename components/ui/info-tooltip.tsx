"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoTooltipProps {
  title?: string
  content: React.ReactNode
  className?: string
  iconClassName?: string
}

export function InfoTooltip({ title, content, className, iconClassName }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
    placement: "top" | "bottom"
    arrowLeft: number
    width: number
  } | null>(null)

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()

    const isMobile = window.innerWidth < 640
    const tooltipWidth = isMobile ? Math.min(290, window.innerWidth - 32) : 280
    const tooltipHeight = 130
    const margin = 8

    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom
    const placement: "top" | "bottom" = spaceAbove >= tooltipHeight + margin || spaceAbove > spaceBelow ? "top" : "bottom"

    let left = rect.left + rect.width / 2 - tooltipWidth / 2
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12))

    const top = placement === "top" ? rect.top - margin : rect.bottom + margin
    const triggerCenterX = rect.left + rect.width / 2
    const arrowLeft = Math.max(16, Math.min(triggerCenterX - left, tooltipWidth - 16))

    setCoords({ top, left, placement, arrowLeft, width: tooltipWidth })
  }, [])

  const handleOpen = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    updatePosition()
    setIsOpen(true)
  }, [updatePosition])

  const handleClose = React.useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }, [])

  const handleToggle = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isOpen) {
        setIsOpen(false)
      } else {
        updatePosition()
        setIsOpen(true)
      }
    },
    [isOpen, updatePosition]
  )

  React.useEffect(() => {
    if (!isOpen) return
    const handleScrollOrResize = () => {
      updatePosition()
    }
    window.addEventListener("scroll", handleScrollOrResize, { passive: true, capture: true })
    window.addEventListener("resize", handleScrollOrResize, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true)
      window.removeEventListener("resize", handleScrollOrResize)
    }
  }, [isOpen, updatePosition])

  React.useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen])

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const tooltipElement =
    isOpen && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
            style={{
              position: "fixed",
              left: `${coords.left}px`,
              top: coords.placement === "bottom" ? `${coords.top}px` : undefined,
              bottom: coords.placement === "top" ? `${window.innerHeight - coords.top}px` : undefined,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 pointer-events-auto"
          >
            {title && (
              <div className="mb-1.5 border-b border-border/60 pb-1.5">
                <h4 className="text-xs font-semibold text-foreground tracking-tight">{title}</h4>
              </div>
            )}
            <div className="text-xs leading-relaxed text-muted-foreground text-pretty">
              {content}
            </div>
            {/* Seta indicadora com alinhamento pixel-perfect ao centro do botão */}
            <div
              style={{ left: `${coords.arrowLeft}px` }}
              className={cn(
                "absolute size-2.5 rotate-45 border border-border bg-popover pointer-events-none",
                coords.placement === "top"
                  ? "-bottom-[6px] -translate-x-1/2 border-t-0 border-l-0"
                  : "-top-[6px] -translate-x-1/2 border-b-0 border-r-0"
              )}
            />
          </div>,
          document.body
        )
      : null

  return (
    <div
      className={cn("inline-flex items-center align-middle", className)}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/75 transition-all hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95",
          iconClassName
        )}
        aria-label={title || "Informações detalhadas"}
      >
        <HelpCircle className="size-3.5 shrink-0" />
      </button>

      {tooltipElement}
    </div>
  )
}
