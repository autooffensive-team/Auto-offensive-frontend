"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type ComboboxContextValue = {
  value: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  containerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext(component: string) {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error(`${component} must be used within Combobox`)
  }
  return context
}

type ComboboxProps = React.PropsWithChildren<{
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}>

function Combobox({
  children,
  value = "",
  onValueChange,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      // Keep open if click is inside the trigger container OR the portal content
      if (
        containerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  return (
    <ComboboxContext.Provider
      value={{
        value,
        onValueChange,
        disabled,
        open,
        setOpen,
        containerRef,
        contentRef,
      }}
    >
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </ComboboxContext.Provider>
  )
}

function ComboboxValue({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span className={cn(className)} data-slot="combobox-value" {...props}>
      {children}
    </span>
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { disabled, open, setOpen } = useComboboxContext("ComboboxTrigger")

  return (
    <InputGroupButton
      variant="ghost"
      size="icon-xs"
      data-slot="combobox-trigger"
      className={cn(
        "[&_svg:not([class*='size-'])]:size-4",
        "hover:bg-primary hover:text-primary-foreground",
        open && "bg-primary/10 text-primary",
        className
      )}
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-foreground" />
    </InputGroupButton>
  )
}

function ComboboxClear({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { disabled, onValueChange, setOpen } =
    useComboboxContext("ComboboxClear")

  return (
    <InputGroupButton
      variant="ghost"
      size="icon-xs"
      data-slot="combobox-clear"
      className={cn(className)}
      disabled={disabled}
      onClick={() => {
        onValueChange?.("")
        setOpen(false)
      }}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </InputGroupButton>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  openOnClick = false,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  showTrigger?: boolean
  showClear?: boolean
  openOnClick?: boolean
}) {
  const context = useComboboxContext("ComboboxInput")
  const isDisabled = disabled || context.disabled
  const handleInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    props.onClick?.(event)
    if (!event.defaultPrevented && openOnClick && !isDisabled) {
      context.setOpen((current) => !current)
    }
  }

  return (
    <InputGroup className={cn("w-auto", className)}>
      <InputGroupInput disabled={isDisabled} {...props} onClick={handleInputClick} />
      <InputGroupAddon align="inline-end">
        {showTrigger ? <ComboboxTrigger disabled={isDisabled} /> : null}
        {showClear ? <ComboboxClear disabled={isDisabled} /> : null}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

// ─── ComboboxContent — portal-based ──────────────────────────────────────────
// Renders into document.body via ReactDOM.createPortal so it escapes ANY
// clip-path or overflow:hidden ancestor in the DOM tree.
// Uses position:fixed + getBoundingClientRect to stay anchored below the
// trigger regardless of page scroll or layout nesting.
function ComboboxContent({
  className,
  children,
  anchor: _anchor,
  ...props
}: React.ComponentProps<"div"> & {
  anchor?: HTMLElement | null
}) {
  const { open, containerRef, contentRef } = useComboboxContext("ComboboxContent")
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
    width: number
  } | null>(null)

  // Recompute position whenever the dropdown opens or the window resizes/scrolls
  React.useEffect(() => {
    if (!open) return

    function reposition() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 6,   // 6px gap below the input
        left: rect.left,
        width: rect.width,
      })
    }

    reposition()
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [open, containerRef])

  if (!open || !coords) return null

  // Portal to document.body — fully escapes all clip-path ancestors
  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      data-slot="combobox-content"
      className={cn(
        // position:fixed so it's relative to viewport, not any parent
        "fixed z-9999 overflow-hidden rounded-lg shadow-md ring-1",
        // Light mode
        "bg-[#FCFCFA] text-gray-900 ring-gray-200",
        // Dark mode
        "dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700",
        className
      )}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
      }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
}

function ComboboxList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-64 scroll-py-1 overflow-y-auto overscroll-contain p-1",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  value,
  disabled,
  ...props
}: React.ComponentProps<"button"> & {
  value: string
}) {
  const { value: selectedValue, onValueChange, setOpen } =
    useComboboxContext("ComboboxItem")
  const selected = selectedValue === value

  return (
    <button
      type="button"
      data-slot="combobox-item"
      data-selected={selected || undefined}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm font-normal outline-hidden select-none transition-colors",
        // Light mode
        "hover:bg-primary/10 hover:text-gray-900",
        "data-[selected=true]:bg-primary/12 data-[selected=true]:text-gray-900 data-[selected=true]:font-bold",
        // Dark mode
        "dark:hover:bg-primary/20 dark:hover:text-gray-100",
        "dark:data-[selected=true]:bg-primary/25 dark:data-[selected=true]:text-gray-100",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return
        }
        onValueChange?.(value)
        setOpen(false)
      }}
      {...props}
    >
      {children}
      {selected ? (
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <CheckIcon className="pointer-events-none" />
        </span>
      ) : null}
    </button>
  )
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div data-slot="combobox-group" className={cn(className)} {...props} />
}

function ComboboxLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxCollection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-collection"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-empty"
      className={cn(
        "flex w-full justify-center py-2 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-chips"
      className={cn(
        "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: React.ComponentProps<"div"> & {
  showRemove?: boolean
}) {
  return (
    <div
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground",
        className
      )}
      {...props}
    >
      {children}
      {showRemove ? (
        <Button
          variant="ghost"
          size="icon"
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          type="button"
        >
          <XIcon className="pointer-events-none" />
        </Button>
      ) : null}
    </div>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 bg-transparent outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}