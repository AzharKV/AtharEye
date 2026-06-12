The default surface. Everything sits on a `Card`; section groups inside use `SectionHeader` (label + optional `+ Add`).

```jsx
<Card>
  <SectionHeader label="Zone coverage" count={8} onAdd={...} />
  <ZoneBars zones={zones} />
</Card>
```

`pad={false}` when you need a flush list inside. `SectionHeader` carries the CRUD "Add" affordance pattern used throughout project detail.
