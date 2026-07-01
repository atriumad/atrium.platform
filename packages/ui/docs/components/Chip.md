# Chip

The Atrium service pill (SEO · Marketing · Photography). Outlined by default; filled when selected.

## Import

```tsx
import { Chip } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'outline' \| 'outline-light' \| 'outline-soft' \| 'mint' \| 'mint-soft' \| 'teal' \| 'ink' \| 'amber'` | `'outline'` | Color treatment |
| `selected` | `boolean` | `false` | Forces teal filled state |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size |
| `onClick` | `(e) => void` | — | Makes chip interactive |

## Usage

```tsx
<Chip>SEO</Chip>
<Chip variant="outline-light">Marketing</Chip>
<Chip selected>Photography</Chip>
<Chip onClick={() => setActive('seo')} selected={active === 'seo'}>SEO</Chip>
```
