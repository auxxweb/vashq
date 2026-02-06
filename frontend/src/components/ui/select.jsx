import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ children, value, onValueChange, ...props }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value ?? '')

  React.useEffect(() => {
    setSelectedValue(value ?? '')
  }, [value])

  const handleSelect = (val) => {
    setSelectedValue(val)
    onValueChange?.(val)
    setOpen(false)
  }

  const childrenArray = React.Children.toArray(children)
  const trigger = childrenArray.find(child => child.type === SelectTrigger)
  const content = childrenArray.find(child => child.type === SelectContent)

  // Resolve selected option label so the trigger shows it (persists after selection/save)
  const contentItems = React.Children.toArray(content?.props?.children ?? [])
  const selectedItem = contentItems.find(c => c.type === SelectItem && (String(c.props.value) === String(selectedValue) || String(c.props.value) === String(value)))
  const selectedLabel = selectedItem?.props?.children
  const placeholder = trigger?.props?.children?.props?.placeholder
  const hasValue = selectedValue !== '' && selectedValue != null
  const displayContent = hasValue
    ? (selectedLabel != null
        ? (React.isValidElement(trigger?.props?.children) && trigger.props.children.type === SelectValue
            ? React.cloneElement(trigger.props.children, { children: selectedLabel })
            : selectedLabel)
        : String(selectedValue))
    : trigger?.props?.children

  return (
    <div className="relative" ref={ref} {...props}>
      {React.cloneElement(trigger, { 
        onClick: () => setOpen(!open),
        children: displayContent ?? placeholder
      })}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 w-full mt-1">
            {React.cloneElement(content, {
              onSelect: handleSelect,
              selectedValue
            })}
          </div>
        </>
      )}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, onSelect, selectedValue, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-soft-md",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {childrenArray.map((child, index) => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              key: index,
              selected: child.props.value === selectedValue,
              onClick: () => onSelect?.(child.props.value)
            })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, selected, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-xl px-2 py-1.5 text-sm outline-none hover:bg-muted/80 focus:bg-muted/80",
      selected && "bg-primary/10 text-primary",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder, children }) => {
  return <span>{children || placeholder}</span>
}
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
