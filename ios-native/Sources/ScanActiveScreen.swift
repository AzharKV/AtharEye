// Active scan — THE performance showcase. A dark immersive screen with a teal LiDAR
// point cloud building up over ~7s, drawn every frame via TimelineView(.animation) + Canvas.
// Ports makePoints(2000) + the 1-point-perspective projection + reveal/depth shading from
// pwa/src/screens/scan/ScanFlow.tsx (ActiveScan). Auto-finishes at 100%.
import SwiftUI

// MARK: - Point cloud model

/// A single LiDAR point in room space, plus its reveal order `r` (0…1).
private struct ScanPoint {
    let x, y, z: Double
    let r: Double
}

/// Generate a room point cloud as a 1-point-perspective box (floor / ceiling / walls / back),
/// sorted by `r` so points reveal in a stable random order. Mirrors makePoints() in ScanFlow.tsx.
private func makePoints(_ n: Int) -> [ScanPoint] {
    var pts: [ScanPoint] = []
    pts.reserveCapacity(n)
    for _ in 0..<n {
        let s = Double.random(in: 0..<1)
        let x: Double, y: Double, z: Double
        if s < 0.34 {                       // floor
            y = 0
            x = Double.random(in: -1...1)
            z = Double.random(in: 0...3.4)
        } else if s < 0.5 {                 // ceiling
            y = 1.5
            x = Double.random(in: -1...1)
            z = Double.random(in: 0...3.4)
        } else if s < 0.68 {                // left wall
            x = -1
            y = Double.random(in: 0...1.5)
            z = Double.random(in: 0...3.4)
        } else if s < 0.86 {                // right wall
            x = 1
            y = Double.random(in: 0...1.5)
            z = Double.random(in: 0...3.4)
        } else {                            // back wall
            z = 3.4
            x = Double.random(in: -1...1)
            y = Double.random(in: 0...1.5)
        }
        pts.append(ScanPoint(x: x, y: y, z: z, r: Double.random(in: 0..<1)))
    }
    return pts.sorted { $0.r < $1.r }       // reveal order
}

// MARK: - Active scan screen

struct ScanActiveScreen: View {
    /// Called when the scan completes or the user stops/cancels (dismisses the cover).
    let onFinish: () -> Void

    // Pick the highest-progress in-progress site, like the PWA's pre-selected project.
    private let project: Project = DemoData.projects
        .filter { $0.status != .complete }
        .max(by: { $0.pct < $1.pct }) ?? DemoData.projects[0]

    private let points = makePoints(2000)
    private let duration: Double = 7.0      // DUR = 7000ms

    @State private var startDate = Date()
    @State private var progress: Double = 0
    @State private var finished = false
    @State private var pulse = false

    var body: some View {
        ZStack {
            // Fallback gradient backdrop (no live camera in this comparison build).
            RadialGradient(
                colors: [Color(hex: "#1A2630"), Color(hex: "#0C141B"), Color(hex: "#070B0F")],
                center: UnitPoint(x: 0.5, y: 1.1),
                startRadius: 0,
                endRadius: 700
            )
            .ignoresSafeArea()

            // The point cloud — redrawn every frame for 60fps build-up.
            TimelineView(.animation) { timeline in
                Canvas { ctx, size in
                    drawCloud(ctx: &ctx, size: size, now: timeline.date)
                }
                .ignoresSafeArea()
            }

            // Vignette
            Rectangle()
                .fill(.clear)
                .ignoresSafeArea()
                .overlay(
                    RadialGradient(
                        colors: [.clear, .black.opacity(0.7)],
                        center: .center,
                        startRadius: 120,
                        endRadius: 460
                    )
                    .ignoresSafeArea()
                )
                .allowsHitTesting(false)

            cornerBrackets
            topBar
            bottomControls
        }
        .background(Color(hex: "#070B0F").ignoresSafeArea())
        .statusBarHidden(true)
        .onAppear {
            startDate = Date()
            pulse = true
        }
    }

    // MARK: drawing

    private func drawCloud(ctx: inout GraphicsContext, size: CGSize, now: Date) {
        let elapsed = now.timeIntervalSince(startDate)
        let p = min(1, max(0, elapsed / duration))
        // Push progress to SwiftUI state for the live stats / bar (off the draw critical path).
        if abs(p - progress) > 0.001 || (p >= 1 && !finished) {
            DispatchQueue.main.async {
                self.progress = p
                if p >= 1 && !self.finished {
                    self.finished = true
                    let g = UIImpactFeedbackGenerator(style: .medium)
                    g.impactOccurred()
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { self.onFinish() }
                }
            }
        }

        let w = size.width, h = size.height
        let cx = w / 2, cy = h * 0.46, f = h * 0.62

        // 1-point projection shared by the wireframe and the points.
        func proj(_ x: Double, _ y: Double, _ z: Double) -> CGPoint {
            let zz = z + 0.6
            return CGPoint(
                x: cx + CGFloat((x / zz)) * f,
                y: cy - CGFloat(((y - 0.75) / zz)) * f
            )
        }

        // ── faint perspective room wireframe (fades in as the scan progresses)
        let roomA = 0.18 + 0.32 * p
        var grid = Path()
        for gx in [-1.0, -0.5, 0, 0.5, 1.0] {
            grid.move(to: proj(gx, 0, 0))
            grid.addLine(to: proj(gx, 0, 3.4))
        }
        for gz in [0.0, 0.85, 1.7, 2.55, 3.4] {
            grid.move(to: proj(-1, 0, gz))
            grid.addLine(to: proj(1, 0, gz))
        }
        ctx.stroke(grid, with: .color(T.accent.opacity(roomA)), lineWidth: 1.5)

        var frame = Path()
        for (cxn, czn) in [(-1.0, 0.0), (1.0, 0.0), (-1.0, 3.4), (1.0, 3.4)] {
            frame.move(to: proj(cxn, 0, czn))
            frame.addLine(to: proj(cxn, 1.5, czn))
        }
        frame.move(to: proj(-1, 1.5, 0))
        frame.addLine(to: proj(1, 1.5, 0))
        frame.addLine(to: proj(1, 1.5, 3.4))
        frame.addLine(to: proj(-1, 1.5, 3.4))
        frame.addLine(to: proj(-1, 1.5, 0))
        ctx.stroke(frame, with: .color(T.accent.opacity(roomA * 0.55)), lineWidth: 1.5)

        // ── revealed points (depth-shaded teal; last ~40 are "fresh": brighter + larger)
        let reveal = Int(p * Double(points.count))
        guard reveal > 0 else { return }
        for i in 0..<reveal {
            let pt = points[i]
            let zz = pt.z + 0.6
            let sx = cx + CGFloat(pt.x / zz) * f
            let sy = cy - CGFloat((pt.y - 0.75) / zz) * f
            let depth = 1 / zz
            let fresh = i > reveal - 40
            let baseSize = max(0.6, depth * 2.4)
            let r = CGFloat(fresh ? baseSize * 1.8 : baseSize)
            let a = 0.25 + depth * 0.75
            let color: Color = fresh
                ? Color(.sRGB, red: 120 / 255, green: 232 / 255, blue: 238 / 255, opacity: a)
                : Color(
                    .sRGB,
                    red: (90 + depth * 90) / 255,
                    green: (190 + depth * 50) / 255,
                    blue: (200 + depth * 50) / 255,
                    opacity: a * 0.8
                )
            let rect = CGRect(x: sx - r, y: sy - r, width: r * 2, height: r * 2)
            ctx.fill(Path(ellipseIn: rect), with: .color(color))
        }
    }

    // MARK: overlays

    private var topBar: some View {
        VStack {
            HStack {
                Button(action: onFinish) {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(Color(hex: "#080C10").opacity(0.6)))
                }
                Spacer()
                HStack(spacing: 7) {
                    Circle()
                        .fill(T.danger)
                        .frame(width: 8, height: 8)
                        .opacity(pulse ? 0.35 : 1)
                        .animation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true), value: pulse)
                    Text("SCANNING")
                        .font(.system(size: 13, weight: .bold))
                        .tracking(0.3)
                        .foregroundStyle(.white)
                }
                .padding(.vertical, 7)
                .padding(.horizontal, 13)
                .background(Capsule().fill(Color(hex: "#080C10").opacity(0.6)))
                Spacer()
                Color.clear.frame(width: 40, height: 40)
            }
            .padding(.horizontal, 18)
            .padding(.top, 6)

            // project name
            Text(project.name)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.white)
                .shadow(color: .black.opacity(0.6), radius: 6, y: 1)
                .padding(.top, 6)

            Spacer()
        }
    }

    private var cornerBrackets: some View {
        GeometryReader { _ in
            ZStack {
                bracket(top: true, leading: true)
                bracket(top: true, leading: false)
                bracket(top: false, leading: true)
                bracket(top: false, leading: false)
            }
            .padding(.horizontal, 26)
            .padding(.top, 120)
            .padding(.bottom, 226)
        }
        .allowsHitTesting(false)
    }

    private func bracket(top: Bool, leading: Bool) -> some View {
        let color = T.accent.opacity(0.7)
        return ZStack {
            VStack {
                if !top { Spacer() }
                HStack {
                    if !leading { Spacer() }
                    Path { path in
                        let s: CGFloat = 26
                        // vertical leg
                        path.move(to: CGPoint(x: leading ? 0 : s, y: top ? s : 0))
                        path.addLine(to: CGPoint(x: leading ? 0 : s, y: top ? 0 : s))
                        // horizontal leg
                        path.addLine(to: CGPoint(x: leading ? s : 0, y: top ? 0 : s))
                    }
                    .stroke(color, lineWidth: 2)
                    .frame(width: 26, height: 26)
                    if leading { Spacer() }
                }
                if top { Spacer() }
            }
        }
    }

    private var bottomControls: some View {
        VStack {
            Spacer()
            VStack(spacing: 14) {
                // live stats
                HStack(spacing: 10) {
                    statTile("Points", String(format: "%.2fM", progress * DemoData.scanStats.pointsMillions))
                    statTile("Coverage", "\(Int((progress * Double(project.pct)).rounded()))%")
                    statTile("Tracking", "Strong", value: T.accent2)
                }

                // progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.white.opacity(0.14))
                        Capsule()
                            .fill(LinearGradient(colors: [T.accent, T.accent2], startPoint: .leading, endPoint: .trailing))
                            .frame(width: geo.size.width * CGFloat(progress))
                    }
                }
                .frame(height: 6)

                // stop button
                Button(action: onFinish) {
                    ZStack {
                        Circle()
                            .fill(Color(hex: "#080C10").opacity(0.5))
                            .frame(width: 64, height: 64)
                            .overlay(Circle().stroke(Color.white.opacity(0.5), lineWidth: 3))
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .fill(T.danger)
                            .frame(width: 24, height: 24)
                    }
                }
                .padding(.top, 2)
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 22)
        }
    }

    private func statTile(_ label: String, _ value: String, value valueColor: Color = .white) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.white.opacity(0.6))
            Text(value)
                .font(.system(size: 17, weight: .heavy))
                .foregroundStyle(valueColor)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.init(top: 10, leading: 12, bottom: 10, trailing: 12))
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(hex: "#080C10").opacity(0.6))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(T.hairline, lineWidth: 1)
                )
        )
    }
}
