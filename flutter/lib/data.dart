// Demo content — ported VERBATIM from pwa/src/data.ts (SPEC §10, authoritative).
// UK/Scotland only; currency £; units metric (m / m²). This is a comparison
// subset, so only the fields the 3 hero screens read are modelled.

/// Coverage of one room/area, as a percentage against the BIM model.
class Room {
  const Room(this.name, this.pct);
  final String name;
  final int pct;
}

class Project {
  const Project({
    required this.id,
    required this.name,
    required this.type,
    required this.location,
    required this.pct,
    required this.status,
    required this.area,
    required this.client,
    required this.scans,
    required this.team,
    required this.last,
    required this.rooms,
  });

  final String id;
  final String name;
  final String type;
  final String location;

  /// Overall coverage %.
  final int pct;
  final String status; // 'On Track' | 'Needs Review' | 'Complete'

  /// Floor area in m².
  final int area;
  final String client;
  final int scans;
  final List<String> team; // initials: JM, AR, KD, PB
  final String last;
  final List<Room> rooms;

  /// Covered m² from the floor area + coverage percentage.
  int get coveredM2 => (area * pct / 100).round();
  int get missingM2 => area - coveredM2;
}

class UserProfile {
  const UserProfile({
    required this.name,
    required this.role,
    required this.company,
    required this.region,
    required this.since,
  });
  final String name;
  final String role;
  final String company;
  final String region;
  final String since;
}

/// The 6 demo projects, verbatim (p1 Byres Road 74% … p6 Leith 100%).
const List<Project> kProjects = [
  Project(
    id: 'p1',
    name: 'Byres Road Retail Unit',
    type: 'Shop refit',
    location: 'Glasgow',
    pct: 74,
    status: 'Needs Review',
    area: 128,
    client: 'Westend Lettings Ltd',
    scans: 9,
    team: ['JM', 'AR', 'KD'],
    last: '2h ago',
    rooms: [
      Room('Shop Floor', 88),
      Room('Stock Room', 62),
      Room('Staff WC', 96),
      Room('Shopfront', 70),
      Room('Rear Lobby', 54),
    ],
  ),
  Project(
    id: 'p2',
    name: 'Morningside Townhouse Ext.',
    type: 'Residential extension',
    location: 'Edinburgh',
    pct: 58,
    status: 'On Track',
    area: 46,
    client: 'Private — Mr A. Sutherland',
    scans: 6,
    team: ['JM', 'PB'],
    last: '1d ago',
    rooms: [
      Room('Kitchen Ext.', 64),
      Room('Utility', 71),
      Room('Roof Structure', 40),
      Room('Foundations', 95),
    ],
  ),
  Project(
    id: 'p3',
    name: 'Union Street Office Fit-Out',
    type: 'Commercial · Level 3',
    location: 'Aberdeen',
    pct: 91,
    status: 'On Track',
    area: 310,
    client: 'Granite Workspace plc',
    scans: 14,
    team: ['KD', 'AR', 'PB', 'JM'],
    last: '4h ago',
    rooms: [
      Room('Open Plan', 94),
      Room('Meeting Rms', 88),
      Room('Reception', 97),
      Room('Server Room', 85),
      Room('Kitchenette', 90),
    ],
  ),
  Project(
    id: 'p4',
    name: 'Dundee Waterfront Warehouse',
    type: 'Industrial',
    location: 'Dundee',
    pct: 82,
    status: 'Needs Review',
    area: 1140,
    client: 'Tay Logistics',
    scans: 11,
    team: ['AR', 'KD'],
    last: 'Yesterday',
    rooms: [
      Room('Main Floor', 86),
      Room('Mezzanine', 74),
      Room('Loading Bay', 91),
      Room('Office Block', 62),
    ],
  ),
  Project(
    id: 'p5',
    name: 'Stirling Flat Renovation',
    type: 'Residential',
    location: 'Stirling',
    pct: 39,
    status: 'On Track',
    area: 72,
    client: 'Forth Property Co.',
    scans: 3,
    team: ['PB'],
    last: '3d ago',
    rooms: [
      Room('Living Room', 48),
      Room('Bathroom', 30),
      Room('Bedroom 1', 52),
      Room('Hallway', 26),
    ],
  ),
  Project(
    id: 'p6',
    name: 'Leith Café Build',
    type: 'Hospitality',
    location: 'Edinburgh',
    pct: 100,
    status: 'Complete',
    area: 88,
    client: 'Shore & Bean',
    scans: 18,
    team: ['JM', 'AR', 'KD'],
    last: 'Handover complete',
    rooms: [
      Room('Café Floor', 100),
      Room('Kitchen', 100),
      Room('Counter', 100),
      Room('WC', 100),
      Room('Store', 100),
    ],
  ),
];

const UserProfile kUser = UserProfile(
  name: 'James Mackay',
  role: 'Site Supervisor',
  company: 'Athar Robotics',
  region: 'Scotland, UK',
  since: 'Jan 2026',
);

/// Aggregate scan stats shown on the report + active-scan screens.
class ScanStats {
  const ScanStats();
  final String points = '1.84 M';
  final String alignment = '±21 mm';
}

const ScanStats kScanStats = ScanStats();

/// BIM model filename per project (the reference the scan is compared against).
const Map<String, String> kBimFile = {
  'p1': 'ByresRoad_GF.ifc',
  'p2': 'Morningside_Ext.ifc',
  'p3': 'UnionSt_L3.ifc',
  'p4': 'DundeeWH.ifc',
  'p5': 'StirlingFlat.ifc',
  'p6': 'LeithCafe.ifc',
};

String bimFileFor(String id) => kBimFile[id] ?? 'model.ifc';

/// Portfolio average coverage across all projects.
int portfolioAvg(List<Project> ps) =>
    ps.isEmpty ? 0 : (ps.fold<int>(0, (s, p) => s + p.pct) / ps.length).round();
