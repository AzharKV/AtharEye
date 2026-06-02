// Projects list — large title, portfolio summary (teal AVG ring + status counts),
// single-select filter chips with live filtering, and project cards (mini ring +
// name + "{location} · {area} m² · {scans} scans" + status badge + chevron).
// Tapping a card pushes the Report detail. Ports pwa ProjectsList.
import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/ring.dart';
import '../widgets/status_badge.dart';
import '../widgets/ui.dart';
import 'report_detail_screen.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  String _filter = 'All';

  List<Project> get _list => kProjects.where((p) {
    switch (_filter) {
      case 'On site':
        return p.status != 'Complete';
      case 'Needs review':
        return p.status == 'Needs Review';
      case 'Complete':
        return p.status == 'Complete';
      default:
        return true;
    }
  }).toList();

  @override
  Widget build(BuildContext context) {
    final avg = portfolioAvg(kProjects);
    final onTrack = kProjects.where((p) => p.status == 'On Track').length;
    final review = kProjects.where((p) => p.status == 'Needs Review').length;
    final done = kProjects.where((p) => p.status == 'Complete').length;
    final list = _list;

    return SafeArea(
      bottom: false,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: ScreenHeader(
              title: 'Projects',
              sub: '${kProjects.length} projects · Scotland',
            ),
          ),

          // portfolio summary — the screen's teal hero
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 2, 20, 8),
              child: AppCard(
                child: Row(
                  children: [
                    Ring(
                      value: avg.toDouble(),
                      size: 66,
                      stroke: 6,
                      accent: true,
                      label: 'AVG',
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _countCell('On track', onTrack, T.accent),
                          _countCell('Review', review, T.warning),
                          _countCell('Complete', done, T.muted),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 4, bottom: 10),
              child: Chips(
                items: const ['All', 'On site', 'Needs review', 'Complete'],
                active: _filter,
                onPick: (v) => setState(() => _filter = v),
              ),
            ),
          ),

          if (list.isEmpty)
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: Center(
                  child: Text(
                    'No projects in this filter.',
                    style: TextStyle(color: T.faint, fontSize: 14),
                  ),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
              sliver: SliverList.separated(
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, i) => _ProjectCard(project: list[i]),
              ),
            ),
        ],
      ),
    );
  }

  Widget _countCell(String label, int n, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '$n',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: T.muted,
          ),
        ),
      ],
    );
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    final p = project;
    return AppCard(
      padding: const EdgeInsets.all(13),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ReportDetailScreen(project: p)),
      ),
      child: Row(
        children: [
          Ring(value: p.pct.toDouble(), size: 54),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  p.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${p.location} · ${p.area} m² · ${p.scans} scans',
                  style: const TextStyle(fontSize: 12.5, color: T.muted),
                ),
                const SizedBox(height: 8),
                StatusBadge(status: p.status, small: true),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, size: 20, color: Color(0x38FFFFFF)),
        ],
      ),
    );
  }
}
