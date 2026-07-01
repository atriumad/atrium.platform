# Logo

Atrium α monogram, lowercase wordmark, or horizontal lockup. Recolored via CSS mask.

## Import

```tsx
import { Logo } from '@atrium/ui'
```

## Setup

Place `atrium-mark.svg` and `atrium-wordmark.svg` in your app's `public/logos/` directory.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'mark' \| 'wordmark' \| 'lockup'` | `'wordmark'` | Which lockup |
| `color` | `string` | `'var(--teal-800)'` | CSS color (applied via mask) |
| `height` | `number` | `32` | Height in px |
| `assetBase` | `string` | `'/logos'` | Path to logo SVG files |
| `gap` | `number` | `14` | Gap between mark and wordmark (lockup only) |

## Usage

```tsx
<Logo />
<Logo variant="mark" height={40} />
<Logo variant="lockup" color="var(--mint-400)" height={28} />
<Logo variant="wordmark" color="var(--cloud-300)" />
```
