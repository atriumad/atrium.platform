# ScriptAccent

Handwritten accent word (Nothing You Could Do) for warmth inside a headline. Usually underlined.

## Import

```tsx
import { ScriptAccent } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `underline` | `boolean` | `true` | Underline the word |
| `color` | `string` | `'inherit'` | Text color |

## Usage

```tsx
<h1>Welcome to <ScriptAccent>atrium</ScriptAccent></h1>
<h2>We're <ScriptAccent color="var(--amber-400)">humans</ScriptAccent></h2>
```
