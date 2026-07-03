# Input

Clean text field with optional label and hint. Hairline border deepens to teal on focus; amber focus ring and error state.

## Import

```tsx
import { Input } from '@atrium/ui'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label above the field |
| `hint` | `string` | — | Helper text below |
| `invalid` | `boolean` | `false` | Error state (amber border + hint) |
| `inputStyle` | `CSSProperties` | — | Style for the `<input>` element itself |

Accepts all standard `<input>` HTML attributes (`type`, `placeholder`, `value`, `onChange`, etc.).

## Usage

```tsx
<Input label="Restaurant name" placeholder="e.g. The Rustic Fork" />
<Input label="Email" type="email" hint="We'll never share your email." />
<Input label="Website" invalid hint="Please enter a valid URL." />
```
