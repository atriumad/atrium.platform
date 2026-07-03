Stadium service pill — Atrium's signature outlined chip, used for service tags and filter toggles.

```jsx
<Chip>Graphic Design</Chip>
<Chip variant="outline-light">Photography</Chip>   {/* on deep-teal bg */}
<Chip onClick={…} selected={active}>Marketing</Chip> {/* toggle */}
```

Variants: `outline` (teal stroke on light), `outline-light` (mint stroke on dark), `mint`, `teal`, `amber` (filled). Pass `onClick` to make it a toggle; `selected` fills it teal. Sizes `sm | md | lg`.
