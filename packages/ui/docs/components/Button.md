# Button

Stadium-pill action. Flat color fields, press scales to 0.97, hover deepens the field.

## Import

```tsx
import { Button } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'mint' \| 'amber' \| 'outline' \| 'ghost' \| 'ghostLight'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Padding and font size |
| `href` | `string` | — | Renders as `<a>` when provided |
| `iconLeft` | `ReactNode` | — | Icon before label |
| `iconRight` | `ReactNode` | — | Icon after label |
| `fullWidth` | `boolean` | `false` | Stretch to container |
| `disabled` | `boolean` | `false` | Muted + non-interactive |

## Usage

```tsx
<Button variant="primary">Get started</Button>
<Button variant="mint" size="lg">Learn more</Button>
<Button variant="outline" href="/services">See services</Button>
<Button variant="amber" iconRight={<ArrowRight size={16} />}>Book a call</Button>
```

## On dark backgrounds

Use `variant="ghostLight"` — transparent with cloud border, lightens on hover.
