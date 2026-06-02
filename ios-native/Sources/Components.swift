// Shared Athar Eye UI atoms ported from pwa/src/components/primitives.tsx.
// ONE teal hero per screen; structural elements grey; red only for missing/critical.
import SwiftUI

// MARK: - Brand mark + wordmark

/// The AtharEye "eye" mark — a teal ring with a filled pupil (a simple, on-brand glyph).
struct BrandMark: View {
    var size: CGFloat = 26
    var body: some View {
        ZStack {
            Circle()
                .stroke(T.accent, lineWidth: size * 0.11)
                .frame(width: size, height: size)
            Circle()
                .fill(T.accent)
                .frame(width: size * 0.4, height: size * 0.4)
        }
        .frame(width: size, height: size)
    }
}

/// "Athar**Eye**" wordmark with an optional small uppercase subtitle (e.g. PROGRESS REPORT).
struct Wordmark: View {
    var size: CGFloat = 16
    var sub: String? = nil
    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            (
                Text("Athar").foregroundStyle(T.text)
                    + Text("Eye").foregroundStyle(T.accent)
            )
            .font(.system(size: size, weight: .heavy))
            .tracking(-0.3)
            if let sub {
                Text(sub)
                    .font(.system(size: size * 0.5, weight: .bold))
                    .tracking(1.2)
                    .foregroundStyle(T.muted)
            }
        }
    }
}

// MARK: - Status badge (quiet neutral chip + coloured dot)

struct StatusBadge: View {
    let status: ProjectStatus
    var small: Bool = false
    var body: some View {
        let s = StatusStyle.of(status)
        HStack(spacing: 6) {
            Circle().fill(s.color).frame(width: 6, height: 6)
            Text(s.label)
                .font(.system(size: small ? 11.5 : 12.5, weight: .semibold))
                .foregroundStyle(T.text)
        }
        .padding(.vertical, small ? 3 : 4)
        .padding(.horizontal, small ? 9 : 11)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .stroke(T.hairline, lineWidth: 1)
                )
        )
    }
}

// MARK: - Progress bar (grey by default; red for behind-schedule rooms)

struct ProgressBar: View {
    let value: Int            // 0…100
    var color: Color = T.bar
    var height: CGFloat = 6
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(T.track)
                Capsule()
                    .fill(color)
                    .frame(width: geo.size.width * CGFloat(max(0, min(100, value))) / 100)
            }
        }
        .frame(height: height)
    }
}

// MARK: - Mini ring (grey default; teal for the screen hero)

struct Ring: View {
    var value: Int = 0
    var size: CGFloat = 52
    var stroke: CGFloat = 5
    var accent: Bool = false
    var label: String? = nil

    var body: some View {
        let v = max(0, min(100, value))
        ZStack {
            Circle()
                .stroke(T.track, lineWidth: stroke)
            Circle()
                .trim(from: 0, to: CGFloat(v) / 100)
                .stroke(
                    accent ? T.accent : T.bar,
                    style: StrokeStyle(lineWidth: stroke, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            VStack(spacing: 0) {
                Text("\(v)")
                    .font(.system(size: size * 0.3, weight: .heavy))
                    .tracking(-0.5)
                    .foregroundStyle(accent ? T.accent : T.text)
                if let label {
                    Text(label)
                        .font(.system(size: 8.5, weight: .bold))
                        .tracking(0.3)
                        .foregroundStyle(T.faint)
                }
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Filter chips (single-select, teal when active)

struct FilterChips<Item: Hashable>: View {
    let items: [Item]
    let label: (Item) -> String
    @Binding var active: Item

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(items, id: \.self) { item in
                    let on = item == active
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.9)) { active = item }
                    } label: {
                        Text(label(item))
                            .font(.system(size: 14, weight: .semibold))
                            .tracking(-0.1)
                            .foregroundStyle(on ? T.onAccent : T.muted)
                            .padding(.vertical, 8)
                            .padding(.horizontal, 14)
                            .background(
                                RoundedRectangle(cornerRadius: 11, style: .continuous)
                                    .fill(on ? T.accent : T.surface2)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 4)
        }
    }
}

// MARK: - Section label (uppercase grey)

struct SectionLabel<Right: View>: View {
    let title: String
    @ViewBuilder var right: Right

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title.uppercased())
                .font(.system(size: 13, weight: .bold))
                .tracking(0.4)
                .foregroundStyle(T.muted)
            Spacer()
            right
        }
        .padding(.horizontal, 2)
        .padding(.vertical, 8)
    }
}

extension SectionLabel where Right == EmptyView {
    init(_ title: String) {
        self.init(title: title) { EmptyView() }
    }
}
