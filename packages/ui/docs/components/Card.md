# Card

Color-led or aurora-gradient surface. Flat tones get elevation from the field color; aurora variants are the warmer bento gradient cards.

## Import

```tsx
import { Card } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tone` | `'light' \| 'cloud' \| 'mint' \| 'amber' \| 'teal' \| 'aurora' \| 'aurora-warm' \| 'aurora-cool' \| 'aurora-deep'` | `'light'` | Surface color |
| `padding` | `string` | `'28px'` | Inner padding |
| `radius` | `string` | `'var(--radius-md)'` | Corner radius |
| `bordered` | `boolean` | `false` | Hairline border (light tone only) |
| `hover` | `boolean` | `false` | Lift + float shadow on hover |
| `elevation` | `'none' \| 'soft' \| 'float'` | `'none'` | Resting shadow |

## Usage

```tsx
<Card>Simple white card</Card>
<Card tone="teal" radius="var(--radius-bento)" elevation="soft">Dark bento tile</Card>
<Card tone="aurora" hover elevation="soft">Aurora bento tile</Card>
<Card tone="mint" bordered>Mint field</Card>
```
