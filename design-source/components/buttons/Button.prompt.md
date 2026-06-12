Primary tap target — navy filled action; use ghost for secondary, teal for scan/positive flows.

```jsx
<Button variant="primary" icon={<ScanIcon/>} onClick={...}>New scan</Button>
<Button variant="ghost" size="sm">Report</Button>
<Button variant="teal" block>Begin capture</Button>
```

Variants: `primary` (navy, default), `ghost` (white + hairline border), `teal` (verified/scan). Sizes: `md`, `sm`. `block` for full width. Pass `icon` for an 18px leading glyph.
