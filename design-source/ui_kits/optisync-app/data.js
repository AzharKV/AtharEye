/* OptiSync UI kit — compact demo data (subset of the production set). */
window.KIT = {
  projects: [
    {
      id: 'morningside', short: 'Morningside', name: 'Morningside Townhouse',
      sector: 'Residential', location: 'Morningside, Edinburgh, EH10', client: 'Caldwell Property Group',
      area: 142, stage: 'Mid', coverage: 62, status: 'On track', target: '18 Sep 2026',
      zones: [
        { name: 'Bedroom 1', coverage: 75 }, { name: 'Kitchen', coverage: 70 },
        { name: 'Living Room', coverage: 65 }, { name: 'Hall / Stair', coverage: 58 },
        { name: 'Family Bathroom', coverage: 55 }, { name: 'En-suite', coverage: 48 }
      ],
      issues: [
        { id: 'MO-01', sev: 'Critical', zone: 'Kitchen', title: 'Boiler flue clearance below regs to new window' },
        { id: 'MO-02', sev: 'Major', zone: 'En-suite', title: 'Wall-tile lippage exceeds 2 mm tolerance' },
        { id: 'MO-03', sev: 'Minor', zone: 'Bedroom 3', title: 'Patchy mist-coat, second coat needed' }
      ],
      scans: [0, 18, 34, 51, 62],
      summary: '62% of the BIM model verified against site. First fix and plastering are complete across all eight zones; the project is now in second fix, kitchen and bathroom fit, and early decoration — on programme for a September handover.'
    },
    {
      id: 'leith', short: 'Leith', name: 'Leith Tenement Flat',
      sector: 'Residential', location: 'Leith, Edinburgh, EH6', client: 'Shoreline Lettings Ltd',
      area: 71, stage: 'Complete', coverage: 100, status: 'Complete', target: '30 May 2026',
      zones: [
        { name: 'Kitchen', coverage: 100 }, { name: 'Bathroom', coverage: 100 },
        { name: 'Bedroom 1', coverage: 100 }, { name: 'Living Room', coverage: 100 }, { name: 'Hall / Stair', coverage: 100 }
      ],
      issues: [],
      scans: [0, 22, 48, 71, 94, 100],
      summary: '100% verified against the as-built model. All trades complete, all snags closed, flat handed over to Shoreline Lettings on 30 May 2026. This report is the handover artifact.'
    },
    {
      id: 'stirling', short: 'Stirling', name: 'Stirling Flat Refurbishment',
      sector: 'Residential', location: "King's Park, Stirling, FK8", client: 'J. Boyle',
      area: 68, stage: 'Early', coverage: 28, status: 'On track', target: '7 Aug 2026',
      zones: [
        { name: 'Living / Kitchen', coverage: 35 }, { name: 'Bedroom 1', coverage: 30 },
        { name: 'Hall / Stair', coverage: 28 }, { name: 'Bathroom', coverage: 22 }
      ],
      issues: [
        { id: 'ST-03', sev: 'Critical', zone: 'Living / Kitchen', title: 'Lintel above old opening needs renewal' },
        { id: 'ST-01', sev: 'Major', zone: 'Bathroom', title: 'Penetrating damp, external gable wall' }
      ],
      scans: [0, 12, 28],
      summary: '28% of the BIM model verified against site. Strip-out and structural repairs are complete; first-fix electrical and plumbing are live. This report establishes the baseline and the early risk register before plastering.'
    },
    {
      id: 'hyndland', short: 'Hyndland', name: 'Hyndland Flat',
      sector: 'Residential', location: 'Hyndland, Glasgow, G12', client: 'R. Mackenzie',
      area: 74, stage: 'Mid', coverage: 74, status: 'Needs review', target: '25 Jul 2026',
      zones: [
        { name: 'Bathroom', coverage: 80 }, { name: 'Kitchen', coverage: 78 },
        { name: 'Living Room', coverage: 76 }, { name: 'Hall', coverage: 66 }
      ],
      issues: [
        { id: 'HY-01', sev: 'Critical', zone: 'Hall', title: 'Partition 220 mm off plan — under review' }
      ],
      scans: [0, 29, 55, 74],
      summary: '74% verified. The latest scan flags a partition wall built 220 mm off the BIM position on the kitchen / hall line — a real deviation under review before it is built around.'
    }
  ]
};
