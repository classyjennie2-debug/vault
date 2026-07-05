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

  // determine if the direct child is a React fragment; if it is we can't use
  // the slot because it will try to spread props onto the fragment.  we also
  // warn so developers know they should avoid this pattern.
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

  // wrap the supplied SlotComponent in a higher‑order component that will strip
  // `data-slot` (and any other props that are problematic for fragments) when
  // the slot’s *rendered* child is a fragment.  This protects against cases
  // where the direct child is a custom component which itself renders a
  // fragment (e.g. Next.js <Link> sometimes does this), which would otherwise
  // reintroduce the same runtime warning.
  const WrappedSlot: React.FC<any> = (props) => {
    // look through the immediate children to see if any is a fragment
    const hasFragment = React.Children.toArray(props.children).some(
      (c) => React.isValidElement(c) && c.type === React.Fragment
    )

    if (hasFragment) {
      // drop the offending props; `data-slot` is the common culprit but we
      // remove anything starting with "data-" to be safe.
      const cleaned: Record<string, unknown> = {}
      for (const key of Object.keys(props)) {
        if (key.startsWith('data-')) continue
        cleaned[key] = props[key]
      }
      return React.createElement(SlotComponent, cleaned, props.children)
    }

    return React.createElement(SlotComponent, props)
  }

  return WrappedSlot
}
