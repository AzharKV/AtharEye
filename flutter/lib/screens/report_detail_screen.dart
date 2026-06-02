// Report detail — branded header (teal mark + "AtharEye · PROGRESS REPORT"), the
// hero animated count-up coverage Donut (0→pct over ~1.1s), Covered/Missing m²
// tiles, a meta table, and a coverage-by-room list (grey bars, RED when a room's
// pct < 45). Ports pwa ReportDetail.
import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/bar.dart';
import '../widgets/brand.dart';
import '../widgets/donut.dart';
import '../widgets/status_badge.dart';
import '../widgets/ui.dart';

class ReportDetailScreen extends StatelessWidget {
  const ReportDetailScreen({super.key, required this.project});
  final Project project;

  @override
  Widget build(BuildContext context) {
    final p = project;
    final cov = p.coveredM2;
    final miss = p.missingM2;

    return Scaffold(
      backgroundColor: T.bg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(56),
        child: ClipRect(
          child: Container(
            decoration: const BoxDecoration(
              color: Color(0xD10C0F12), // rgba(12,15,18,0.82)
              border: Border(bottom: BorderSide(color: T.hairline)),
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _RoundIconBtn(
                      icon: Icons.chevron_left,
                      onTap: () => Navigator.of(context).pop(),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Mark(size: 26),
                        SizedBox(width: 9),
                        Wordmark(size: 16, sub: 'PROGRESS REPORT'),
                      ],
                    ),
                    const SizedBox(width: 38),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          // title row
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
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
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Scanned ${p.last} · 2 Jun 2026',
                      style: const TextStyle(fontSize: 12.5, color: T.muted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              StatusBadge(status: p.status),
            ],
          ),
          const SizedBox(height: 16),

          // hero donut card — count-up 0→pct
          AppCard(
            padding: const EdgeInsets.fromLTRB(18, 24, 18, 18),
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [T.surface2, T.surface],
            ),
            child: Column(
              children: [
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: p.pct.toDouble()),
                  duration: const Duration(milliseconds: 1100),
                  curve: Curves.easeOutCubic,
                  builder: (context, value, _) =>
                      Donut(value: value, size: 196, stroke: 18),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: _AreaTile(
                        label: 'Covered',
                        value: '$cov m²',
                        color: T.accent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _AreaTile(
                        label: 'Missing',
                        value: '$miss m²',
                        color: T.danger,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // meta table
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _MetaTable(rows: [
              ('Client', p.client),
              ('Location', p.location),
              ('Floor area', '${p.area} m²'),
              ('BIM model', bimFileFor(p.id)),
              ('Scans', '${p.scans}'),
              ('Alignment', kScanStats.alignment),
              ('Points captured', kScanStats.points),
            ]),
          ),
          const SizedBox(height: 16),

          // coverage by room
          const SectionLabel(label: 'Coverage by area'),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                for (var i = 0; i < p.rooms.length; i++)
                  _RoomRow(room: p.rooms[i], last: i == p.rooms.length - 1),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // CTAs (visual only in this comparison build)
          Row(
            children: [
              const Expanded(
                child: AppButton(
                  label: 'Share report',
                  icon: Icons.ios_share,
                  primary: true,
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                width: 96,
                child: AppButton(
                  label: 'PDF',
                  icon: Icons.picture_as_pdf_outlined,
                  expand: false,
                  onTap: () {},
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AreaTile extends StatelessWidget {
  const _AreaTile({
    required this.label,
    required this.value,
    required this.color,
  });
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08), // ~ c14 tint
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: color.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: T.muted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetaTable extends StatelessWidget {
  const _MetaTable({required this.rows});
  final List<(String, String)> rows;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < rows.length; i++)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 11),
            decoration: BoxDecoration(
              border: i < rows.length - 1
                  ? const Border(bottom: BorderSide(color: T.hairline2))
                  : null,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  rows[i].$1,
                  style: const TextStyle(
                    fontSize: 14,
                    color: T.muted,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Flexible(
                  child: Text(
                    rows[i].$2,
                    textAlign: TextAlign.right,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      color: T.text,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _RoomRow extends StatelessWidget {
  const _RoomRow({required this.room, required this.last});
  final Room room;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final behind = room.pct < 45;
    final color = behind ? T.danger : T.text;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 11),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: T.hairline2)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 104,
            child: Text(
              room.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Bar(
              value: room.pct.toDouble(),
              color: behind ? T.danger : T.bar,
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 40,
            child: Text(
              '${room.pct}%',
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoundIconBtn extends StatelessWidget {
  const _RoundIconBtn({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: const Color(0x0FFFFFFF), // rgba(255,255,255,0.06)
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: T.hairline),
        ),
        child: Icon(icon, size: 20, color: T.text),
      ),
    );
  }
}
