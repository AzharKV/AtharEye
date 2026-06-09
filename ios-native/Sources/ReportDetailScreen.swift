// Report detail — the count-up coverage Donut hero, Covered/Missing tiles, and a
// coverage-by-room list. Ported from pwa/src/screens/Reports.tsx (ReportDetail).
import SwiftUI

struct ReportDetailScreen: View {
    let project: Project

    // Drives both the arc fill and the number — animates 0 → pct over ~1.1s on appear.
    @State private var animated: Double = 0

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                titleRow
                heroCard
                roomsSection
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 32)
        }
        .background(T.bg.ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            // Branded header: teal mark + AtharEye · PROGRESS REPORT.
            ToolbarItem(placement: .principal) {
                HStack(spacing: 9) {
                    BrandMark(size: 24)
                    Wordmark(size: 16, sub: "PROGRESS REPORT")
                }
            }
        }
        .toolbarBackground(T.bg, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .onAppear {
            animated = 0
            withAnimation(.easeOut(duration: 1.1)) { animated = Double(project.pct) }
        }
    }

    // MARK: title + status

    private var titleRow: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(project.name)
                    .font(.system(size: 21, weight: .heavy))
                    .tracking(-0.4)
                    .foregroundStyle(T.text)
                    .lineLimit(1)
                Text("Scanned \(project.last) · 2 Jun 2026")
                    .font(.system(size: 12.5))
                    .foregroundStyle(T.muted)
            }
            Spacer(minLength: 8)
            StatusBadge(status: project.status)
        }
    }

    // MARK: hero donut + Covered/Missing tiles

    private var heroCard: some View {
        VStack(spacing: 18) {
            CoverageDonut(value: animated, size: 196, stroke: 18)
            HStack(spacing: 10) {
                coverageTile("Covered", "\(project.coveredArea) m²", T.accent)
                coverageTile("Missing", "\(project.missingArea) m²", T.danger)
            }
        }
        .padding(.init(top: 24, leading: 18, bottom: 18, trailing: 18))
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    RadialGradient(
                        colors: [T.surface2, T.surface],
                        center: .top,
                        startRadius: 0,
                        endRadius: 260
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(T.hairline, lineWidth: 1)
                )
        )
    }

    private func coverageTile(_ label: String, _ value: String, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(spacing: 6) {
                Circle().fill(color).frame(width: 8, height: 8)
                Text(label)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(T.muted)
            }
            Text(value)
                .font(.system(size: 20, weight: .heavy))
                .foregroundStyle(color)
        }
        .padding(.init(top: 12, leading: 14, bottom: 12, trailing: 14))
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 13, style: .continuous)
                .fill(color.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 13, style: .continuous)
                        .stroke(color.opacity(0.15), lineWidth: 1)
                )
        )
    }

    // MARK: coverage by area

    private var roomsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionLabel("Coverage by area")
            VStack(spacing: 0) {
                ForEach(Array(project.rooms.enumerated()), id: \.element.id) { index, room in
                    let behind = room.pct < 45
                    HStack(spacing: 12) {
                        Text(room.name)
                            .font(.system(size: 14.5, weight: .semibold))
                            .foregroundStyle(T.text)
                            .lineLimit(1)
                            .frame(width: 104, alignment: .leading)
                        ProgressBar(value: room.pct, color: behind ? T.danger : T.bar)
                        Text("\(room.pct)%")
                            .font(.system(size: 13.5, weight: .bold))
                            .foregroundStyle(behind ? T.danger : T.text)
                            .frame(width: 40, alignment: .trailing)
                    }
                    .padding(.vertical, 11)
                    if index < project.rooms.count - 1 {
                        Rectangle().fill(T.hairline2).frame(height: 1)
                    }
                }
            }
            .padding(.horizontal, 16)
            .cardSurface()
        }
    }
}

// MARK: - Coverage donut (the hero)

/// Teal→accent2 gradient arc on a faint red track, rotated -90°, with the
/// percentage rendered from the same animatable `value` so the number counts
/// up in lockstep with the arc.
struct CoverageDonut: View {
    var value: Double          // 0…100, animated by the parent
    var size: CGFloat = 196
    var stroke: CGFloat = 18

    var body: some View {
        let cov = max(0, min(100, value))
        ZStack {
            // soft teal glow
            Circle()
                .fill(
                    RadialGradient(
                        colors: [T.glow, .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: size * 0.34
                    )
                )
                .padding(size * 0.10)

            // faint red "missing" track
            Circle()
                .stroke(T.danger.opacity(0.20), lineWidth: stroke)

            // teal coverage arc
            Circle()
                .trim(from: 0, to: CGFloat(cov) / 100)
                .stroke(
                    AngularGradient(
                        gradient: Gradient(colors: [T.accent, T.accent2]),
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360)
                    ),
                    style: StrokeStyle(lineWidth: stroke, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            // count-up number + label
            VStack(spacing: 5) {
                HStack(alignment: .lastTextBaseline, spacing: 0) {
                    Text("\(Int(cov.rounded()))")
                        .font(.system(size: size * 0.28, weight: .heavy))
                        .tracking(-1.5)
                        .foregroundStyle(T.accent)
                    Text("%")
                        .font(.system(size: size * 0.13, weight: .heavy))
                        .foregroundStyle(T.muted)
                }
                Text("COVERED")
                    .font(.system(size: 12, weight: .bold))
                    .tracking(0.5)
                    .foregroundStyle(T.muted)
            }
        }
        .frame(width: size, height: size)
    }
}
