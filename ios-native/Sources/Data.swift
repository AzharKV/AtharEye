// Demo content ported VERBATIM from pwa/src/data.ts (SPEC §10, authoritative).
// UK/Scotland only; currency £; units metric (m / m²).
import Foundation

// MARK: - Models

enum ProjectStatus: String {
    case onTrack = "On Track"
    case needsReview = "Needs Review"
    case complete = "Complete"
}

/// A coverage row inside a project (name + coverage %). Mirrors the PWA `rooms` entries.
struct Room: Identifiable {
    let name: String
    let pct: Int
    var id: String { name }
}

struct Project: Identifiable {
    let id: String
    let name: String
    let type: String
    let location: String
    let pct: Int
    let status: ProjectStatus
    let area: Int
    let client: String
    let scans: Int
    let team: [String]
    let last: String
    let rooms: [Room]

    /// Covered m² from floor area + coverage % (mirrors roundM in lib/format.ts).
    var coveredArea: Int { Int((Double(area) * Double(pct) / 100).rounded()) }
    /// Missing / unscanned m².
    var missingArea: Int { area - coveredArea }
}

struct DemoUser {
    let name: String
    let role: String
    let company: String
    let region: String
    let since: String
}

struct ScanStats {
    /// Total points captured, as shown ("1.84 M").
    let points: String
    /// Alignment accuracy ("±21 mm").
    let alignment: String
    /// Numeric points total in millions (for the live count-up during a scan).
    let pointsMillions: Double
}

// MARK: - Demo data

enum DemoData {
    static let user = DemoUser(
        name: "James Mackay",
        role: "Site Supervisor",
        company: "Athar Robotics",
        region: "Scotland, UK",
        since: "Jan 2026"
    )

    static let scanStats = ScanStats(points: "1.84 M", alignment: "±21 mm", pointsMillions: 1.84)

    static let teamNames: [String: String] = [
        "JM": "James Mackay",
        "AR": "Aisha Rahman",
        "KD": "Kerr Douglas",
        "PB": "Priya Bose",
    ]

    static let projects: [Project] = [
        Project(
            id: "p1",
            name: "Byres Road Retail Unit",
            type: "Shop refit",
            location: "Glasgow",
            pct: 74,
            status: .needsReview,
            area: 128,
            client: "Westend Lettings Ltd",
            scans: 9,
            team: ["JM", "AR", "KD"],
            last: "2h ago",
            rooms: [
                Room(name: "Shop Floor", pct: 88),
                Room(name: "Stock Room", pct: 62),
                Room(name: "Staff WC", pct: 96),
                Room(name: "Shopfront", pct: 70),
                Room(name: "Rear Lobby", pct: 54),
            ]
        ),
        Project(
            id: "p2",
            name: "Morningside Townhouse Ext.",
            type: "Residential extension",
            location: "Edinburgh",
            pct: 58,
            status: .onTrack,
            area: 46,
            client: "Private — Mr A. Sutherland",
            scans: 6,
            team: ["JM", "PB"],
            last: "1d ago",
            rooms: [
                Room(name: "Kitchen Ext.", pct: 64),
                Room(name: "Utility", pct: 71),
                Room(name: "Roof Structure", pct: 40),
                Room(name: "Foundations", pct: 95),
            ]
        ),
        Project(
            id: "p3",
            name: "Union Street Office Fit-Out",
            type: "Commercial · Level 3",
            location: "Aberdeen",
            pct: 91,
            status: .onTrack,
            area: 310,
            client: "Granite Workspace plc",
            scans: 14,
            team: ["KD", "AR", "PB", "JM"],
            last: "4h ago",
            rooms: [
                Room(name: "Open Plan", pct: 94),
                Room(name: "Meeting Rms", pct: 88),
                Room(name: "Reception", pct: 97),
                Room(name: "Server Room", pct: 85),
                Room(name: "Kitchenette", pct: 90),
            ]
        ),
        Project(
            id: "p4",
            name: "Dundee Waterfront Warehouse",
            type: "Industrial",
            location: "Dundee",
            pct: 82,
            status: .needsReview,
            area: 1140,
            client: "Tay Logistics",
            scans: 11,
            team: ["AR", "KD"],
            last: "Yesterday",
            rooms: [
                Room(name: "Main Floor", pct: 86),
                Room(name: "Mezzanine", pct: 74),
                Room(name: "Loading Bay", pct: 91),
                Room(name: "Office Block", pct: 62),
            ]
        ),
        Project(
            id: "p5",
            name: "Stirling Flat Renovation",
            type: "Residential",
            location: "Stirling",
            pct: 39,
            status: .onTrack,
            area: 72,
            client: "Forth Property Co.",
            scans: 3,
            team: ["PB"],
            last: "3d ago",
            rooms: [
                Room(name: "Living Room", pct: 48),
                Room(name: "Bathroom", pct: 30),
                Room(name: "Bedroom 1", pct: 52),
                Room(name: "Hallway", pct: 26),
            ]
        ),
        Project(
            id: "p6",
            name: "Leith Café Build",
            type: "Hospitality",
            location: "Edinburgh",
            pct: 100,
            status: .complete,
            area: 88,
            client: "Shore & Bean",
            scans: 18,
            team: ["JM", "AR", "KD"],
            last: "Handover complete",
            rooms: [
                Room(name: "Café Floor", pct: 100),
                Room(name: "Kitchen", pct: 100),
                Room(name: "Counter", pct: 100),
                Room(name: "WC", pct: 100),
                Room(name: "Store", pct: 100),
            ]
        ),
    ]

    /// Portfolio average coverage % across all projects.
    static var portfolioAvg: Int {
        guard !projects.isEmpty else { return 0 }
        let total = projects.reduce(0) { $0 + $1.pct }
        return Int((Double(total) / Double(projects.count)).rounded())
    }

    static var onTrackCount: Int { projects.filter { $0.status == .onTrack }.count }
    static var reviewCount: Int { projects.filter { $0.status == .needsReview }.count }
    static var completeCount: Int { projects.filter { $0.status == .complete }.count }

    /// Map team initials → full display name (falls back to the initials).
    static func teamName(_ initials: String) -> String { teamNames[initials] ?? initials }
}

// MARK: - Project filters (mirrors the PWA chip logic)

enum ProjectFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case onSite = "On site"
    case needsReview = "Needs review"
    case complete = "Complete"

    var id: String { rawValue }

    func matches(_ p: Project) -> Bool {
        switch self {
        case .all: return true
        case .onSite: return p.status != .complete
        case .needsReview: return p.status == .needsReview
        case .complete: return p.status == .complete
        }
    }
}
