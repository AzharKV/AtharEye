The coverage data-viz set — OptiSync's signature "scan vs plan" visuals. All numerics render tabular/lining via the `.mono` class.

```jsx
<Donut value={62} sub="62% verified · 38% left" />
<ZoneBars zones={[{name:'Kitchen', coverage:70}, {name:'Bathroom', coverage:100}]} />
<Sparkline points={[0,18,34,51,62]} />
```

Convention: navy = in-progress, teal = 100% complete. Donut animates on `value` change (used by the timeline scrubber). Keep zone names short to avoid wrapping.
