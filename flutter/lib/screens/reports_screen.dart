// Reports tab — a simple stub list (the comparison focus is the 3 hero screens;
// the report DETAIL is the hero and is reachable from both here and Projects).
// Each row taps through to the animated ReportDetail.
import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/status_badge.dart';
import '../widgets/ui.dart';
import 'report_detail_screen.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 16),
        children: [
          const ScreenHeader(title: 'Reports', sub: 'Latest scan reports'),
          const SizedBox(height: 4),
          for (final p in kProjects)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
              child: AppCard(
                padding: const EdgeInsets.all(14),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ReportDetailScreen(project: p),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            p.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15.5,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            'Scanned ${p.last} · ${p.area} m²',
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: T.muted,
                            ),
                          ),
                          const SizedBox(height: 8),
                          StatusBadge(status: p.status, small: true),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        RichText(
                          text: TextSpan(
                            text: '${p.pct}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: T.accent,
                              letterSpacing: -0.5,
                            ),
                            children: const [
                              TextSpan(
                                text: '%',
                                style: TextStyle(fontSize: 12, color: T.muted),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Icon(
                          Icons.chevron_right,
                          size: 16,
                          color: Color(0x38FFFFFF),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
