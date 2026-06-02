// types.ts — typed domain model for the Athar Eye demo data (SPEC §10).
import type { ProjectStatus, Severity } from './theme';

export type { ProjectStatus, Severity };

/** Coverage of one room/area, as a percentage against the BIM model. */
export interface Room {
  name: string;
  pct: number;
}

/** An open site issue surfaced by a scan. */
export interface Issue {
  /** Short title. */
  t: string;
  /** Location (room · grid reference). */
  loc: string;
  sev: Severity;
}

/** A linked BIM model — the reference a scan is aligned against. */
export interface BimModel {
  file: string;
  size: string;
  ver: string;
  uploaded: string;
  elements: string;
}

/** Team member initials used across avatars (JM, AR, KD, PB…). */
export type TeamInitials = string;

export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  /** Overall coverage %. */
  pct: number;
  status: ProjectStatus;
  /** Floor area in m². */
  area: number;
  client: string;
  scans: number;
  team: TeamInitials[];
  /** Human "last scan" label, e.g. "2h ago". */
  last: string;
  rooms: Room[];
  issues: Issue[];
  /** Attached BIM model (present on user-created projects). */
  bim?: BimModel;
}

export interface UserProfile {
  name: string;
  role: string;
  company: string;
  region: string;
  since: string;
  stats: { projects: number; scans: number; reports: number };
}

export interface Subscription {
  plan: string;
  price: string;
  period: string;
  renews: string;
  used: number;
  limit: number;
}

export interface DemoData {
  user: UserProfile;
  subscription: Subscription;
  projects: Project[];
  teamColors: Record<string, string>;
  teamNames: Record<string, string>;
  scanStats: { points: string; alignment: string };
}

/** A room cell on the isometric floor-plan grid (massing diagram). */
export interface PlanRoom {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  pct: number;
}

export interface SubPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  current?: boolean;
  features: string[];
}

export interface SubAddon {
  label: string;
  price: string;
}
