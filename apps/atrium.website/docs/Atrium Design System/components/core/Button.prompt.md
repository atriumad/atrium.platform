Stadium-pill button for Atrium actions — use for any primary/secondary CTA; flat color fields, no shadow.

```jsx
<Button variant="primary">Start a project</Button>
<Button variant="mint" size="lg">See our work</Button>
<Button variant="outline" iconRight={<span>→</span>}>Learn more</Button>
```

Variants: `primary` (deep teal field, mint label), `mint` (mint field, teal label), `amber` (campaign marigold), `outline` (teal stroke → inverts to mint-on-teal on hover), `ghost`. Sizes `sm | md | lg`. Press scales to 0.97. Render as a link with `as="a" href="…"`.
