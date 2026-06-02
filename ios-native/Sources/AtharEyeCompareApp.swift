// Athar Eye — native SwiftUI comparison app. @main entry + the dark tab shell.
// A focused visual/performance comparison port of the PWA (3 hero screens + 2 stubs),
// to weigh native SwiftUI feel against the React Native and Flutter ports.
import SwiftUI

@main
struct AtharEyeCompareApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
                .preferredColorScheme(.dark)        // dark only
                .tint(T.accent)
        }
    }
}

/// Bottom tab bar: Projects · Reports · [center teal Scan] · Settings.
/// Selecting the centre Scan item does not switch tabs — it presents the
/// immersive scan as a full-screen cover (matching the PWA tab-bar behaviour).
struct RootTabView: View {
    enum Tab: Hashable { case projects, reports, scan, settings }

    @State private var selection: Tab = .projects
    @State private var showScan = false

    init() {
        // Opaque navy tab bar — no translucency, no fake status bar.
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(T.bg)
        appearance.shadowColor = UIColor(T.hairline)
        let items = appearance.stackedLayoutAppearance
        items.normal.iconColor = UIColor(T.faint)
        items.normal.titleTextAttributes = [.foregroundColor: UIColor(T.faint)]
        items.selected.iconColor = UIColor(T.accent)
        items.selected.titleTextAttributes = [.foregroundColor: UIColor(T.accent)]
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance

        // Opaque navy nav bars with white large titles.
        let nav = UINavigationBarAppearance()
        nav.configureWithOpaqueBackground()
        nav.backgroundColor = UIColor(T.bg)
        nav.shadowColor = .clear
        nav.titleTextAttributes = [.foregroundColor: UIColor(T.text)]
        nav.largeTitleTextAttributes = [.foregroundColor: UIColor(T.text)]
        UINavigationBar.appearance().standardAppearance = nav
        UINavigationBar.appearance().scrollEdgeAppearance = nav
        UINavigationBar.appearance().compactAppearance = nav
    }

    var body: some View {
        TabView(selection: $selection) {
            ProjectsScreen()
                .tabItem { Label("Projects", systemImage: "square.grid.2x2.fill") }
                .tag(Tab.projects)

            StubScreen(
                title: "Reports",
                subtitle: "Latest scan reports",
                icon: "doc.text.fill",
                note: "Open a project on the Projects tab to see its full report — the hero screen in this comparison build."
            )
            .tabItem { Label("Reports", systemImage: "doc.text.fill") }
            .tag(Tab.reports)

            // Centre Scan placeholder — intercepted below to present the scan cover.
            Color.clear
                .tabItem { ScanTabLabel() }
                .tag(Tab.scan)

            StubScreen(
                title: "Settings",
                subtitle: DemoData.user.region,
                icon: "gearshape.fill",
                note: "\(DemoData.user.name) · \(DemoData.user.role) · \(DemoData.user.company). Settings, profile and plans are out of scope for this comparison build."
            )
            .tabItem { Label("Settings", systemImage: "gearshape.fill") }
            .tag(Tab.settings)
        }
        .onChange(of: selection) { _, newValue in
            if newValue == .scan {
                selection = .projects     // never actually land on the empty Scan tab
                showScan = true
            }
        }
        .fullScreenCover(isPresented: $showScan) {
            ScanActiveScreen { showScan = false }
        }
    }
}

/// The centre tab's label — a raised teal scan disc.
struct ScanTabLabel: View {
    var body: some View {
        Label {
            Text("Scan")
        } icon: {
            Image(systemName: "viewfinder")
        }
    }
}

// MARK: - Simple stub screens (Reports / Settings are not the comparison focus)

struct StubScreen: View {
    let title: String
    let subtitle: String
    let icon: String
    let note: String

    var body: some View {
        NavigationStack {
            ZStack {
                T.bg.ignoresSafeArea()
                VStack(spacing: 16) {
                    Spacer()
                    ZStack {
                        Circle()
                            .fill(T.accent.opacity(0.12))
                            .frame(width: 76, height: 76)
                        Image(systemName: icon)
                            .font(.system(size: 30, weight: .regular))
                            .foregroundStyle(T.accent)
                    }
                    Text(subtitle)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(T.text)
                    Text(note)
                        .font(.system(size: 13.5))
                        .foregroundStyle(T.muted)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                        .frame(maxWidth: 300)
                    Spacer()
                    Spacer()
                }
                .padding(.horizontal, 32)
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
