'use client'

import { type CSSProperties, type InputHTMLAttributes, useId, useState } from 'react'

type InputProps = {
  label?: string
  hint?: string
  invalid?: boolean
  style?: CSSProperties
  inputStyle?: CSSProperties
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'style'>

export function Input({ label, hint, id, type = 'text', invalid = false, style, inputStyle, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId

  const borderColor = invalid ? 'var(--amber-600)' : focused ? 'var(--teal-800)' : 'var(--cloud-400)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--text-strong)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          color: 'var(--text-body)',
          background: 'var(--cloud-100)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${borderColor}`,
          outline: focused ? '2px solid var(--focus-ring)' : '2px solid transparent',
          outlineOffset: '2px',
          transition: 'border-color var(--dur-base) var(--ease-out), outline-color var(--dur-base) var(--ease-out)',
          ...inputStyle,
        }}
        {...rest}
      />
      {hint && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: invalid ? 'var(--amber-600)' : 'var(--text-muted)',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
