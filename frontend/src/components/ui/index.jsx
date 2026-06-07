import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import * as LabelPrimitive from '@radix-ui/react-label'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'

/* Button */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default:     'bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
        outline:     'border border-[#e8e8e8] bg-white text-[#3a3a3a] hover:bg-[#f3f3f3]',
        ghost:       'text-[#525252] hover:bg-[#f3f3f3] hover:text-[#262626]',
        destructive: 'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
        secondary:   'bg-[#f3f3f3] text-[#3a3a3a] hover:bg-[#e8e8e8]',
        link:        'text-[#2563eb] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-7 px-3 text-xs',
        lg:      'h-11 px-6 text-base',
        icon:    'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)
export const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

/* Input */
export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={cn(
      'flex h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] disabled:opacity-40 transition-colors',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

/* Label */
export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium text-[#3a3a3a]', className)}
    {...props}
  />
))
Label.displayName = 'Label'

/* Checkbox */
export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'h-4 w-4 shrink-0 rounded border border-[#d1d1d1] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:opacity-40 data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] transition-colors',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

/* Avatar */
export const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)} {...props} />
))
Avatar.displayName = 'Avatar'

export const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
))
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-[#f3f3f3] text-[#525252] text-xs font-semibold', className)}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'
