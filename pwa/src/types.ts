// Typed domain model for OptiSync (handoff bundle: OPTISYNC_DATA_SPEC.md).
// State is in-memory, seeded from data.ts; refresh = reset (no localStorage for core state).

export type Sector = 'Residential' | 'Commercial';
/** Stage band — drives the stage chip + report variant. UI label = Early / Mid / Complete. */
export type Stage = 'Early' | 'Mid' | 'Complete';
export type Status = 'On track' | 'Needs review' | 'Behind' | 'Complete';
export type Severity = 'Critical' | 'Major' | 'Minor';
export type TradeStatus = 'Done' | 'In progress' | 'Not started';
export type Role = 'Owner' | 'Admin' | 'Editor' | 'Viewer';

/** A room/area: scanned-and-aligned floor area vs the BIM plan, 0–100. Rolls up (area-weighted). */
export interface Zone {
  id: string;
  name: string;
  area_m2: number;
  coverage: number;
  stage: Stage;
  note: string;
}

export interface Trade {
  name: string;
  status: TradeStatus;
}

/**
 * A site issue / snag.
 * `appear` / `clear` are coverage thresholds (0–100) that drive the timeline scrubber:
 * an issue is OPEN at a scrubbed coverage `c` when `appear <= c` and (`clear` is unset or `c < clear`).
 * They are calibrated against the staged reports in OPTISYNC_DEEP_REPORTS.md.
 */
export interface Issue {
  id: string;
  severity: Severity;
  zone: string;
  title: string;
  status: 'Open' | 'Closed';
  raised: string;
  closed?: string;
  appear: number;
  clear?: number;
}

export interface Scan {
  id: string;
  date: string;
  coverage: number;
  note: string;
}

export interface Bim {
  software: string;
  file: string;
  lod: number;
  disciplines: string[];
  last_aligned: string;
}

export interface Project {
  id: string;
  name: string;
  sector: Sector;
  /** Free-text descriptor, e.g. "2-bed tenement flat, full refurbishment". */
  type: string;
  location: string;
  client: string;
  area_m2: number;
  stage: Stage;
  /** Overall coverage % — area-weighted roll-up of the zones. */
  overall_coverage: number;
  status: Status;
  start_date: string;
  target_handover: string;
  /** `deep` = full photo-backed A-to-Z report; `light` = shorter summary card. */
  depth: 'deep' | 'light';
  /** Why a project is flagged Needs review (e.g. the Hyndland partition deviation). */
  reviewNote?: string;
  bim: Bim;
  /** Project site team as "Name · Role" labels (incl. the external contractor). CRUD as text.
   *  Distinct from AppData.team, which is the org roster (app roles) on the Team & access screen. */
  team: string[];
  trades: Trade[];
  zones: Zone[];
  issues: Issue[];
  scans: Scan[];
  /** Curated photo p-indices (→ lib/photos). Commercial projects are empty (captures pending sync). */
  captures: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: Role;
  email: string;
  trade?: string;
}

export interface Company {
  name: string;
  companyNo: string;
  vat: string;
  registeredOffice: string;
  established: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface PlanTier {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  current?: boolean;
  features: string[];
}

export interface Addon {
  label: string;
  price: string;
}

export interface Subscription {
  plan: string;
  price: string;
  period: string;
  renews: string;
  used: number;
  limit: number;
  tiers: PlanTier[];
  addons: Addon[];
}

export interface PortfolioStats {
  projects: number;
  residential: number;
  commercial: number;
  scans: number;
  openIssues: number;
  avgCoverage: number;
}

export interface Settings {
  units: 'Metric (m²)' | 'Imperial (ft²)';
  dateFormat: 'DD MMM YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  lidarQuality: 'Standard' | 'High' | 'Maximum';
  autoAlign: boolean;
  notifications: boolean;
}

/** The whole seeded app state tree. */
export interface AppData {
  projects: Project[];
  company: Company;
  user: UserProfile;
  team: TeamMember[];
  subscription: Subscription;
  settings: Settings;
}
