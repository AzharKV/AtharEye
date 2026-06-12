Form atoms used in every editor sheet. `Field` covers text/number/select/textarea; `Segmented` is the 2–3 option inline picker (sector, status, units).

```jsx
<Field label="Project name" value={name} onChange={setName} placeholder="e.g. Bruntsfield Flat Refurb" />
<Field label="Coverage (%)" type="number" value={cov} onChange={setCov} hint="Scanned vs the BIM plan, 0–100" />
<Segmented value={sector} options={['Residential','Commercial']} onChange={setSector} />
```

Number fields strip non-digits automatically. Focus state draws a navy ring.
