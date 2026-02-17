import React from 'react'
import { GiSunrise, GiCrescentBlade, GiBleedingHeart, GiScrollUnfurled } from 'react-icons/gi'

export default function getIconComponent(iconKey) {
  if (!iconKey && iconKey !== 0) return null

  // If it's already a React element, return it
  if (React.isValidElement(iconKey)) return iconKey

  // Known string keys -> icon components
  const iconMap = {
    sunrise: <GiSunrise />,
    crescent: <GiCrescentBlade />,
    purple: <GiBleedingHeart />,
    scroll: <GiScrollUnfurled />,
  }

  if (typeof iconKey === 'string') {
    // exact key
    if (iconMap[iconKey]) return iconMap[iconKey]

    // single-character or emoji fallback
    if (iconKey.length <= 2) return iconKey

    // unknown string: render as text
    return iconKey
  }

  // Fallback: return as-is
  return iconKey
}
