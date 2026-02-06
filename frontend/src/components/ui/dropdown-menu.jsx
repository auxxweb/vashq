import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {}
})

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-dropdown-menu]')) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown-menu>{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ asChild, children, ...props }, ref) => {
  const { setOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = () => {
    setOpen(prev => !prev)
  }
  
  if (asChild) {
    return React.cloneElement(children, { ...props, ref, onClick: handleClick })
  }
  return <div ref={ref} {...props} onClick={handleClick}>{children}</div>
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ className, align = "start", children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  
  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-soft-md",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            onClick: (e) => {
              child.props.onClick?.(e)
              child.props.onSelect?.(e)
              if (!e.defaultPrevented) {
                setOpen(false)
              }
            }
          })
        }
        return child
      })}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, onSelect, onClick, ...props }, ref) => {
  const handleClick = (e) => {
    onClick?.(e)
    onSelect?.(e)
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted/80 focus:bg-muted/80 min-h-[44px] sm:min-h-0",
        className
      )}
      onClick={handleClick}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
