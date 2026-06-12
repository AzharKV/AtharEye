/* OptiSync — demo data. Single source the prototype reads.
   Sourced verbatim from OPTISYNC_DATA_SPEC.md + OPTISYNC_DEEP_REPORTS.md. */
(function () {
  var A = 'uploads/OptiSync_Design_Assets/';

  // Global stage capture pools (scrubber picks by coverage band, per D4 §F).
  var POOL = {
    early: [
      { p: 'p016', cap: 'Kitchen — back to bare brick', src: A + 'stirling-early/stirling_early_kitchen_barebrick_p016.jpeg' },
      { p: 'p018', cap: 'Bedroom — stripped out', src: A + 'stirling-early/stirling_early_room_stripped_p018.jpeg' },
      { p: 'p027', cap: 'Ceiling joists exposed', src: A + 'stirling-early/stirling_early_ceiling_joists_p027.jpeg' },
      { p: 'p040', cap: 'Bare-plaster wall', src: A + 'stirling-early/stirling_early_bareplaster_p040.jpeg' },
      { p: 'p055', cap: 'Bedroom stripped to plaster', src: A + 'stirling-early/stirling_early_bedroom_stripped_p055.jpeg' }
    ],
    mid: [
      { p: 'p015', cap: 'Kitchen — units set', src: A + 'morningside-mid/morningside_mid_kitchen_units_p015.jpeg' },
      { p: 'p043', cap: 'Kitchen units + bare plaster', src: A + 'morningside-mid/morningside_mid_kitchen_plaster_p043.jpeg' },
      { p: 'p047', cap: 'Bathroom first fix', src: A + 'morningside-mid/morningside_mid_bathroom_firstfix_p047.jpeg' },
      { p: 'p035', cap: 'Plastering complete', src: A + 'morningside-mid/morningside_mid_plastering_p035.jpeg' },
      { p: 'p062', cap: 'Kitchen progress', src: A + 'morningside-mid/morningside_mid_kitchen_p062.jpeg' }
    ],
    complete: [
      { p: 'p026', cap: 'Kitchen — fitted & signed off', src: A + 'leith-complete/leith_complete_kitchen_p026.jpeg' },
      { p: 'p070', cap: 'Bathroom — sanitaryware in', src: A + 'leith-complete/leith_complete_bathroom_p070.jpeg' },
      { p: 'p066', cap: 'Bedroom — decorated', src: A + 'leith-complete/leith_complete_bedroom_p066.jpeg' },
      { p: 'p080', cap: 'Kitchen finished', src: A + 'leith-complete/leith_complete_kitchen_2_p080.jpeg' },
      { p: 'p051', cap: 'Hall — runner fitted', src: A + 'leith-complete/leith_complete_hall_runner_p051.jpeg' }
    ]
  };

  var planSketch = A + 'stirling-early/stirling_early_floorplan_sketch_p037.jpeg';
  var beforeAfter = A + 'morningside-mid/morningside_mid_before_after_split_p046.jpeg';

  var hyndlandShots = [
    { p: 'p011', cap: 'Bathroom — second fix done', src: A + 'hyndland-mid/hyndland_mid_bathroom_p011.jpeg' },
    { p: 'p048', cap: 'Bathroom', src: A + 'hyndland-mid/hyndland_mid_bathroom_2_p048.jpeg' },
    { p: 'p060', cap: 'Kitchen — units in', src: A + 'hyndland-mid/hyndland_mid_kitchen_sink_p060.jpeg' },
    { p: 'p012', cap: 'Hall — partition deviation flagged', src: A + 'hyndland-mid/hyndland_mid_hall_stair_p012.jpeg' }
  ];

  // pick(pool, n) — deterministic subset
  function pool(band) {
    if (band === 'early') return POOL.early;
    if (band === 'mid') return POOL.mid;
    return POOL.complete;
  }

  var projects = [
    {
      id: 'proj-stirling', name: 'Stirling Flat Refurbishment', short: 'Stirling',
      sector: 'Residential', type: '2-bed tenement flat — full refurbishment',
      location: "King's Park, Stirling, FK8", client: 'J. Boyle (private)', area: 68,
      stage: 'Early', coverage: 28, status: 'On track', depth: 'deep',
      start: '2026-04-13', target: '2026-08-07',
      bim: { software: 'Autodesk Revit → IFC export', file: 'Stirling_Flat_R2.ifc', lod: 200, disciplines: ['Architectural'], aligned: '2026-06-08' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'Reid Joinery — main contractor'],
      trades: [
        ['Strip-out', 'Done'], ['Structural / ceiling repair', 'Done'],
        ['First fix electrical', 'In progress'], ['First fix plumbing', 'In progress'],
        ['Plastering & skim', 'Not started'], ['Second fix joinery', 'Not started'],
        ['Kitchen fit', 'Not started'], ['Bathroom / sanitaryware', 'Not started'],
        ['Decoration', 'Not started'], ['Flooring', 'Not started'], ['Snagging', 'Not started']
      ],
      zones: [
        { name: 'Living / Kitchen', area: 24, coverage: 35, note: 'Stripped; first-fix electrical running' },
        { name: 'Bedroom 1', area: 14, coverage: 30, note: 'First-fix wiring in' },
        { name: 'Hall / Stair', area: 13, coverage: 28, note: 'Joist repair complete; bare' },
        { name: 'Bedroom 2', area: 11, coverage: 25, note: 'Stripped; ceiling repair complete' },
        { name: 'Bathroom', area: 6, coverage: 22, note: 'Stripped to brick; damp on external wall' }
      ],
      issues: [
        { id: 'ST-03', sev: 'Critical', zone: 'Living / Kitchen', title: 'Lintel above old opening needs renewal', status: 'Open', raised: '2026-05-26', appearAt: 20, clearAt: null },
        { id: 'ST-01', sev: 'Major', zone: 'Bathroom', title: 'Penetrating damp, external gable wall', status: 'Open', raised: '2026-05-02', appearAt: 10, clearAt: null },
        { id: 'ST-02', sev: 'Major', zone: 'Hall / Stair', title: 'Consumer unit undersized for new circuits', status: 'Open', raised: '2026-05-18', appearAt: 18, clearAt: null },
        { id: 'ST-04', sev: 'Minor', zone: 'Bedroom 2', title: 'Skirting line out of level (pre-plaster)', status: 'Closed', raised: '2026-04-29', closed: '2026-05-05', appearAt: 8, clearAt: 14 }
      ],
      scans: [
        { date: '2026-04-16', coverage: 0, note: 'Pre-start baseline scan vs BIM' },
        { date: '2026-05-09', coverage: 12, note: 'Post strip-out' },
        { date: '2026-06-08', coverage: 28, note: 'First-fix progress' }
      ],
      planImage: planSketch
    },
    {
      id: 'proj-morningside', name: 'Morningside Townhouse', short: 'Morningside',
      sector: 'Residential', type: 'Victorian townhouse — full refurbishment, 3 floors',
      location: 'Morningside, Edinburgh, EH10', client: 'Caldwell Property Group', area: 142,
      stage: 'Mid', coverage: 62, status: 'On track', depth: 'deep', hero: true,
      start: '2026-02-24', target: '2026-09-18',
      bim: { software: 'Autodesk Revit → IFC export', file: 'Morningside_TH_R4.ifc', lod: 300, disciplines: ['Architectural', 'MEP'], aligned: '2026-06-09' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'Lothian Build Co — main contractor', 'Capital MEP — M&E'],
      trades: [
        ['Strip-out', 'Done'], ['Structural / ceiling repair', 'Done'],
        ['First fix electrical', 'Done'], ['First fix plumbing', 'Done'], ['Plastering & skim', 'Done'],
        ['Second fix joinery', 'In progress'], ['Second fix electrical', 'In progress'], ['Second fix plumbing', 'In progress'],
        ['Kitchen fit', 'In progress'], ['Bathroom / sanitaryware', 'In progress'], ['Decoration', 'In progress'],
        ['Flooring', 'Not started'], ['Snagging', 'Not started']
      ],
      zones: [
        { name: 'Bedroom 1', area: 18, coverage: 75, note: 'Plastered, mist-coat done' },
        { name: 'Kitchen', area: 19, coverage: 70, note: 'Units set; worktop template pending' },
        { name: 'Bedroom 2', area: 15, coverage: 68, note: 'Second-fix joinery underway' },
        { name: 'Living Room', area: 28, coverage: 65, note: 'Cornice repair complete' },
        { name: 'Bedroom 3', area: 13, coverage: 60, note: 'Plastered; awaiting decoration' },
        { name: 'Hall / Stair / Landing', area: 37, coverage: 58, note: 'Spindles being refitted' },
        { name: 'Family Bathroom', area: 7, coverage: 55, note: 'First-fix done; wet-wall going up' },
        { name: 'En-suite', area: 5, coverage: 48, note: 'Tiling started — lippage flagged' }
      ],
      issues: [
        { id: 'MO-01', sev: 'Critical', zone: 'Kitchen', title: 'Boiler flue clearance below regs to new window', status: 'Open', raised: '2026-05-21', appearAt: 51, clearAt: null },
        { id: 'MO-02', sev: 'Major', zone: 'En-suite', title: 'Wall-tile lippage exceeds 2 mm tolerance', status: 'Open', raised: '2026-06-02', appearAt: 58, clearAt: null },
        { id: 'MO-03', sev: 'Major', zone: 'Kitchen', title: 'Socket bank 140 mm off BIM position', status: 'Open', raised: '2026-06-04', appearAt: 58, clearAt: null },
        { id: 'MO-04', sev: 'Minor', zone: 'Bedroom 3', title: 'Patchy mist-coat, second coat needed', status: 'Open', raised: '2026-06-07', appearAt: 60, clearAt: null },
        { id: 'MO-05', sev: 'Minor', zone: 'Living Room', title: 'Cornice joint to make good', status: 'Closed', raised: '2026-05-19', closed: '2026-05-30', appearAt: 45, clearAt: 60 }
      ],
      scans: [
        { date: '2026-02-27', coverage: 0, note: 'Baseline vs BIM' },
        { date: '2026-03-20', coverage: 18, note: 'Strip-out complete' },
        { date: '2026-04-22', coverage: 34, note: 'First fix complete' },
        { date: '2026-05-19', coverage: 51, note: 'Plastering complete' },
        { date: '2026-06-09', coverage: 62, note: 'Second fix in progress' }
      ],
      beforeAfter: beforeAfter
    },
    {
      id: 'proj-leith', name: 'Leith Tenement Flat', short: 'Leith',
      sector: 'Residential', type: '2-bed tenement flat — full refurbishment',
      location: 'Leith, Edinburgh, EH6', client: 'Shoreline Lettings Ltd', area: 71,
      stage: 'Complete', coverage: 100, status: 'Complete', depth: 'deep',
      start: '2025-11-10', target: '2026-05-30',
      bim: { software: 'Autodesk Revit → IFC + as-built PDF', file: 'Leith_Flat_AsBuilt_R6.ifc', lod: 350, disciplines: ['Architectural', 'MEP'], aligned: '2026-05-28' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'Forth Refurb Ltd — main contractor'],
      trades: [
        ['Strip-out', 'Done'], ['Structural / ceiling repair', 'Done'], ['First fix electrical', 'Done'],
        ['First fix plumbing', 'Done'], ['Plastering & skim', 'Done'], ['Second fix joinery', 'Done'],
        ['Second fix electrical', 'Done'], ['Second fix plumbing', 'Done'], ['Kitchen fit', 'Done'],
        ['Bathroom / sanitaryware', 'Done'], ['Decoration', 'Done'], ['Flooring', 'Done'],
        ['Snagging', 'Done'], ['Handover', 'Done']
      ],
      zones: [
        { name: 'Kitchen', area: 15, coverage: 100, note: 'Fitted, tested, signed off' },
        { name: 'Bathroom', area: 6, coverage: 100, note: 'Sanitaryware in, sealed' },
        { name: 'Bedroom 1', area: 14, coverage: 100, note: 'Decorated, carpeted' },
        { name: 'Bedroom 2', area: 12, coverage: 100, note: 'Decorated, carpeted' },
        { name: 'Living Room', area: 16, coverage: 100, note: 'Decorated, flooring laid' },
        { name: 'Hall / Stair', area: 8, coverage: 100, note: 'Decorated, runner fitted' }
      ],
      issues: [
        { id: 'LE-01', sev: 'Major', zone: 'Bathroom', title: 'Silicone bead to bath — re-run', status: 'Closed', raised: '2026-05-12', closed: '2026-05-22', appearAt: 90, clearAt: 100 },
        { id: 'LE-02', sev: 'Minor', zone: 'Bedroom 1', title: 'Door catching frame — ease & adjust', status: 'Closed', raised: '2026-05-14', closed: '2026-05-20', appearAt: 90, clearAt: 100 },
        { id: 'LE-03', sev: 'Minor', zone: 'Kitchen', title: 'Cabinet door alignment', status: 'Closed', raised: '2026-05-15', closed: '2026-05-21', appearAt: 92, clearAt: 100 },
        { id: 'LE-04', sev: 'Minor', zone: 'Living Room', title: 'Architrave paint touch-up', status: 'Closed', raised: '2026-05-16', closed: '2026-05-23', appearAt: 92, clearAt: 100 }
      ],
      scans: [
        { date: '2025-11-13', coverage: 0, note: 'Baseline vs BIM' },
        { date: '2025-12-18', coverage: 22, note: 'Strip-out + first fix' },
        { date: '2026-02-10', coverage: 48, note: 'Plastering complete' },
        { date: '2026-03-24', coverage: 71, note: 'Second fix progressing' },
        { date: '2026-05-02', coverage: 94, note: 'Decoration + flooring' },
        { date: '2026-05-28', coverage: 100, note: 'As-built, snags cleared, handover' }
      ]
    },
    {
      id: 'proj-hyndland', name: 'Hyndland Flat', short: 'Hyndland',
      sector: 'Residential', type: '2-bed flat — refurbishment',
      location: 'Hyndland, Glasgow, G12', client: 'R. Mackenzie (private)', area: 74,
      stage: 'Mid', coverage: 74, status: 'Needs review', depth: 'light',
      start: '2026-03-09', target: '2026-07-25',
      reviewNote: 'Latest scan flags a partition wall built 220 mm off the BIM position in the kitchen / hall line.',
      bim: { software: 'Autodesk Revit → IFC export', file: 'Hyndland_Flat_R3.ifc', lod: 300, disciplines: ['Architectural'], aligned: '2026-06-06' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'Clyde Interiors — contractor'],
      trades: [
        ['Strip-out', 'Done'], ['First fix electrical', 'Done'], ['First fix plumbing', 'Done'],
        ['Plastering & skim', 'Done'], ['Second fix joinery', 'Done'], ['Kitchen fit', 'Done'],
        ['Bathroom / sanitaryware', 'Done'], ['Decoration', 'In progress'], ['Flooring', 'In progress'],
        ['Snagging', 'Not started']
      ],
      zones: [
        { name: 'Bathroom', area: 6, coverage: 80, note: 'Second fix done' },
        { name: 'Kitchen', area: 16, coverage: 78, note: 'Units in; partition deviation flagged' },
        { name: 'Living Room', area: 17, coverage: 76, note: 'Flooring started' },
        { name: 'Bedroom 1', area: 15, coverage: 72, note: 'Decoration underway' },
        { name: 'Bedroom 2', area: 12, coverage: 70, note: 'Decoration underway' },
        { name: 'Hall', area: 8, coverage: 66, note: 'Affected by partition deviation' }
      ],
      issues: [
        { id: 'HY-01', sev: 'Critical', zone: 'Hall', title: 'Partition 220 mm off plan — under review', status: 'Open', raised: '2026-06-05', appearAt: 60, clearAt: null, deviation: true },
        { id: 'HY-02', sev: 'Major', zone: 'Kitchen', title: 'Extract duct route clashes with BIM', status: 'Open', raised: '2026-06-05', appearAt: 60, clearAt: null },
        { id: 'HY-03', sev: 'Minor', zone: 'Living Room', title: 'Skirting return mitre to make good', status: 'Open', raised: '2026-06-01', appearAt: 55, clearAt: null }
      ],
      scans: [
        { date: '2026-03-12', coverage: 0, note: 'Baseline vs BIM' },
        { date: '2026-04-18', coverage: 29, note: 'Strip-out + first fix' },
        { date: '2026-05-20', coverage: 55, note: 'Plastering + second fix' },
        { date: '2026-06-05', coverage: 74, note: 'Deviation flagged' }
      ],
      lightShots: hyndlandShots
    },
    {
      id: 'proj-marischal', name: 'Marischal Office Fit-Out', short: 'Marischal',
      sector: 'Commercial', type: 'Cat-B office fit-out, single floor',
      location: 'Marischal Square, Aberdeen, AB10', client: 'Granite Financial Ltd', area: 320,
      stage: 'Complete', coverage: 91, status: 'On track', depth: 'light', noPhotos: true,
      start: '2026-01-20', target: '2026-06-27',
      bim: { software: 'Autodesk Revit → IFC export', file: 'Marischal_FitOut_R5.ifc', lod: 300, disciplines: ['Architectural', 'MEP'], aligned: '2026-06-07' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'North Sea Contracts — fit-out'],
      trades: [],
      zones: [
        { name: 'Open-plan office', area: 180, coverage: 95, note: 'Furniture in; commissioning' },
        { name: 'Meeting Room A', area: 24, coverage: 92, note: 'AV second fix done' },
        { name: 'Meeting Room B', area: 22, coverage: 90, note: 'Snagging' },
        { name: 'WC block', area: 26, coverage: 90, note: 'Signed off' },
        { name: 'Kitchenette', area: 14, coverage: 88, note: 'Appliance test outstanding' },
        { name: 'Reception', area: 54, coverage: 85, note: 'Joinery counter being fitted' }
      ],
      issues: [
        { id: 'MA-01', sev: 'Major', zone: 'Open-plan office', title: 'HVAC commissioning incomplete', status: 'Open', raised: '2026-06-03', appearAt: 80, clearAt: null },
        { id: 'MA-02', sev: 'Minor', zone: 'Reception', title: 'Reception counter delivery delayed', status: 'Open', raised: '2026-05-28', appearAt: 78, clearAt: null }
      ],
      scans: [
        { date: '2026-01-23', coverage: 0, note: 'Baseline vs BIM' },
        { date: '2026-03-04', coverage: 31, note: 'Strip-out + first fix' },
        { date: '2026-04-15', coverage: 58, note: 'Partitions + M&E' },
        { date: '2026-05-19', coverage: 79, note: 'Second fix' },
        { date: '2026-06-07', coverage: 91, note: 'Commissioning' }
      ]
    },
    {
      id: 'proj-cityquay', name: 'City Quay Warehouse', short: 'City Quay',
      sector: 'Commercial', type: 'Warehouse → light-industrial unit conversion',
      location: 'City Quay, Dundee, DD1', client: 'Tay Logistics Ltd', area: 850,
      stage: 'Complete', coverage: 82, status: 'Needs review', depth: 'light', noPhotos: true,
      start: '2025-12-01', target: '2026-07-11',
      bim: { software: 'Autodesk Revit → IFC export', file: 'CityQuay_Conversion_R4.ifc', lod: 300, disciplines: ['Architectural', 'Structural'], aligned: '2026-06-05' },
      team: ['A. Patel — project lead', 'M. Ahmed — scan / tech', 'Tayside Industrial — main contractor'],
      trades: [],
      zones: [
        { name: 'Ground-floor open span', area: 520, coverage: 86, note: 'Slab + cladding done' },
        { name: 'Loading bay', area: 90, coverage: 84, note: 'Roller doors installed' },
        { name: 'WC / welfare block', area: 40, coverage: 80, note: 'Second fix outstanding' },
        { name: 'Office pod', area: 60, coverage: 79, note: 'Partitions up; fit-out pending' },
        { name: 'Mezzanine', area: 140, coverage: 78, note: 'Fire-stopping gap flagged' }
      ],
      issues: [
        { id: 'CQ-01', sev: 'Critical', zone: 'Mezzanine', title: 'Fire-stopping gap at service penetration', status: 'Open', raised: '2026-06-02', appearAt: 70, clearAt: null },
        { id: 'CQ-02', sev: 'Major', zone: 'Office pod', title: 'Partition line deviates from BIM', status: 'Open', raised: '2026-05-29', appearAt: 68, clearAt: null, deviation: true }
      ],
      scans: [
        { date: '2025-12-04', coverage: 0, note: 'Baseline vs BIM' },
        { date: '2026-02-02', coverage: 27, note: 'Strip-out + slab' },
        { date: '2026-03-30', coverage: 49, note: 'Cladding + structure' },
        { date: '2026-05-08', coverage: 68, note: 'Roller doors + partitions' },
        { date: '2026-06-05', coverage: 82, note: 'Fit-out progressing' }
      ]
    }
  ];

  window.OPTISYNC = {
    company: 'Cairn Refurbishment Ltd',
    user: { name: 'A. Patel', role: 'Project lead', email: 'a.patel@cairnrefurb.co.uk' },
    projects: projects,
    pool: pool,
    POOL: POOL,
    planSketch: planSketch,
    stats: { projects: 6, residential: 4, commercial: 2, scans: 23, openIssues: 15, closedIssues: 4, avgCoverage: 73 },
    plan: {
      current: 'Business', price: 49, usage: 6, limit: 10,
      tiers: [
        { name: 'Free', price: 0, projects: '1 project', blurb: 'Try a single site, no card.' },
        { name: 'Solo', price: 19, projects: '3 projects', blurb: 'For the one-van operator.' },
        { name: 'Business', price: 49, projects: '10 projects', blurb: 'Most popular — SME contractors.' },
        { name: 'Team', price: 99, projects: '30 projects', blurb: 'Multi-crew, shared portfolio.' },
        { name: 'Scale', price: 149, projects: 'Unlimited', blurb: 'Developers & main contractors.' }
      ],
      addons: [
        { name: 'Prepared progress report', price: '£300–750', blurb: 'We compile & polish a client-ready PDF.' },
        { name: 'BIM model setup', price: '~£500', blurb: 'We build/align the IFC from your drawings.' }
      ]
    }
  };

  // Stage system — base bands carry colour + clear, professional wording.
  window.OPTISYNC.STAGE = {
    Early:    { label: 'Early stage', desc: 'Strip-out & first fix', cls: 'early' },
    Mid:      { label: 'Mid-build',   desc: 'Second fix & fit-out',  cls: 'mid' },
    Complete: { label: 'Complete',    desc: 'Handover-ready',        cls: 'complete' }
  };
  // coverage band for stage-appropriate captures
  window.OPTISYNC.bandFor = function (cov) {
    if (cov < 40) return 'early';
    if (cov <= 80) return 'mid';
    return 'complete';
  };
  // base stage (colour key) for a coverage value
  window.OPTISYNC.bandStage = function (cov) {
    if (cov >= 100) return 'Complete';
    if (cov >= 40) return 'Mid';
    return 'Early';
  };
  // finer professional label for scrubbed / report snapshots
  window.OPTISYNC.stageFor = function (cov) {
    if (cov < 15) return 'Baseline';
    if (cov < 40) return 'Early stage';
    if (cov < 80) return 'Mid-build';
    if (cov < 100) return 'Finishing';
    return 'Complete';
  };
  // area-weighted roll-up of zone coverage → overall %
  window.OPTISYNC.rollup = function (zones) {
    if (!zones || !zones.length) return 0;
    var a = 0, w = 0;
    zones.forEach(function (z) { a += (z.area || 1) * z.coverage; w += (z.area || 1); });
    return Math.round(a / w);
  };
})();
