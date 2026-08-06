'use client'

import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../lib/cn'

type Size = 'sm' | 'md'

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[0.9rem]',
  md: 'px-5 py-3.5 text-[1rem]',
}

export function Input({
  label,
  hint,
  error,
  size = 'md',
  id,
  className,
  ...rest
}: {
  label: string
  hint?: string
  error?: string
  size?: Size
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>) {
  const generated = useId()
  const inputId = id ?? generated
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="font-sans text-[0.82rem] font-medium text-body" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full rounded-full bg-card font-sans text-ink transition duration-200 ease-atrium',
          'border placeholder:text-muted',
          'focus:outline-2 focus:outline-offset-2 focus:outline-green-fill',
          error ? 'border-error' : 'border-line',
          sizes[size],
        )}
        id={inputId}
        {...rest}
      />
      {error ? (
        <span className="font-sans text-[0.8rem] text-error" id={`${inputId}-error`} role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="font-sans text-[0.8rem] text-muted" id={`${inputId}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
