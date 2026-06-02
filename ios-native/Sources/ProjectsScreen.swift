// Projects list — large title, portfolio summary (teal ring + status counts),
// single-select filter chips, and project cards that push to the Report detail.
// Ported from pwa/src/screens/Projects.tsx (ProjectsList).
import SwiftUI

struct ProjectsScreen: View {
    @State private var filter: ProjectFilter = .all

    private var list: [Project] { DemoData.projects.filter { filter.matches($0) } }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    portfolioCard
                        .padding(.horizontal, 20)
                        .padding(.top, 2)
                        .padding(.bottom, 8)

                    FilterChips(
                        items: ProjectFilter.allCases,
                        label: { $0.rawValue },
                        active: $filter
                    )
                    .padding(.bottom, 6)

                    LazyVStack(spacing: 10) {
                        ForEach(list) { project in
                            NavigationLink {
                                ReportDetailScreen(project: project)
                            } label: {
                                ProjectCard(project: project)
                            }
                            .buttonStyle(.plain)
                        }
                        if list.isEmpty {
                            Text("No projects in this filter.")
                                .font(.system(size: 14))
                                .foregroundStyle(T.faint)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 40)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 4)
                    .padding(.bottom, 12)
                }
            }
            .background(T.bg.ignoresSafeArea())
            .navigationTitle("Projects")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Text("\(DemoData.projects.count) projects · Scotland")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(T.muted)
                }
            }
        }
    }

    // Portfolio summary — the teal hero: avg ring + On track / Review / Complete counts.
    private var portfolioCard: some View {
        HStack(spacing: 16) {
            Ring(value: DemoData.portfolioAvg, size: 66, stroke: 6, accent: true, label: "AVG")
            HStack {
                statCount("On track", DemoData.onTrackCount, T.accent)
                Spacer()
                statCount("Review", DemoData.reviewCount, T.warning)
                Spacer()
                statCount("Complete", DemoData.completeCount, T.muted)
            }
        }
        .padding(16)
        .cardSurface()
    }

    private func statCount(_ label: String, _ n: Int, _ color: Color) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("\(n)")
                .font(.system(size: 22, weight: .heavy))
                .foregroundStyle(color)
            Text(label)
                .font(.system(size: 11.5, weight: .semibold))
                .foregroundStyle(T.muted)
        }
    }
}

// MARK: - Project card

struct ProjectCard: View {
    let project: Project

    var body: some View {
        HStack(spacing: 14) {
            Ring(value: project.pct, size: 54)
            VStack(alignment: .leading, spacing: 3) {
                Text(project.name)
                    .font(.system(size: 16, weight: .bold))
                    .tracking(-0.3)
                    .foregroundStyle(T.text)
                    .lineLimit(1)
                Text("\(project.location) · \(project.area) m² · \(project.scans) scans")
                    .font(.system(size: 12.5))
                    .foregroundStyle(T.muted)
                    .lineLimit(1)
                StatusBadge(status: project.status, small: true)
                    .padding(.top, 5)
            }
            Spacer(minLength: 4)
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Color.white.opacity(0.22))
        }
        .padding(13)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface()
    }
}
