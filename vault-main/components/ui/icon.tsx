/* eslint-disable no-undef */
import * as React from 'react'
import * as HeroIcons from '@heroicons/react/24/outline'
import * as HeroIconsSolid from '@heroicons/react/24/solid'

export type IconName = keyof typeof HeroIcons | keyof typeof HeroIconsSolid

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  solid?: boolean
  className?: string
}

// suppress eslint "no-undef" warnings for the DOM element type
// (the global type comes from lib.dom but ESLint sometimes misses it)
/* eslint-disable no-undef */

/**
 * A thin wrapper around Heroicons that picks the correct icon by name.
 * Use `solid` to switch to the filled version. The component adds
 * `aria-hidden` by default and forwards any className for sizing/color.
 */
export function Icon({ name, solid = false, className = '', ...props }: IconProps) {
  const icons = solid ? HeroIconsSolid : HeroIcons
  const Comp = icons[name as keyof typeof icons] as
    | React.ComponentType<React.SVGProps<SVGSVGElement>>
    | undefined

  if (!Comp) {
    console.warn(`Icon "${name}" not found; check your spelling or imports.`)
    return null
  }

  return <Comp className={className} aria-hidden="true" {...props} />
}
