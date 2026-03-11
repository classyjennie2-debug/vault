import * as React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determine which component to render when a Radix `Slot` may be used.
 *
 * `asChild` is a common prop in many of our UI primitives, allowing the
 * caller to forward all props to the first child element. Under the hood we
 * render Radix's `Slot` component. Unfortunately, if the provided child is a
 * React Fragment the slot will attempt to spread props onto it which triggers
 * React warnings (`Invalid prop "xyz" supplied to React.Fragment`).
 *
 * This helper abstracts the fallback logic: if the caller requested `asChild`
 * but the child is a fragment (or an array of fragments) we log a warning and
 * render the normal element type instead (ignoring `asChild`). In practice
 * developers should avoid using `asChild` with fragments, but the helper
 * prevents the warning from ever bubbling up in production.
 */
export function resolveSlot(
  asChild: boolean | undefined,
  children: React.ReactNode,
  defaultTag: React.ElementType,
  SlotComponent: React.ElementType,
): React.ElementType {
  if (!asChild) return defaultTag

  const child = React.Children.only(children as React.ReactNode)
  if (
    React.isValidElement(child) &&
    child.type === React.Fragment
  ) {
    console.warn(
      "UI helper: received Fragment as child while `asChild` is true. `data-slot` and other props will not be forwarded to fragments. " +
        "Falling back to default element."
    )
    return defaultTag
  }

  return SlotComponent
}
