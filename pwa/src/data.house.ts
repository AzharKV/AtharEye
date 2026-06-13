// Bonaly Terrace demo seed — single residential renovation project.
// Default dataset (no VITE_DATASET env). Area-weighted rollup = 69 (verified below).
// Captures at /captures/ are direct paths (photoSrc handles the leading-slash form).
import type { AppData } from './types';

export const SEED_HOUSE: AppData = {
  projects: [
    {
      id: 'rv1',
      name: 'Bonaly Terrace Refurbishment',
      sector: 'Residential',
      type: 'Residential — full refurbishment',
      location: 'Colinton, Edinburgh EH13',
      client: 'Private client',
      area_m2: 84,
      stage: 'Mid',
      overall_coverage: 69,
      status: 'Needs review',
      start_date: '2026-03-10',
      target_handover: '2026-09-30',
      depth: 'deep',
      reviewNote:
        'Our supervisor scanned the front bedroom in minutes — OptiSync flagged a 17 mm lean in the gable wall we\'d otherwise only have caught at final inspection. Saved a re-plaster after decoration. — Cairn Refurbishment Ltd',
      bim: {
        software: 'Autodesk Revit → IFC export',
        file: 'Bonaly_Refurb_R3.ifc',
        lod: 300,
        disciplines: ['Architectural', 'Structural'],
        last_aligned: '2026-06-11',
      },
      team: [
        'J. Mackay · Site supervisor',
        'Cairn Refurbishment Ltd · Main contractor',
        'R. Stewart · Joiner',
      ],
      trades: [
        { name: 'Strip-out', status: 'Done' },
        { name: 'First fix M&E', status: 'Done' },
        { name: 'Plastering', status: 'Done' },
        { name: 'Kitchen install', status: 'Done' },
        { name: 'Bathroom install', status: 'Done' },
        { name: 'Joinery / second fix', status: 'In progress' },
        { name: 'Flooring', status: 'In progress' },
        { name: 'Decoration', status: 'Not started' },
        { name: 'Snagging', status: 'Not started' },
      ],
      zones: [
        { id: 'z1', name: 'Hallway & stairs', area_m2: 12, coverage: 70, stage: 'Mid', note: 'Parquet to refinish' },
        { id: 'z2', name: 'Living room', area_m2: 18, coverage: 72, stage: 'Mid', note: 'Bay reglazed; floor prep' },
        { id: 'z3', name: 'Kitchen & dining', area_m2: 16, coverage: 80, stage: 'Mid', note: 'Units in; worktops set' },
        { id: 'z4', name: 'Bathroom', area_m2: 6, coverage: 85, stage: 'Mid', note: 'Suite + tiling in' },
        { id: 'z5', name: 'Bedroom 1 (front)', area_m2: 14, coverage: 58, stage: 'Mid', note: 'Plastered; plumb deviation flagged' },
        { id: 'z6', name: 'Bedroom 2 (rear)', area_m2: 12, coverage: 60, stage: 'Mid', note: 'Plastered; boards lifted' },
        { id: 'z7', name: 'Landing', area_m2: 6, coverage: 55, stage: 'Mid', note: 'Balustrade pending' },
      ],
      // Area-weighted check: (12×70 + 18×72 + 16×80 + 6×85 + 14×58 + 12×60 + 6×55) / 84
      // = (840 + 1296 + 1280 + 510 + 812 + 720 + 330) / 84 = 5788 / 84 ≈ 68.9 → rounds to 69 ✓
      issues: [
        {
          id: 'RV-01',
          severity: 'Major',
          zone: 'Bedroom 1 (front)',
          title: 'Front wall 17 mm out of plumb over 2.4 m (NHBC limit 8 mm)',
          status: 'Open',
          raised: '2026-06-11',
          appear: 65,
        },
        {
          id: 'RV-02',
          severity: 'Minor',
          zone: 'Kitchen & dining',
          title: 'Island partition 38 mm off BIM setting-out line',
          status: 'Open',
          raised: '2026-05-30',
          appear: 45,
        },
      ],
      scans: [
        { id: 'sc1', date: '2026-04-02', coverage: 0, note: 'Baseline vs BIM' },
        { id: 'sc2', date: '2026-04-24', coverage: 22, note: 'Strip-out + first fix' },
        { id: 'sc3', date: '2026-05-15', coverage: 41, note: 'Plastering' },
        { id: 'sc4', date: '2026-05-30', coverage: 58, note: 'Kitchen + bathroom in' },
        { id: 'sc5', date: '2026-06-11', coverage: 69, note: 'Second-fix pass — plumb deviation flagged' },
      ],
      // Direct-path captures — photoSrc passes through paths starting with /
      // Mapping: z1=hall+stairs, z2=living_room, z3=kitchen+kitchen_diner, z4=bathroom,
      //          z5=bedroom1, z6=bedroom2, z7=landing; garden = context/hero
      captures: [
        '/captures/bonaly_living_room.jpg',
        '/captures/bonaly_kitchen.jpg',
        '/captures/bonaly_kitchen_diner.jpg',
        '/captures/bonaly_bathroom.jpg',
        '/captures/bonaly_bedroom1.jpg',
        '/captures/bonaly_bedroom2.jpg',
        '/captures/bonaly_hall.jpg',
        '/captures/bonaly_stairs.jpg',
        '/captures/bonaly_landing.jpg',
        '/captures/bonaly_garden.jpg',
      ],
    },
  ],
  company: {
    name: 'Cairn Refurbishment Ltd',
    companyNo: 'SC512347',
    vat: 'GB 412 7785 09',
    registeredOffice: '14 Constitution Street, Leith, Edinburgh, EH6 7BT',
    established: '2014',
  },
  user: {
    name: 'J. Mackay',
    role: 'Site Supervisor',
    email: 'j.mackay@cairnrefurb.co.uk',
    initials: 'JM',
  },
  team: [
    { id: 'm-jm', name: 'J. Mackay', initials: 'JM', role: 'Owner', email: 'j.mackay@cairnrefurb.co.uk', trade: 'Site supervisor' },
    { id: 'm-ma', name: 'M. Ahmed', initials: 'MA', role: 'Admin', email: 'm.ahmed@cairnrefurb.co.uk', trade: 'Scan / tech' },
    { id: 'm-rs', name: 'R. Stewart', initials: 'RS', role: 'Editor', email: 'r.stewart@cairnrefurb.co.uk', trade: 'Joiner' },
    { id: 'm-kd', name: 'K. Dunn', initials: 'KD', role: 'Viewer', email: 'k.dunn@cairnrefurb.co.uk', trade: 'Quantity surveyor' },
  ],
  subscription: {
    plan: 'Business',
    price: '£49',
    period: '/mo',
    renews: '01 Jul 2026',
    used: 1,
    limit: 10,
    tiers: [
      { id: 'free', name: 'Free', price: '£0', period: '/mo', tagline: 'Try OptiSync', features: ['1 project', 'Watermarked reports', 'Community support'] },
      { id: 'starter', name: 'Starter', price: '£19', period: '/mo', tagline: 'Sole traders', features: ['3 projects', 'Unwatermarked reports', 'Email support'] },
      { id: 'business', name: 'Business', price: '£49', period: '/mo', current: true, tagline: 'Growing contractors', features: ['10 projects', 'PDF export + share links', 'Team access (4 seats)', 'Priority support'] },
      { id: 'pro', name: 'Pro', price: '£99', period: '/mo', tagline: 'Multi-site teams', features: ['30 projects', 'Unlimited seats', 'Custom branding on reports', 'BIM auto-align'] },
      { id: 'enterprise', name: 'Enterprise', price: '£149', period: '/mo', tagline: 'Unlimited + priority', features: ['Unlimited projects', 'SSO + audit log', 'Dedicated success manager', 'SLA'] },
    ],
    addons: [
      { label: 'Prepared report (per report)', price: '£300–£750' },
      { label: 'BIM model setup', price: '~£500' },
    ],
  },
  settings: {
    units: 'Metric (m²)',
    dateFormat: 'DD MMM YYYY',
    lidarQuality: 'High',
    autoAlign: true,
    notifications: true,
  },
};
