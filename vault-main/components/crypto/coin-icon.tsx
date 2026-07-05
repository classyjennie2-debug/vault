"use client"

import React from "react"
import type { CoinType } from "@/lib/types"

const coinSvgs: Record<CoinType, { viewBox: string; path: React.ReactNode }> = {
  USDT: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path
          d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
          fill="#fff"
        />
      </>
    ),
  },
  BTC: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          d="M22.818 14.03c.33-2.2-1.35-3.385-3.646-4.174l.745-2.988-1.82-.453-.726 2.91c-.478-.12-.97-.232-1.458-.344l.73-2.93-1.818-.453-.745 2.987a53 53 0 0 1-1.163-.274l.002-.01-2.51-.625-.483 1.943s1.35.31 1.322.328c.736.184.869.67.847 1.056l-.848 3.4c.05.013.116.032.188.06l-.19-.048-1.19 4.764c-.09.224-.318.56-.833.432.018.026-1.323-.33-1.323-.33l-.903 2.083 2.37.59c.44.11.872.226 1.298.334l-.752 3.02 1.817.453.745-2.99c.497.135.978.26 1.45.378l-.743 2.98 1.82.452.752-3.014c3.1.587 5.43.35 6.412-2.452.79-2.254-.04-3.556-1.669-4.404 1.187-.274 2.082-1.054 2.32-2.665m-4.15 5.823c-.562 2.253-4.363 1.036-5.596.73l.998-4.003c1.233.308 5.184.917 4.598 3.273m.562-5.856c-.512 2.05-3.677.97-4.703.724l.906-3.63c1.026.256 4.33.733 3.797 2.906"
          fill="#fff"
        />
      </>
    ),
  },
  ETH: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <g fill="#fff">
          <path d="M16.498 4v8.87l7.497 3.35z" fillOpacity=".602" />
          <path d="M16.498 4L9 16.22l7.498-3.35z" />
          <path d="M16.498 21.968v6.027L24 17.616z" fillOpacity=".602" />
          <path d="M16.498 27.995v-6.028L9 17.616z" />
          <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fillOpacity=".2" />
          <path d="M9 16.22l7.498 4.353v-7.701z" fillOpacity=".602" />
        </g>
      </>
    ),
  },
  BNB: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
        <path
          d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"
          fill="#fff"
        />
      </>
    ),
  },
  TRX: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#FF0013" />
        <path
          d="M21.932 9.913L7.5 7.257l7.2 19.32 9.677-12.382-2.445-4.282zm-.636 1.108l1.353 2.371-5.698 1.706 4.345-4.077zM15.61 15.879l-4.263-3.746 8.427-.865-4.164 4.61zm-.636.96l-4.02 5.946-2.475-10.848 6.495 4.903zm.636.514l5.25-1.57-6.414 8.21 1.164-6.64z"
          fill="#fff"
        />
      </>
    ),
  },
  SOL: {
    viewBox: "0 0 32 32",
    path: (
      <>
        <circle cx="16" cy="16" r="16" fill="#9945FF" />
        <path
          d="M10.16 20.672a.455.455 0 01.322-.134h13.356a.228.228 0 01.161.389l-2.795 2.795a.455.455 0 01-.322.134H7.526a.228.228 0 01-.161-.389l2.795-2.795z"
          fill="url(#sol_a)"
        />
        <path
          d="M10.16 8.278a.467.467 0 01.322-.134h13.356a.228.228 0 01.161.389l-2.795 2.795a.455.455 0 01-.322.134H7.526a.228.228 0 01-.161-.389l2.795-2.795z"
          fill="url(#sol_b)"
        />
        <path
          d="M21.204 14.434a.455.455 0 00-.322-.134H7.526a.228.228 0 00-.161.389l2.795 2.795a.455.455 0 00.322.134h13.356a.228.228 0 00.161-.389l-2.795-2.795z"
          fill="url(#sol_c)"
        />
        <defs>
          <linearGradient id="sol_a" x1="22.63" y1="5.96" x2="11.15" y2="26.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol_b" x1="17.84" y1="3.42" x2="6.36" y2="23.96" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol_c" x1="20.23" y1="4.69" x2="8.75" y2="25.23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
      </>
    ),
  },
}

interface CoinIconProps {
  coin: CoinType | null | undefined
  size?: number
  className?: string
}

export function CoinIcon({ coin, size = 24, className }: CoinIconProps) {
  if (!coin) {
    // Return a placeholder if coin is null/undefined
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-label="unknown coin"
        role="img"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      </svg>
    )
  }

  const svg = coinSvgs[coin]
  
  if (!svg) {
    // Return placeholder if coin type not found
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        aria-label={`${coin} icon (not available)`}
        role="img"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={svg.viewBox}
      className={className}
      aria-label={`${coin} icon`}
      role="img"
    >
      {svg.path}
    </svg>
  )
}
