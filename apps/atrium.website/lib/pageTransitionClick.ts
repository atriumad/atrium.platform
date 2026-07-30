import type { MouseEvent } from 'react'

export type ClickIntent = { intercept: boolean; x: number; y: number }

export function resolveClickIntent(
  event: MouseEvent<HTMLElement>,
  href: string,
  pathname: string,
): ClickIntent {
  const isModifiedClick =
    event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
  const isExternal = !href.startsWith('/')
  const isHashOnly = href.startsWith('#')
  const [beforeHash = ''] = href.split('#')
  const [beforeQuery = ''] = beforeHash.split('?')
  const targetPath = beforeQuery || pathname
  const isSamePage = targetPath === pathname

  if (isModifiedClick || isExternal || isHashOnly || isSamePage) {
    return { intercept: false, x: 0, y: 0 }
  }

  const isKeyboardActivation = event.detail === 0
  if (isKeyboardActivation) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { intercept: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  return { intercept: true, x: event.clientX, y: event.clientY }
}
