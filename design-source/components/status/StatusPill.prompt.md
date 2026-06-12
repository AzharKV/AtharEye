Status indicators for the portfolio. Three primitives share this directory.

```jsx
<StageChip stage="Mid" />                 {/* Mid-build, blue */}
<StageChip stage="Complete" label="Finishing" />
<StatusPill status="Needs review" />      {/* amber dot + label */}
<SeverityDot severity="Critical" label="Lintel needs renewal" />
```

`StageChip` colour is keyed off `stage` (Early=navy, Mid=blue, Complete=teal); `label` overrides only the text. `StatusPill` maps health → colour. `SeverityDot` is red/amber/grey.
