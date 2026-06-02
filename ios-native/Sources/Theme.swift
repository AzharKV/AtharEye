// Athar Eye design tokens (SPEC §6.2/6.3) ported from pwa/src/theme.ts.
// Dark navy + teal, SF system font, 4-pt grid. ONE teal hero per screen;
// structural elements grey; red only for missing/critical.
import SwiftUI

// MARK: - Hex Color helper

extension Color {
    /// Build a Color from a hex string ("#0C0F12" or "0C0F12"); supports RGB, RRGGBB, AARRGGBB.
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let a, r, g, b: UInt64
        switch s.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (v >> 8) * 17, (v >> 4 & 0xF) * 17, (v & 0xF) * 17)
        case 6: // RRGGBB
            (a, r, g, b) = (255, v >> 16, v >> 8 & 0xFF, v & 0xFF)
        case 8: // AARRGGBB
            (a, r, g, b) = (v >> 24, v >> 16 & 0xFF, v >> 8 & 0xFF, v & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Design tokens

enum T {
    static let bg = Color(hex: "#0C0F12")
    static let surface = Color(hex: "#15191E")
    static let surface2 = Color(hex: "#1B2026")
    static let surfaceHi = Color(hex: "#20262E")
    static let hairline = Color.white.opacity(0.07)
    static let hairline2 = Color.white.opacity(0.04)
    static let text = Color(hex: "#F4F6F8")
    static let muted = Color(hex: "#8A949E")
    static let faint = Color(hex: "#5B646D")
    static let accent = Color(hex: "#14B8C0")
    static let accent2 = Color(hex: "#45D6DD")
    static let accentPress = Color(hex: "#0F949B")
    static let onAccent = Color(hex: "#04222B")
    static let bar = Color(hex: "#AEB8C2")
    static let track = Color.white.opacity(0.09)
    static let warning = Color(hex: "#E8A33D")
    static let danger = Color(hex: "#E5484D")
    static let glow = Color(hex: "#14B8C0").opacity(0.20)
}

// MARK: - Status → colour + label (mirrors STATUS in theme.ts)

enum StatusStyle {
    /// (dot colour, label) for a project status. Teal = positive, amber = the one caution accent.
    static func of(_ status: ProjectStatus) -> (color: Color, label: String) {
        switch status {
        case .onTrack: return (T.accent, "On track")
        case .needsReview: return (T.warning, "Needs review")
        case .complete: return (T.accent, "Complete")
        }
    }
}

// MARK: - Shared view styles

/// Hairline-bordered surface card (radius 18) used across screens.
struct CardBackground: View {
    var fill: Color = T.surface
    var radius: CGFloat = 18
    var body: some View {
        RoundedRectangle(cornerRadius: radius, style: .continuous)
            .fill(fill)
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(T.hairline, lineWidth: 1)
            )
    }
}

extension View {
    /// Wrap content in the standard surface card.
    func cardSurface(_ fill: Color = T.surface, radius: CGFloat = 18) -> some View {
        background(CardBackground(fill: fill, radius: radius))
    }
}

/// The primary teal pill button (height 52) — one hero CTA per screen.
struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .bold))
            .foregroundStyle(T.onAccent)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(configuration.isPressed ? T.accentPress : T.accent)
            )
            .shadow(color: T.accent.opacity(0.30), radius: 8, y: 4)
            .scaleEffect(configuration.isPressed ? 0.985 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}
